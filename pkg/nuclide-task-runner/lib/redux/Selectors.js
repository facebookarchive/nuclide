'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getActiveTaskId = getActiveTaskId;
exports.getActiveTaskRunner = getActiveTaskRunner;
exports.getFirstTask = getFirstTask;
function getActiveTaskId(state) {
  return state.activeTaskId || getFirstTask(state.taskLists);
}function getActiveTaskRunner(state) {
  const activeTaskId = getActiveTaskId(state);
  const activeTaskRunnerId = activeTaskId && activeTaskId.taskRunnerId;
  return activeTaskRunnerId == null ? null : state.taskRunners.get(activeTaskRunnerId);
}

function getFirstTask(taskLists) {
  let candidate;
  let candidatePriority;
  for (const taskList of taskLists.values()) {
    for (const taskMeta of taskList) {
      if (taskMeta.disabled !== true) {
        const priority = taskMeta.priority;
        // Tasks get a default priority of 0.
        // For backwards compat, we don't (currently) require the "disabled" property.
        // However, tasks that don't set it get an even lower default priority (-1).

        const taskPriority = priority != null ? priority : taskMeta.disabled == null ? -1 : 0;
        if (candidatePriority == null || taskPriority > candidatePriority) {
          candidate = taskMeta;
          candidatePriority = taskPriority;
        }
      }
    }
  }
  return candidate;
}