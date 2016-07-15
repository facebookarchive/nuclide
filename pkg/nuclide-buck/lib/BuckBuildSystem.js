'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessMessage} from '../../commons-node/process-types';
import type {Directory, Task, TaskEvent, TaskInfo} from '../../nuclide-task-runner/lib/types';
import type {Level, Message} from '../../nuclide-console/lib/types';
import type {BuckProject} from '../../nuclide-buck-base';
import type {BuckSubcommand, SerializedState, TaskType} from './types';

import invariant from 'assert';
import {Observable, Subject} from 'rxjs';
import {CompositeDisposable} from 'atom';
import {Dispatcher} from 'flux';
import {quote} from 'shell-quote';

import {DisposableSubscription} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {observableToTaskInfo} from '../../commons-node/observableToTaskInfo';
import {createBuckProject} from '../../nuclide-buck-base';
import {getLogger} from '../../nuclide-logging';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {startPackager} from '../../nuclide-react-native/lib/packager/startPackager';
import {BuckIcon} from './ui/BuckIcon';
import BuckToolbarStore from './BuckToolbarStore';
import BuckToolbarActions from './BuckToolbarActions';
import {createExtraUiComponent} from './ui/createExtraUiComponent';
import {
  combineEventStreams,
  getEventsFromSocket,
  getEventsFromProcess,
} from './BuckEventStream';
import {
  getLLDBBuildEvents,
  getLLDBInstallEvents,
} from './LLDBEventStream';

type Flux = {
  actions: BuckToolbarActions;
  store: BuckToolbarStore;
};

function shouldEnableTask(taskType: TaskType, store: BuckToolbarStore): boolean {
  switch (taskType) {
    case 'run':
      return store.isInstallableRule();
    case 'debug':
      return store.isDebuggableRule();
    default:
      return true;
  }
}

function getSubcommand(taskType: TaskType, store: BuckToolbarStore): BuckSubcommand {
  switch (taskType) {
    case 'run':
      return 'install';
    case 'debug':
      // For mobile builds, install the build on the device.
      // Otherwise, run a regular build and invoke the debugger on the output.
      return store.isInstallableRule() ? 'install' : 'build';
    default:
      return taskType;
  }
}

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
    const buckRoot = store.getCurrentBuckRoot();

    // If this isn't a buck project, there are no tasks.
    if (buckRoot == null) {
      return [];
    }

    const hasBuildTarget = Boolean(store.getBuildTarget());
    return TASKS
      .map(task => ({
        ...task,
        enabled: hasBuildTarget && shouldEnableTask(task.type, store),
      }));
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

  setProjectRoot(projectRoot: ?Directory): void {
    const path = projectRoot == null ? null : projectRoot.getPath();
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
    const taskInfo = observableToTaskInfo(resultStream);
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

  _runTaskType(taskType: TaskType): Observable<TaskEvent> {
    const {store} = this._getFlux();
    const buckRoot = store.getCurrentBuckRoot();
    const buildTarget = store.getBuildTarget();
    if (buckRoot == null || buildTarget == null) {
      // All tasks should have been disabled.
      return Observable.empty();
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');
    const settings = store.getTaskSettings()[taskType] || {};

    const subcommand = getSubcommand(taskType, store);
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

        const isDebug = taskType === 'debug';
        const processMessages = this._runBuckCommand(
          buckProject,
          buildTarget,
          subcommand,
          settings.arguments || [],
          isDebug,
        ).share();
        const processEvents = getEventsFromProcess(processMessages).share();

        let mergedEvents;
        if (socketEvents == null) {
          // Without a websocket, just pipe the Buck output directly.
          mergedEvents = processEvents;
        } else {
          mergedEvents = combineEventStreams(subcommand, socketEvents, processEvents);
        }

        return Observable.merge(
          mergedEvents,
          isDebug && subcommand === 'install' ? getLLDBInstallEvents(
            processMessages,
            buckProject,
          ) : Observable.empty(),
          isDebug && subcommand === 'build' ? getLLDBBuildEvents(
            processMessages,
            buckProject,
            buildTarget,
          ) : Observable.empty(),
        )
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
  ): Observable<ProcessMessage> {
    const {store} = this._getFlux();

    if (debug) {
      // Stop any existing debugging sessions, as install hangs if an existing
      // app that's being overwritten is being debugged.
      atom.commands.dispatch(
        atom.views.getView(atom.workspace),
        'nuclide-debugger:stop-debugging');
    }

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
      return rnObservable.concat(
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
      return buckProject.buildWithOutput([buildTarget], args);
    } else if (subcommand === 'test') {
      return buckProject.testWithOutput([buildTarget], args);
    } else {
      throw Error(`Unknown subcommand: ${subcommand}`);
    }
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
