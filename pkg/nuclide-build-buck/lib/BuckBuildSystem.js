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

import {DisposableSubscription, event as eventLib} from '../../nuclide-commons';
import {BuckIcon} from './ui/BuckIcon';
import BuckToolbarStore from './BuckToolbarStore';
import BuckToolbarActions from './BuckToolbarActions';
import {createExtraUiComponent} from './ui/createExtraUiComponent';
import {Observable} from 'rxjs';
import {CompositeDisposable} from 'atom';
import {Dispatcher} from 'flux';

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
  _tasks: Observable<Array<Task>>;

  constructor() {
    this.id = 'buck';
    this.name = 'Buck';
    this._disposables = new CompositeDisposable();
  }

  observeTasks(cb: (tasks: Array<Task>) => mixed): IDisposable {
    if (this._tasks == null) {
      const {store} = this._getFlux();
      this._tasks = Observable.concat(
        Observable.of(store.getTasks()),
        eventLib.observableFromSubscribeFunction(store.subscribe.bind(store))
          .map(() => store.getTasks()),
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

  /**
   * Lazily create the flux stuff.
   */
  _getFlux(): Flux {
    if (this._flux == null) {
      // Set up flux stuff.
      const dispatcher = new Dispatcher();
      const flux = {
        // TODO: Get initial state from serialized state.
        store: new BuckToolbarStore(dispatcher, {
          buildTarget: null,
          isReactNativeServerMode: false,
        }),
        actions: new BuckToolbarActions(dispatcher),
      };
      this._disposables.add(flux.store);
      this._flux = flux;
    }
    return this._flux;
  }

  runTask(taskType: string): TaskInfo {
    const {store} = this._getFlux();

    if (!store.getTasks().some(task => task.type === taskType)) {
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

}

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
