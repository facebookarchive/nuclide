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

exports.getTask = getTask;

function getTask(taskId, tasks) {
  var tasksForRunner = tasks.get(taskId.taskRunnerId);
  return tasksForRunner == null ? null : tasksForRunner.find(function (task) {
    return task.type === taskId.type;
  });
}