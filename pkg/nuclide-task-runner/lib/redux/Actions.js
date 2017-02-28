'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.didActivateInitialPackages = didActivateInitialPackages;
exports.registerTaskRunner = registerTaskRunner;
exports.runTask = runTask;
exports.selectTaskRunner = selectTaskRunner;
exports.setStatesForTaskRunners = setStatesForTaskRunners;
exports.setProjectRoot = setProjectRoot;
exports.setToolbarVisibility = setToolbarVisibility;
exports.stopTask = stopTask;
exports.toggleToolbarVisibility = toggleToolbarVisibility;
exports.unregisterTaskRunner = unregisterTaskRunner;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const DID_ACTIVATE_INITIAL_PACKAGES = exports.DID_ACTIVATE_INITIAL_PACKAGES = 'DID_ACTIVATE_INITIAL_PACKAGES';
const REGISTER_TASK_RUNNER = exports.REGISTER_TASK_RUNNER = 'REGISTER_TASK_RUNNER';
const RUN_TASK = exports.RUN_TASK = 'RUN_TASK';
const SELECT_TASK_RUNNER = exports.SELECT_TASK_RUNNER = 'SELECT_TASK_RUNNER';
const SET_STATES_FOR_TASK_RUNNERS = exports.SET_STATES_FOR_TASK_RUNNERS = 'SET_STATES_FOR_TASK_RUNNERS';
const SET_PROJECT_ROOT = exports.SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';
const SET_TOOLBAR_VISIBILITY = exports.SET_TOOLBAR_VISIBILITY = 'SET_TOOLBAR_VISIBILITY';
const STOP_TASK = exports.STOP_TASK = 'STOP_TASK';
const TASKS_READY = exports.TASKS_READY = 'TASKS_READY';
const TASK_COMPLETED = exports.TASK_COMPLETED = 'TASK_COMPLETED';
const TASK_PROGRESS = exports.TASK_PROGRESS = 'TASK_PROGRESS';
const TASK_STARTED = exports.TASK_STARTED = 'TASK_STARTED';
const TASK_STOPPED = exports.TASK_STOPPED = 'TASK_STOPPED';
const TASK_ERRORED = exports.TASK_ERRORED = 'TASK_ERRORED';
const TOGGLE_TOOLBAR_VISIBILITY = exports.TOGGLE_TOOLBAR_VISIBILITY = 'TOGGLE_TOOLBAR_VISIBILITY';
const UNREGISTER_TASK_RUNNER = exports.UNREGISTER_TASK_RUNNER = 'UNREGISTER_TASK_RUNNER';

function didActivateInitialPackages() {
  return { type: DID_ACTIVATE_INITIAL_PACKAGES };
}

function registerTaskRunner(taskRunner) {
  return {
    type: REGISTER_TASK_RUNNER,
    payload: { taskRunner }
  };
}

function runTask(taskMeta, verifySaved = true) {
  return {
    type: RUN_TASK,
    payload: {
      verifySaved,
      taskMeta
    }
  };
}

function selectTaskRunner(taskRunner, updateUserPreferences) {
  return {
    type: SELECT_TASK_RUNNER,
    payload: { taskRunner, updateUserPreferences }
  };
}

function setStatesForTaskRunners(statesForTaskRunners) {
  return {
    type: SET_STATES_FOR_TASK_RUNNERS,
    payload: { statesForTaskRunners }
  };
}

function setProjectRoot(projectRoot) {
  return {
    type: SET_PROJECT_ROOT,
    payload: { projectRoot }
  };
}

function setToolbarVisibility(visible, updateUserPreferences) {
  return {
    type: SET_TOOLBAR_VISIBILITY,
    payload: { visible, updateUserPreferences }
  };
}

function stopTask() {
  return { type: STOP_TASK };
}

function toggleToolbarVisibility(taskRunner) {
  return {
    type: TOGGLE_TOOLBAR_VISIBILITY,
    payload: { taskRunner }
  };
}

function unregisterTaskRunner(taskRunner) {
  return {
    type: UNREGISTER_TASK_RUNNER,
    payload: { taskRunner }
  };
}