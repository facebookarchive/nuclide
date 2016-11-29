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
exports.setProjectRoot = setProjectRoot;
exports.setBuildTarget = setBuildTarget;
exports.fetchDevices = fetchDevices;
exports.setSimulator = setSimulator;
exports.setTaskSettings = setTaskSettings;
const SET_PROJECT_ROOT = exports.SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';const SET_BUILD_TARGET = exports.SET_BUILD_TARGET = 'SET_BUILD_TARGET';
const FETCH_DEVICES = exports.FETCH_DEVICES = 'FETCH_DEVICES';
const SET_SIMULATOR = exports.SET_SIMULATOR = 'SET_SIMULATOR';
const SET_TASK_SETTINGS = exports.SET_TASK_SETTINGS = 'SET_TASK_SETTINGS';
const SET_BUCK_ROOT = exports.SET_BUCK_ROOT = 'SET_BUCK_ROOT';
const SET_DEVICES = exports.SET_DEVICES = 'SET_DEVICES';
const SET_RULE_TYPE = exports.SET_RULE_TYPE = 'SET_RULE_TYPE';

function setProjectRoot(projectRoot) {
  return { type: SET_PROJECT_ROOT, projectRoot };
}

function setBuildTarget(buildTarget) {
  return { type: SET_BUILD_TARGET, buildTarget };
}

function fetchDevices() {
  return { type: FETCH_DEVICES };
}

function setSimulator(simulator) {
  return { type: SET_SIMULATOR, simulator };
}

function setTaskSettings(taskType, settings) {
  return { type: SET_TASK_SETTINGS, taskType, settings };
}