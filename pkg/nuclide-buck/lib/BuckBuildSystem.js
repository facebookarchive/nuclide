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
import type {Message} from '../../nuclide-console/lib/types';
import type {SerializedState} from './types';

import {Observable, Subject} from 'rxjs';
import {CompositeDisposable} from 'atom';
import {Dispatcher} from 'flux';

import {DisposableSubscription} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {BuckIcon} from './ui/BuckIcon';
import BuckToolbarStore from './BuckToolbarStore';
import BuckToolbarActions from './BuckToolbarActions';
import {createExtraUiComponent} from './ui/createExtraUiComponent';

type Flux = {
  actions: BuckToolbarActions;
  store: BuckToolbarStore;
};

export class BuckBuildSystem {
  _flux: ?Flux;
  _disposables: CompositeDisposable;
  _extraUi: ?ReactClass;
  id: string;
  name: string;
  _icon: ReactClass;
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
    const allEnabled = store.getMostRecentBuckProject() != null && !store.isBuilding() &&
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
    if (this._icon == null) {
      this._icon = BuckIcon;
    }
    return this._icon;
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
    const {store} = this._getFlux();

    if (!this.getTasks().some(task => task.type === taskType)) {
      throw new Error(`There's no Buck task named "${taskType}"`);
    }

    const run = getTaskRunFunction(store, taskType);
    const resultStream = Observable.fromPromise(run());

    // Currently, the BuckToolbarStore's progress reporting is pretty useless so we omit
    // `observeProgress` and just use the indeterminate progress bar.
    return {
      cancel() {
        // FIXME: How can we cancel Buck tasks?
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
          resultStream.subscribe({next: cb, error: () => {}})
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

/**
 * BuckToolbarActions and BuckToolbarStore implement an older version of the Flux pattern which puts
 * a lot of the async work into the store. Therefore, it's not very easy to tie the action to the
 * result. To get around this without having to rewrite the whole thing in one go, we just use the
 * store API directly.
 */
function getTaskRunFunction(store: BuckToolbarStore, taskType: string): () => Promise<any> {
  switch (taskType) {
    case 'build':
      return () => store._doBuild('build', false);
    case 'run':
      return () => store._doBuild('install', false);
    case 'test':
      return () => store._doBuild('test', false);
    case 'debug':
      return () => store._doDebug();
    default:
      throw new Error(`Invalid task type: ${taskType}`);
  }
}
