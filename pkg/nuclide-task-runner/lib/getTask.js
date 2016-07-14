'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AnnotatedTask, TaskId} from './types';

export function getTask(taskId: TaskId, tasks: Map<string, Array<AnnotatedTask>>): ?AnnotatedTask {
  const tasksForRunner = tasks.get(taskId.taskRunnerId);
  return tasksForRunner == null
    ? null
    : tasksForRunner.find(task => task.type === taskId.type);
}
