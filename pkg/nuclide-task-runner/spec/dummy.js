'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Task} from '../../commons-node/tasks';
import type {TaskMetadata} from '../lib/types';

import {DisposableSubscription} from '../../commons-node/stream';
import {BehaviorSubject} from 'rxjs';

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
