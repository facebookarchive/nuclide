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

exports.getTaskMetadata = getTaskMetadata;

function getTaskMetadata(taskId, taskLists) {
  var taskListsForRunner = taskLists.get(taskId.taskRunnerId);
  return taskListsForRunner == null ? null : taskListsForRunner.find(function (taskMeta) {
    return taskMeta.type === taskId.type;
  });
}