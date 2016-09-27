Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getActiveTaskId = getActiveTaskId;
exports.getActiveTaskRunner = getActiveTaskRunner;

function getActiveTaskId(state) {
  return state.activeTaskId || getFirstTask(state.taskLists);
}

function getActiveTaskRunner(state) {
  var activeTaskId = getActiveTaskId(state);
  var activeTaskRunnerId = activeTaskId && activeTaskId.taskRunnerId;
  return activeTaskRunnerId == null ? null : state.taskRunners.get(activeTaskRunnerId);
}

function getFirstTask(taskLists) {
  var candidate = undefined;
  for (var taskList of taskLists.values()) {
    for (var taskMeta of taskList) {
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