'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Task, TaskInfo} from '../../nuclide-build/lib/types';
import type {Level, Message} from '../../nuclide-console/lib/types';
import type {BuckProject} from '../../nuclide-buck-base';
import type {SerializedState} from './types';
import type {BuckEvent} from './BuckEventStream';

import invariant from 'assert';
import {Observable, Subject} from 'rxjs';
import {CompositeDisposable} from 'atom';
import {Dispatcher} from 'flux';
import nuclideUri from '../../nuclide-remote-uri';

import {DisposableSubscription} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {getLogger} from '../../nuclide-logging';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {BuckIcon} from './ui/BuckIcon';
import BuckToolbarStore from './BuckToolbarStore';
import BuckToolbarActions from './BuckToolbarActions';
import {createExtraUiComponent} from './ui/createExtraUiComponent';
import {getEventsFromSocket, getEventsFromProcess, isBuildFinishEvent} from './BuckEventStream';

import ReactNativeServerManager from './ReactNativeServerManager';
import ReactNativeServerActions from './ReactNativeServerActions';

const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;
const REACT_NATIVE_APP_FLAGS = [
  '-executor-override', 'RCTWebSocketExecutor',
  '-websocket-executor-name', 'Nuclide',
  '-websocket-executor-port', '8090',
];

type Flux = {
  actions: BuckToolbarActions;
  store: BuckToolbarStore;
};

type TaskType = 'build' | 'test' | 'run' | 'debug';
type BuckSubcommand = 'build' | 'install' | 'test';

export class BuckBuildSystem {
  _flux: ?Flux;
  _disposables: CompositeDisposable;
  _extraUi: ?ReactClass<any>;
  id: string;
  name: string;
  _initialState: ?SerializedState;
  _tasks: Observable<Array<Task>>;
  _outputMessages: Subject<Message>;

  // React Native server state.
  _reactNativeServerActions: ?ReactNativeServerActions;
  _reactNativeServerManager: ?ReactNativeServerManager;

  constructor(initialState: ?SerializedState) {
    this.id = 'buck';
    this.name = 'Buck';
    this._initialState = initialState;
    this._disposables = new CompositeDisposable();
    this._outputMessages = new Subject();
    this._disposables.add(new DisposableSubscription(this._outputMessages));
  }

  getTasks() {
    const {store} = this._getFlux();
    const allEnabled = store.getMostRecentBuckProject() != null &&
      Boolean(store.getBuildTarget());
    return TASKS
      .map(task => {
        let enabled = allEnabled;
        if (task.type === 'run' || task.type === 'debug') {
          enabled = enabled && store.isInstallableRule();
        }
        return {
          ...task,
          enabled,
        };
      });
  }

  observeTasks(cb: (tasks: Array<Task>) => mixed): IDisposable {
    if (this._tasks == null) {
      const {store} = this._getFlux();
      this._tasks = Observable.concat(
        Observable.of(this.getTasks()),
        observableFromSubscribeFunction(store.subscribe.bind(store))
          .map(() => this.getTasks()),
      );
    }
    return new DisposableSubscription(
      this._tasks.subscribe({next: cb})
    );
  }

  getExtraUi(): ReactClass<any> {
    if (this._extraUi == null) {
      const {store, actions} = this._getFlux();
      this._extraUi = createExtraUiComponent(store, actions);
    }
    return this._extraUi;
  }

  getIcon(): ReactClass<any> {
    return BuckIcon;
  }

  getOutputMessages(): Observable<Message> {
    return this._outputMessages;
  }

  _logOutput(text: string, level: Level) {
    this._outputMessages.next({text, level});
  }

  /**
   * Lazily create the flux stuff.
   */
  _getFlux(): Flux {
    if (this._flux == null) {
      // Set up flux stuff.
      const dispatcher = new Dispatcher();
      const store = new BuckToolbarStore(dispatcher, this._initialState);
      const actions = new BuckToolbarActions(dispatcher, store);
      this._disposables.add(store);
      this._flux = {store, actions};
    }
    return this._flux;
  }

  runTask(taskType: string): TaskInfo {
    invariant(
      taskType === 'build' || taskType === 'test' ||
      taskType === 'run' || taskType === 'debug',
      'Invalid task type',
    );

    const resultStream = this._runTaskType(taskType);
    return {
      cancel() {
        // FIXME: How can we cancel Buck tasks?
      },
      observeProgress(cb) {
        return new DisposableSubscription(
          resultStream.subscribe({next: cb, error: () => {}})
        );
      },
      onDidError(cb) {
        return new DisposableSubscription(
          resultStream.subscribe({error: cb})
        );
      },
      onDidComplete(cb) {
        return new DisposableSubscription(
          // Add an empty error handler to avoid the "Unhandled Error" message. (We're handling it
          // above via the onDidError interface.)
          resultStream.subscribe({complete: cb, error: () => {}})
        );
      },
    };
  }

  dispose(): void {
    this._disposables.dispose();
  }

  serialize(): ?SerializedState {
    // If we haven't had to load and create the Flux stuff yet, don't do it now.
    if (this._flux == null) {
      return;
    }
    const {store} = this._flux;
    return {
      buildTarget: store.getBuildTarget(),
      isReactNativeServerMode: store.isReactNativeServerMode(),
    };
  }

  _runTaskType(taskType: TaskType): Observable<?number> {
    const {store} = this._getFlux();
    const buckProject = store.getMostRecentBuckProject();
    const buildTarget = store.getBuildTarget();
    if (buckProject == null || buildTarget == null) {
      // All tasks should have been disabled.
      return Observable.empty();
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');

    const subcommand = taskType === 'run' || taskType === 'debug' ? 'install' : taskType;
    this._logOutput(`Starting "buck ${subcommand} ${buildTarget}"`, 'log');

    return Observable.fromPromise(buckProject.getHTTPServerPort())
      .catch(err => {
        getLogger().warn(`Failed to get httpPort for ${buildTarget}`, err);
        return Observable.of(-1);
      })
      .switchMap(httpPort => {
        let socketStream = Observable.empty();
        if (httpPort > 0) {
          socketStream = getEventsFromSocket(buckProject.getWebSocketStream(httpPort))
            .share();
        } else {
          this._logOutput('Enable httpserver in your .buckconfig for better output.', 'warning');
        }

        const buckObservable = this._runBuckCommand(
          buckProject,
          buildTarget,
          subcommand,
          taskType === 'debug',
          httpPort < 0,
        );

        let eventStream;
        if (httpPort <= 0) {
          // Without a websocket, just pipe the Buck output directly.
          eventStream = buckObservable;
        } else {
          eventStream = socketStream.merge(
            // Skip everything from Buck's output until the first non-log message.
            // We ensure that error/info logs will not duplicate messages from the websocket.
            // $FlowFixMe: add skipWhile to flow-typed rx definitions
            buckObservable.skipWhile(event => event.type !== 'log' || event.level === 'log')
          );
          if (taskType === 'test') {
            // The websocket does not reliably provide test output.
            // After the build finishes, fall back to the Buck output stream.
            eventStream = eventStream
              .takeUntil(socketStream.filter(isBuildFinishEvent))
              .concat(buckObservable);
          } else if (subcommand === 'install') {
            // Add a message indicating that install has started after build completes.
            // The websocket does not naturally provide any indication.
            eventStream = eventStream.merge(
              socketStream.switchMap(event => {
                if (isBuildFinishEvent(event)) {
                  return Observable.of({
                    type: 'log',
                    message: 'Installing...',
                    level: 'info',
                  });
                }
                return Observable.empty();
              })
            );
          }
        }

        return eventStream
          .switchMap(event => {
            if (event.type === 'progress') {
              return Observable.of(event.progress);
            } else if (event.type === 'log') {
              this._logOutput(event.message, event.level);
            }
            return Observable.empty();
          })
          .takeUntil(
            buckObservable
              .ignoreElements()
              // Despite the docs, takeUntil doesn't respond to completion.
              .concat(Observable.of(null))
          );
      })
      .share();
  }

  _runBuckCommand(
    buckProject: BuckProject,
    buildTarget: string,
    subcommand: BuckSubcommand,
    debug: boolean,
    logOutput: boolean,
  ): Observable<BuckEvent> {
    const {store} = this._getFlux();

    if (debug) {
      // Stop any existing debugging sessions, as install hangs if an existing
      // app that's being overwritten is being debugged.
      atom.commands.dispatch(
        atom.views.getView(atom.workspace),
        'nuclide-debugger:stop-debugging');
    }

    let buckObservable;
    if (subcommand === 'install') {
      let appArgs = [];
      let rnObservable = Observable.empty();
      if (store.isReactNativeServerMode()) {
        rnObservable = Observable.fromPromise(
          this._getReactNativeServerCommand(buckProject),
        ).map(serverCommand => {
          if (serverCommand) {
            const rnActions = this._getReactNativeServerActions();
            rnActions.startServer(serverCommand);
            rnActions.startNodeExecutorServer();
            appArgs = REACT_NATIVE_APP_FLAGS;
          }
        }).ignoreElements();
      }
      buckObservable = rnObservable.concat(
        buckProject.installWithOutput(
          [buildTarget],
          store.getSimulator(),
          {run: true, debug, appArgs},
        ),
      );
    } else if (subcommand === 'build') {
      buckObservable = buckProject.buildWithOutput([buildTarget]);
    } else if (subcommand === 'test') {
      buckObservable = buckProject.testWithOutput([buildTarget]);
    } else {
      throw Error(`Unknown subcommand: ${subcommand}`);
    }

    let lldbPid;
    return getEventsFromProcess(buckObservable)
      .do({
        next: event => {
          // For debug builds, watch for the lldb process ID.
          if (debug && event.type === 'log') {
            const pidMatch = event.message.match(LLDB_PROCESS_ID_REGEX);
            if (pidMatch != null) {
              lldbPid = parseInt(pidMatch[1], 10);
            }
          }
        },
        complete: async () => {
          if (lldbPid != null) {
            // Use commands here to trigger package activation.
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
            const debuggerService = await consumeFirstProvider('nuclide-debugger.remote');
            const buckProjectPath = await buckProject.getPath();
            debuggerService.debugLLDB(lldbPid, buckProjectPath);
          }
        },
      })
      .share();
  }

  async _getReactNativeServerCommand(buckProject: BuckProject): Promise<?string> {
    const serverCommand = await buckProject.getBuckConfig('react-native', 'server');
    if (serverCommand == null) {
      return null;
    }
    const repoRoot = await buckProject.getPath();
    if (repoRoot == null) {
      return null;
    }
    return nuclideUri.join(repoRoot, serverCommand);
  }

  _getReactNativeServerActions(): ReactNativeServerActions {
    if (this._reactNativeServerActions != null) {
      return this._reactNativeServerActions;
    }

    const dispatcher = new Dispatcher();
    const actions = new ReactNativeServerActions(dispatcher);
    this._reactNativeServerActions = actions;
    this._reactNativeServerManager = new ReactNativeServerManager(dispatcher, actions);
    this._disposables.add(this._reactNativeServerManager);
    return actions;
  }

}

const TASKS = [
  {
    type: 'build',
    label: 'Build',
    description: 'Build the specified Buck target',
    enabled: true,
    cancelable: false,
    icon: 'tools',
  },
  {
    type: 'run',
    label: 'Run',
    description: 'Run the specfied Buck target',
    enabled: true,
    cancelable: false,
    icon: 'triangle-right',
  },
  {
    type: 'test',
    label: 'Test',
    description: 'Test the specfied Buck target',
    enabled: true,
    cancelable: false,
    icon: 'checklist',
  },
  {
    type: 'debug',
    label: 'Debug',
    description: 'Debug the specfied Buck target',
    enabled: true,
    cancelable: false,
    icon: 'plug',
  },
];
