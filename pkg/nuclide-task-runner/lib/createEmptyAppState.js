'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEmptyAppState = createEmptyAppState;
function createEmptyAppState() {
  return {
    activeTaskId: null,
    activeTaskRunnerId: null,
    previousSessionActiveTaskId: null,
    previousSessionActiveTaskRunnerId: null,
    showPlaceholderInitially: false,
    taskRunners: new Map(),
    projectRoot: null,
    projectWasOpened: false,
    tasksAreReady: false,
    taskLists: new Map(),
    runningTaskInfo: null,
    viewIsInitialized: false,
    visible: false,
    previousSessionVisible: null
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */