'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AnnotatedTaskMetadata, AppState, TaskId, TaskRunner} from '../types';

export function getActiveTaskId(state: AppState): ?TaskId {
  return state.activeTaskId || getFirstTask(state.taskLists);
}

export function getActiveTaskRunner(state: AppState): ?TaskRunner {
  const activeTaskId = getActiveTaskId(state);
  const activeTaskRunnerId = activeTaskId && activeTaskId.taskRunnerId;
  return activeTaskRunnerId == null
    ? null
    : state.taskRunners.get(activeTaskRunnerId);
}

function getFirstTask(
  taskLists: Map<string, Array<AnnotatedTaskMetadata>>,
): ?AnnotatedTaskMetadata {
  let candidate;
  for (const taskList of taskLists.values()) {
    for (const taskMeta of taskList) {
      // For backwards compat, we don't (currently) require that the "disabled" property be present,
      // but we prefer tasks that have it.
      if (taskMeta.disabled === false) {
        return taskMeta;
      } else if (!taskMeta.disabled) {
        candidate = taskMeta;
      }
    }
  }
  return candidate;
}
