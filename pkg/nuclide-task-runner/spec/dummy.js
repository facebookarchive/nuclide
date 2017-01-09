/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Task} from '../../commons-node/tasks';
import type {AnnotatedTaskMetadata, TaskMetadata} from '../lib/types';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {Subject} from 'rxjs';

type Entry<T> = {key: string, value: T};

export class TaskRunner {
  _taskLists: Subject<Array<TaskMetadata>>;

  id: string;
  name: string;

  constructor(id?: string) {
    this.id = id || 'build-system';
    this.name = id || 'Build System';
    this._taskLists = new Subject();
  }

  getIcon(): ReactClass<any> {
    return ((null: any): ReactClass<any>);
  }

  observeTaskList(callback: (taskList: Array<TaskMetadata>) => mixed): IDisposable {
    return new UniversalDisposable(
      this._taskLists.subscribe(taskList => { callback(taskList); }),
    );
  }

  runTask(taskName: string): Task {
    return ((null: any): Task);
  }
}

export class VisibilityTable {
  _db: Array<Entry<boolean>>;

  constructor(db: Array<Entry<boolean>>) {
    this._db = db;
  }

  getItem(key: string): ?boolean {
    const entry = this._db[0];
    return entry == null ? null : entry.value;
  }

  getEntries(): Array<Entry<boolean>> {
    return this._db;
  }
}

export function createTask(
  taskRunnerId: string,
  type: string,
  disabled: ?boolean = undefined,
  priority: number = 0,
): AnnotatedTaskMetadata {
  return {
    type,
    label: type,
    description: type,
    icon: 'alert',
    // $FlowIgnore: For tests, it's fine if this exists and is undefined.
    disabled,
    priority,
    runnable: true,
    taskRunnerId,
    taskRunnerName: taskRunnerId,
  };
}
