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
import type {ArcToolbarStore as ArcToolbarStoreType} from './ArcToolbarStore';

import {DisposableSubscription} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import HhvmIcon from './ui/HhvmIcon';
import {Observable} from 'rxjs';

export default class ArcBuildSystem {
  _store: ArcToolbarStoreType;
  id: string;
  name: string;
  _tasks: ?Observable<Array<Task>>;

  constructor() {
    this.id = 'hhvm';
    this._store = this._getStore();
    this.name = this._store.getName();
  }

  _getStore(): ArcToolbarStoreType {
    const {ArcToolbarStore} = require('./ArcToolbarStore');
    return new ArcToolbarStore();
  }

  observeTasks(cb: (tasks: Array<Task>) => mixed): IDisposable {
    if (this._tasks == null) {
      this._tasks = Observable.concat(
        Observable.of(this._store.getTasks()),
        observableFromSubscribeFunction(this._store.onChange.bind(this._store))
          .map(() => this._store.getTasks()),
      );
    }
    return new DisposableSubscription(
      this._tasks.subscribe({next: cb})
    );
  }

  getIcon(): ReactClass {
    return HhvmIcon;
  }

  runTask(taskType: string): TaskInfo {
    if (!this._store.getTasks().some(task => task.type === taskType)) {
      throw new Error(`There's no hhvm task named "${taskType}"`);
    }

    const run = getTaskRunFunction(this._store, taskType);
    const resultStream = Observable.fromPromise(run());

    // Currently, the `arc build` has no meaningul progress reporting,
    // So, we omit `observeProgress` and just use the indeterminate progress bar.
    return {
      cancel() {
        // FIXME: How can we cancel tasks?
      },
      onDidError(cb) {
        return new DisposableSubscription(
          resultStream.subscribe({error: cb}),
        );
      },
      onDidComplete(cb) {
        return new DisposableSubscription(
          // Add an empty error handler to avoid the "Unhandled Error" message. (We're handling it
          // above via the onDidError interface.)
          resultStream.subscribe({next: cb, error: () => {}}),
        );
      },
    };
  }
}

function getTaskRunFunction(store: ArcToolbarStoreType, taskType: string): () => Promise<any> {
  switch (taskType) {
    case 'build':
      return () => store.arcBuild();
    default:
      throw new Error(`Invalid task type: ${taskType}`);
  }
}
