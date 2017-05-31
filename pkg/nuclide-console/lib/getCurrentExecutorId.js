'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getCurrentExecutorId;
function getCurrentExecutorId(state) {
  let { currentExecutorId } = state;
  if (currentExecutorId == null) {
    const firstExecutor = Array.from(state.executors.values())[0];
    currentExecutorId = firstExecutor && firstExecutor.id;
  }
  return currentExecutorId;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */