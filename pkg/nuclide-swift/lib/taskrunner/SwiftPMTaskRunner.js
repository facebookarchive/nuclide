'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Directory, Task, TaskMetadata} from '../../../nuclide-task-runner/lib/types';
import type {Level, Message} from '../../../nuclide-console/lib/types';
import type {SwiftPMTaskRunnerStoreState} from './SwiftPMTaskRunnerStoreState';

import invariant from 'assert';
import {Observable, Subject} from 'rxjs';
import {Dispatcher} from 'flux';
import {CompositeDisposable, Disposable} from 'atom';
import {React} from 'react-for-atom';
import {DisposableSubscription} from '../../../commons-node/stream';
import fsPromise from '../../../commons-node/fsPromise';
import {observeProcess, safeSpawn} from '../../../commons-node/process';
import {observableToTaskInfo} from '../../../commons-node/observableToTaskInfo';
import SwiftPMTaskRunnerStore from './SwiftPMTaskRunnerStore';
import SwiftPMTaskRunnerActions from './SwiftPMTaskRunnerActions';
import {buildCommand, testCommand} from './SwiftPMTaskRunnerCommands';
import {
  SwiftPMTaskRunnerBuildTaskMetadata,
  SwiftPMTaskRunnerTestTaskMetadata,
  SwiftPMTaskRunnerTaskMetadata,
} from './SwiftPMTaskRunnerTaskMetadata';
import SwiftPMTaskRunnerToolbar from './toolbar/SwiftPMTaskRunnerToolbar';
import {SwiftIcon} from '../ui/SwiftIcon';

/**
 * nuclide-swift makes use of the Flux design pattern. The SwiftPMTaskRunner is
 * responsible for kicking off SwiftPM tasks such as building a package. How it
 * builds the package is determined by the state of the
 * SwiftPMTaskRunnerToolbar -- the path to the package, whether a build path is
 * specified, etc. -- and that state is maintained by the
 * SwiftPMTaskRunnerStore. Updates to the toolbar UI options trigger actions,
 * defined in SwiftPMTaskRunnerActions, which update the state of the store.
 * Actions are routed to the store via a Flux.Dispatcher (instantiated by
 * SwiftPMTaskRunner).
 */
type SwiftPMTaskRunnerFlux = {
  store: SwiftPMTaskRunnerStore,
  actions: SwiftPMTaskRunnerActions,
};

/**
 * The primary controller for spawning SwiftPM tasks, such as building a
 * package, or running its tests. This class conforms to Nuclide's TaskRunner
 * interface.
 */
export class SwiftPMTaskRunner {
  id: string;
  name: string;
  _disposables: CompositeDisposable;
  _initialState: ?SwiftPMTaskRunnerStoreState;
  _flux: ?SwiftPMTaskRunnerFlux;
  _taskList: Observable<Array<TaskMetadata>>;
  _outputMessages: Subject<Message>;

  constructor(initialState: ?SwiftPMTaskRunnerStoreState) {
    this.id = 'swiftpm';
    this.name = 'Swift';
    this._initialState = initialState;
    this._disposables = new CompositeDisposable();
    this._outputMessages = new Subject();
    this._disposables.add(new DisposableSubscription(this._outputMessages));
  }

  dispose(): void {
    this._disposables.dispose();
  }

  serialize(): SwiftPMTaskRunnerStoreState {
    return this._getFlux().store.serialize();
  }

  getExtraUi(): ReactClass<any> {
    const {store, actions} = this._getFlux();
    return class ExtraUi extends React.Component {
      props: {
        activeTaskType: ?string,
      };

      render(): React.Element<any> {
        return (
          <SwiftPMTaskRunnerToolbar
            store={store}
            actions={actions}
            activeTaskType={this.props.activeTaskType}
          />
        );
      }
    };
  }

  observeTaskList(callback: (taskList: Array<TaskMetadata>) => mixed): IDisposable {
    callback(SwiftPMTaskRunnerTaskMetadata);
    return new Disposable();
  }

  getIcon(): ReactClass<any> {
    return SwiftIcon;
  }

  runTask(taskName: string): Task {
    const store = this._getFlux().store;
    const chdir = store.getChdir();
    const configuration = store.getConfiguration();
    const buildPath = store.getBuildPath();

    let command;
    switch (taskName) {
      case SwiftPMTaskRunnerBuildTaskMetadata.type:
        command = buildCommand(
          chdir,
          configuration,
          store.getXcc(),
          store.getXlinker(),
          store.getXswiftc(),
          buildPath,
        );
        break;
      case SwiftPMTaskRunnerTestTaskMetadata.type:
        command = testCommand(chdir, buildPath);
        break;
      default:
        throw new Error(`Unknown task name: ${taskName}`);
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');
    this._logOutput(`${command.command} ${command.args.join(' ')}`, 'log');

    const observable = observeProcess(
      () => safeSpawn(command.command, command.args),
    ).do(message => {
      switch (message.kind) {
        case 'stderr':
        case 'stdout':
          this._logOutput(message.data, 'log');
          break;
        case 'exit':
          if (message.exitCode === 0) {
            this._logOutput(
              `${command.command} exited successfully.`,
              'success',
            );
          } else {
            this._logOutput(
              `${command.command} failed with exit code ${message.exitCode}`,
              'error',
            );
          }
          break;
        default:
          break;
      }
    }).ignoreElements();

    const task = observableToTaskInfo(observable);
    invariant(task.observeProgress != null);
    return {
      observeProgress: task.observeProgress,
      onDidComplete: task.onDidComplete,
      onDidError: task.onDidError,
      cancel: () => {
        this._logOutput('Task cancelled.', 'warning');
        task.cancel();
      },
    };
  }

  getOutputMessages(): Observable<Message> {
    return this._outputMessages;
  }

  setProjectRoot(projectRoot: ?Directory): void {
    if (projectRoot) {
      const path = projectRoot.getPath();
      fsPromise.exists(`${path}/Package.swift`).then(fileExists => {
        if (fileExists) {
          this._getFlux().actions.updateChdir(path);
        }
      });
    }
  }

  _logOutput(text: string, level: Level) {
    this._outputMessages.next({text, level});
  }

  _getFlux(): SwiftPMTaskRunnerFlux {
    const dispatcher = new Dispatcher();
    if (!this._flux) {
      const store = new SwiftPMTaskRunnerStore(dispatcher, this._initialState);
      this._disposables.add(store);
      const actions = new SwiftPMTaskRunnerActions(dispatcher);
      this._flux = {store, actions};
    }
    return this._flux;
  }
}
