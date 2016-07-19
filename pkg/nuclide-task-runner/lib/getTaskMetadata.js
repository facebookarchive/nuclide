'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AnnotatedTaskMetadata, TaskId} from './types';

export function getTaskMetadata(
  taskId: TaskId,
  taskLists: Map<string, Array<AnnotatedTaskMetadata>>,
): ?AnnotatedTaskMetadata {
  const taskListsForRunner = taskLists.get(taskId.taskRunnerId);
  return taskListsForRunner == null
    ? null
    : taskListsForRunner.find(taskMeta => taskMeta.type === taskId.type);
}
