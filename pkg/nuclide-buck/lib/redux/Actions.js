'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRoot = setProjectRoot;
exports.setBuildTarget = setBuildTarget;
exports.setDevice = setDevice;
exports.setTaskSettings = setTaskSettings;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const SET_PROJECT_ROOT = exports.SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';
const SET_BUILD_TARGET = exports.SET_BUILD_TARGET = 'SET_BUILD_TARGET';
const SET_DEVICE = exports.SET_DEVICE = 'SET_DEVICE';
const SET_TASK_SETTINGS = exports.SET_TASK_SETTINGS = 'SET_TASK_SETTINGS';
const SET_BUCK_ROOT = exports.SET_BUCK_ROOT = 'SET_BUCK_ROOT';
const SET_PLATFORMS = exports.SET_PLATFORMS = 'SET_PLATFORMS';
const SET_RULE_TYPE = exports.SET_RULE_TYPE = 'SET_RULE_TYPE';

function setProjectRoot(projectRoot) {
  return { type: SET_PROJECT_ROOT, projectRoot };
}

function setBuildTarget(buildTarget) {
  return { type: SET_BUILD_TARGET, buildTarget };
}

function setDevice(device) {
  return { type: SET_DEVICE, device };
}

function setTaskSettings(taskType, settings) {
  return { type: SET_TASK_SETTINGS, taskType, settings };
}