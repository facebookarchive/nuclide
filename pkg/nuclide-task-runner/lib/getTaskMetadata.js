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
exports.getTaskMetadata = getTaskMetadata;
function getTaskMetadata(taskId, taskLists) {
  const taskListsForRunner = taskLists.get(taskId.taskRunnerId);
  return taskListsForRunner == null ? null : taskListsForRunner.find(taskMeta => taskMeta.type === taskId.type);
}