'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Commands} from './Commands';
import type {Task} from './types';
import type {Observable} from 'rxjs';

import {DisposableSubscription} from '../../nuclide-commons';

export function syncAtomTaskCommands(
  taskStream: Observable<Array<Task>>,
  commands: Commands,
): IDisposable {
  const taskTypeToDisposables = new Map();
  const disposeTaskCommand = taskType => {
    const disposable = taskTypeToDisposables.get(taskType);
    if (disposable != null) {
      disposable.dispose();
      taskTypeToDisposables.delete(taskType);
    }
  };
  const removeAll = () => {
    Array.from(taskTypeToDisposables.keys()).forEach(disposeTaskCommand);
  };

  return new DisposableSubscription(
    taskStream
      .subscribe(
        tasks => {
          const nextTypes = tasks.map(task => task.type);
          const prevTypes = Array.from(taskTypeToDisposables.keys());
          const addedTypes = nextTypes.filter(type => prevTypes.indexOf(type) === -1);
          const removedTypes = prevTypes.filter(type => nextTypes.indexOf(type) === -1);

          // Remove the commands for tasks that disappeared.
          removedTypes.forEach(disposeTaskCommand);

          // Add commands for the ones that appeared.
          addedTypes.forEach(type => {
            const disposable = atom.commands.add(
              'atom-workspace',
              `nuclide-build:${type}`,
              () => { commands.runTask(type); },
            );
            taskTypeToDisposables.set(type, disposable);
          });
        },
        removeAll,
        removeAll,
      )
      .add(removeAll)
  );
}
