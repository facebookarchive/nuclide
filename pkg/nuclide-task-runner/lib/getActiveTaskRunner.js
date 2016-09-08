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

exports.getActiveTaskRunner = getActiveTaskRunner;

function getActiveTaskRunner(state) {
  var activeTaskRunnerId = state.activeTaskId && state.activeTaskId.taskRunnerId;
  return activeTaskRunnerId == null ? null : state.taskRunners.get(activeTaskRunnerId);
}