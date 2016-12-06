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
exports.createEmptyAppState = createEmptyAppState;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function createEmptyAppState() {
  return {
    activeTaskId: null,
    previousSessionActiveTaskId: null,
    showPlaceholderInitially: false,
    taskRunners: new Map(),
    projectRoot: null,
    projectWasOpened: false,
    states: new _rxjsBundlesRxMinJs.ReplaySubject(1),
    tasksAreReady: false,
    taskLists: new Map(),
    runningTaskInfo: null,
    viewIsInitialized: false,
    visible: false,
    previousSessionVisible: null
  };
}