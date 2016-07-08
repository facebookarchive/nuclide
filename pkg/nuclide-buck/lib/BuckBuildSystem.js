'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BuildEvent, Task, TaskInfo} from '../../nuclide-build/lib/types';
import type {Level, Message} from '../../nuclide-console/lib/types';
import type {BuckProject} from '../../nuclide-buck-base';
import type {BuckSubcommand, SerializedState, TaskType} from './types';
import type {BuckEvent} from './BuckEventStream';

import invariant from 'assert';
import {Observable, Subject} from 'rxjs';
import {CompositeDisposable} from 'atom';
import {Dispatcher} from 'flux';
import {quote} from 'shell-quote';

import {DisposableSubscription} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {observableToBuildTaskInfo} from '../../commons-node/observableToBuildTaskInfo';
import {createBuckProject} from '../../nuclide-buck-base';
import {getLogger} from '../../nuclide-logging';
import {startPackager} from '../../nuclide-react-native/lib/packager/startPackager';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {BuckIcon} from './ui/BuckIcon';
import BuckToolbarStore from './BuckToolbarStore';
import BuckToolbarActions from './BuckToolbarActions';
import {createExtraUiComponent} from './ui/createExtraUiComponent';
import {
  combineEventStreams,
  getEventsFromSocket,
  getEventsFromProcess,
} from './BuckEventStream';

const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

type Flux = {
  actions: BuckToolbarActions;
  store: BuckToolbarStore;
};

export class BuckBuildSystem {
  _flux: ?Flux;
  _disposables: CompositeDisposable;
  _extraUi: ?ReactClass<any>;
  id: string;
  name: string;
  _initialState: ?SerializedState;
  _tasks: Observable<Array<Task>>;
  _outputMessages: Subject<Message>;

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
    const allEnabled = store.getCurrentBuckRoot() != null && Boolean(store.getBuildTarget());
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

  updateCwd(path: string): void {
    this._getFlux().actions.updateProjectPath(path);
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
    const taskInfo = observableToBuildTaskInfo(resultStream);
    invariant(taskInfo.observeProgress != null);
    return {
      // Flow can't check ...taskInfo due to the optional args.
      observeProgress: taskInfo.observeProgress,
      onDidComplete: taskInfo.onDidComplete,
      onDidError: taskInfo.onDidError,
      cancel: () => {
        this._logOutput('Build cancelled.', 'warning');
        taskInfo.cancel();
      },
      getTrackingData: () => {
        const {store} = this._getFlux();
        return {
          buckRoot: store.getCurrentBuckRoot(),
          buildTarget: store.getBuildTarget(),
          taskSettings: store.getTaskSettings(),
        };
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
      taskSettings: store.getTaskSettings(),
    };
  }

  _runTaskType(taskType: TaskType): Observable<BuildEvent> {
    const {store} = this._getFlux();
    const buckRoot = store.getCurrentBuckRoot();
    const buildTarget = store.getBuildTarget();
    if (buckRoot == null || buildTarget == null) {
      // All tasks should have been disabled.
      return Observable.empty();
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');
    const settings = store.getTaskSettings()[taskType] || {};

    const subcommand = taskType === 'run' || taskType === 'debug' ? 'install' : taskType;
    let argString = '';
    if (settings.arguments != null && settings.arguments.length > 0) {
      argString = ' ' + quote(settings.arguments);
    }
    this._logOutput(`Starting "buck ${subcommand} ${buildTarget}${argString}"`, 'log');

    const buckProject = createBuckProject(buckRoot);
    return Observable.fromPromise(buckProject.getHTTPServerPort())
      .catch(err => {
        getLogger().warn(`Failed to get httpPort for ${buildTarget}`, err);
        return Observable.of(-1);
      })
      .switchMap(httpPort => {
        let socketEvents = null;
        if (httpPort > 0) {
          socketEvents = getEventsFromSocket(buckProject.getWebSocketStream(httpPort))
            .share();
        } else {
          this._logOutput('Enable httpserver in your .buckconfig for better output.', 'warning');
        }

        const processEvents = this._runBuckCommand(
          buckProject,
          buildTarget,
          subcommand,
          settings.arguments || [],
          taskType === 'debug',
        );

        let mergedEvents;
        if (socketEvents == null) {
          // Without a websocket, just pipe the Buck output directly.
          mergedEvents = processEvents;
        } else {
          mergedEvents = combineEventStreams(subcommand, socketEvents, processEvents);
        }

        return mergedEvents
          .switchMap(event => {
            if (event.type === 'progress') {
              return Observable.of({
                kind: 'progress',
                progress: event.progress,
              });
            } else if (event.type === 'log') {
              this._logOutput(event.message, event.level);
            }
            return Observable.empty();
          });
      })
      .finally(() => buckProject.dispose())
      .share();
  }

  _runBuckCommand(
    buckProject: BuckProject,
    buildTarget: string,
    subcommand: BuckSubcommand,
    args: Array<string>,
    debug: boolean,
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
      let rnObservable = Observable.empty();
      const isReactNativeServerMode = store.isReactNativeServerMode();
      if (isReactNativeServerMode) {
        rnObservable = Observable.concat(
          Observable.fromPromise(startPackager()),
          Observable.defer(() => {
            atom.commands.dispatch(
              atom.views.getView(atom.workspace),
              'nuclide-react-native:start-debugging',
            );
            return Observable.empty();
          }),
        )
          .ignoreElements();
      }
      buckObservable = rnObservable.concat(
        buckProject.installWithOutput(
          [buildTarget],
          args.concat(
            isReactNativeServerMode ? ['--', '-executor-override', 'RCTWebSocketExecutor'] : [],
          ),
          store.getSimulator(),
          {
            run: true,
            debug,
          },
        ),
      );
    } else if (subcommand === 'build') {
      buckObservable = buckProject.buildWithOutput([buildTarget], args);
    } else if (subcommand === 'test') {
      buckObservable = buckProject.testWithOutput([buildTarget], args);
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

}

// Make sure that TaskType reflects the types listed below.
const TASKS = [
  {
    type: 'build',
    label: 'Build',
    description: 'Build the specified Buck target',
    enabled: true,
    icon: 'tools',
  },
  {
    type: 'run',
    label: 'Run',
    description: 'Run the specfied Buck target',
    enabled: true,
    icon: 'triangle-right',
  },
  {
    type: 'test',
    label: 'Test',
    description: 'Test the specfied Buck target',
    enabled: true,
    icon: 'checklist',
  },
  {
    type: 'debug',
    label: 'Debug',
    description: 'Debug the specfied Buck target',
    enabled: true,
    icon: 'plug',
  },
];
