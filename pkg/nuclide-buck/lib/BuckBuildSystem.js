'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BuckWebSocketMessage} from '../../nuclide-buck-base/lib/BuckProject';
import type {Task, TaskInfo} from '../../nuclide-build/lib/types';
import type {Message} from '../../nuclide-console/lib/types';
import type {BuckProject} from '../../nuclide-buck-base';
import type {SerializedState} from './types';

import invariant from 'assert';
import {Observable, Subject} from 'rxjs';
import {CompositeDisposable} from 'atom';
import {Dispatcher} from 'flux';
import path from 'path';

import {DisposableSubscription} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {getLogger} from '../../nuclide-logging';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import {BuckIcon} from './ui/BuckIcon';
import BuckToolbarStore from './BuckToolbarStore';
import BuckToolbarActions from './BuckToolbarActions';
import {createExtraUiComponent} from './ui/createExtraUiComponent';

import ReactNativeServerManager from './ReactNativeServerManager';
import ReactNativeServerActions from './ReactNativeServerActions';
import runBuckCommandInNewPane from './runBuckCommandInNewPane';

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
  _extraUi: ?ReactClass;
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

  getExtraUi(): ReactClass {
    if (this._extraUi == null) {
      const {store, actions} = this._getFlux();
      this._extraUi = createExtraUiComponent(store, actions);
    }
    return this._extraUi;
  }

  getIcon(): ReactClass {
    return BuckIcon;
  }

  getOutputMessages(): Observable<Message> {
    return this._outputMessages;
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

    const subcommand = taskType === 'run' || taskType === 'debug' ? 'install' : taskType;
    return Observable.fromPromise(buckProject.getHTTPServerPort())
      .catch(err => {
        getLogger().warn(`Failed to get httpPort for ${buildTarget}`, err);
        return Observable.of(-1);
      })
      .flatMap(httpPort => {
        let socketStream = Observable.empty();
        if (httpPort > 0) {
          socketStream = buckProject.getWebSocketStream(httpPort)
            .flatMap((message: BuckWebSocketMessage) => {
              switch (message.type) {
                case 'BuildProgressUpdated':
                  return Observable.of(message.progressValue);
              }
              return Observable.empty();
            })
            .catch(err => {
              getLogger().error(`Got Buck websocket error building ${buildTarget}`, err);
              // Return to indeterminate progress.
              return Observable.of(null);
            });
        }
        const buckObservable = Observable.fromPromise(
          this._runBuckCommand(buckProject, buildTarget, subcommand, taskType === 'debug'),
        );
        return socketStream
          .merge(buckObservable)
          .takeUntil(buckObservable);
      })
      .share();
  }

  async _runBuckCommand(
    buckProject: BuckProject,
    buildTarget: string,
    subcommand: BuckSubcommand,
    debug: boolean,
  ): Promise<void> {
    const {store} = this._getFlux();

    let appArgs = [];
    if (subcommand === 'install' && store.isReactNativeServerMode()) {
      const serverCommand = await this._getReactNativeServerCommand(buckProject);
      if (serverCommand) {
        const rnActions = this._getReactNativeServerActions();
        rnActions.startServer(serverCommand);
        rnActions.startNodeExecutorServer();
        appArgs = REACT_NATIVE_APP_FLAGS;
      }
    }

    if (debug) {
      // Stop any existing debugging sessions, as install hangs if an existing
      // app that's being overwritten is being debugged.
      atom.commands.dispatch(
        atom.views.getView(atom.workspace),
        'nuclide-debugger:stop-debugging');
    }

    const result = await runBuckCommandInNewPane({
      buckProject,
      buildTarget,
      simulator: store.getSimulator(),
      subcommand,
      debug,
      appArgs,
    });

    if (debug && result != null && result.pid != null) {
      // Use commands here to trigger package activation.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      const debuggerService = await consumeFirstProvider('nuclide-debugger.remote');
      const buckProjectPath = await buckProject.getPath();
      debuggerService.debugLLDB(result.pid, buckProjectPath);
    }
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
    return path.join(repoRoot, serverCommand);
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
