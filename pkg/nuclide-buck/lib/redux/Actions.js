'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRoot = setProjectRoot;
exports.setBuckRoot = setBuckRoot;
exports.setBuildTarget = setBuildTarget;
exports.setDeploymentTarget = setDeploymentTarget;
exports.setTaskSettings = setTaskSettings;
const SET_PROJECT_ROOT = exports.SET_PROJECT_ROOT = 'SET_PROJECT_ROOT'; /**
                                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                                         * All rights reserved.
                                                                         *
                                                                         * This source code is licensed under the license found in the LICENSE file in
                                                                         * the root directory of this source tree.
                                                                         *
                                                                         * 
                                                                         * @format
                                                                         */

const SET_BUILD_TARGET = exports.SET_BUILD_TARGET = 'SET_BUILD_TARGET';
const SET_DEPLOYMENT_TARGET = exports.SET_DEPLOYMENT_TARGET = 'SET_DEPLOYMENT_TARGET';
const SET_TASK_SETTINGS = exports.SET_TASK_SETTINGS = 'SET_TASK_SETTINGS';
const SET_BUCK_ROOT = exports.SET_BUCK_ROOT = 'SET_BUCK_ROOT';
const SET_PLATFORM_GROUPS = exports.SET_PLATFORM_GROUPS = 'SET_PLATFORM_GROUPS';
const SET_RULE_TYPE = exports.SET_RULE_TYPE = 'SET_RULE_TYPE';

function setProjectRoot(projectRoot) {
  return { type: SET_PROJECT_ROOT, projectRoot };
}

function setBuckRoot(buckRoot) {
  return { type: SET_BUCK_ROOT, buckRoot };
}

function setBuildTarget(buildTarget) {
  return { type: SET_BUILD_TARGET, buildTarget };
}

function setDeploymentTarget(deploymentTarget) {
  return { type: SET_DEPLOYMENT_TARGET, deploymentTarget };
}

function setTaskSettings(settings) {
  return { type: SET_TASK_SETTINGS, settings };
}