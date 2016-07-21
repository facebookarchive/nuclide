'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TaskMetadata} from '../lib/types';

import {DisposableSubscription} from '../../commons-node/stream';
import {BehaviorSubject} from 'rxjs';
import {Disposable} from 'atom';

const noop = () => {};
const noopErrCallback = err_ => {};

export class Task {
  // In the real version, you'd be able to add multiple callbacks for each event.
  _complete: () => mixed;
  _error: (error: Error) => mixed;
  _progress: BehaviorSubject<?number>;

  constructor() {
    this._progress = new BehaviorSubject(null);
    this._complete = noop;
    this._error = noopErrCallback;
  }

  observeProgress(callback: (progress: ?number) => mixed): IDisposable {
    return new DisposableSubscription(
      this._progress.subscribe(progress => { callback(progress); }),
    );
  }

  onDidComplete(callback: () => mixed): IDisposable {
    this._complete = callback;
    return new Disposable(() => {
      this._complete = noop;
    });
  }

  onDidError(callback: (error: Error) => mixed): IDisposable {
    this._error = callback;
    return new Disposable(() => {
      this._error = noopErrCallback;
    });
  }

  cancel(): void {
  }
}

export class TaskRunner {
  _taskLists: BehaviorSubject<Array<TaskMetadata>>;

  id: string;
  name: string;

  constructor() {
    this.id = 'build-system';
    this.name = 'Build System';
    this._taskLists = new BehaviorSubject([]);
  }

  getIcon(): ReactClass<any> {
    return ((null: any): ReactClass<any>);
  }

  observeTaskList(callback: (taskList: Array<TaskMetadata>) => mixed): IDisposable {
    return new DisposableSubscription(
      this._taskLists.subscribe(taskList => { callback(taskList); }),
    );
  }

  runTask(taskName: string): Task {
    return ((null: any): Task);
  }
}
