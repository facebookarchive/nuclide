'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.didActivateInitialPackages = didActivateInitialPackages;
exports.registerTaskRunner = registerTaskRunner;
exports.runTask = runTask;
exports.selectTaskRunner = selectTaskRunner;
exports.setStateForTaskRunner = setStateForTaskRunner;
exports.setStatesForTaskRunners = setStatesForTaskRunners;
exports.setProjectRoot = setProjectRoot;
exports.setConsoleService = setConsoleService;
exports.setConsolesForTaskRunners = setConsolesForTaskRunners;
exports.addConsoleForTaskRunner = addConsoleForTaskRunner;
exports.removeConsoleForTaskRunner = removeConsoleForTaskRunner;
exports.setToolbarVisibility = setToolbarVisibility;
exports.stopTask = stopTask;
exports.requestToggleToolbarVisibility = requestToggleToolbarVisibility;
exports.toggleToolbarVisibility = toggleToolbarVisibility;
exports.unregisterTaskRunner = unregisterTaskRunner;
const DID_ACTIVATE_INITIAL_PACKAGES = exports.DID_ACTIVATE_INITIAL_PACKAGES = 'DID_ACTIVATE_INITIAL_PACKAGES'; /**
                                                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                * All rights reserved.
                                                                                                                *
                                                                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                                                                * the root directory of this source tree.
                                                                                                                *
                                                                                                                * 
                                                                                                                * @format
                                                                                                                */

const REGISTER_TASK_RUNNER = exports.REGISTER_TASK_RUNNER = 'REGISTER_TASK_RUNNER';
const REQUEST_TOGGLE_TOOLBAR_VISIBILITY = exports.REQUEST_TOGGLE_TOOLBAR_VISIBILITY = 'REQUEST_TOGGLE_TOOLBAR_VISIBILITY';
const RUN_TASK = exports.RUN_TASK = 'RUN_TASK';
const SELECT_TASK_RUNNER = exports.SELECT_TASK_RUNNER = 'SELECT_TASK_RUNNER';
const SET_STATE_FOR_TASK_RUNNER = exports.SET_STATE_FOR_TASK_RUNNER = 'SET_STATE_FOR_TASK_RUNNER';
const SET_STATES_FOR_TASK_RUNNERS = exports.SET_STATES_FOR_TASK_RUNNERS = 'SET_STATES_FOR_TASK_RUNNERS';
const SET_PROJECT_ROOT = exports.SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';
const SET_CONSOLE_SERVICE = exports.SET_CONSOLE_SERVICE = 'SET_CONSOLE_SERVICE';
const SET_CONSOLES_FOR_TASK_RUNNERS = exports.SET_CONSOLES_FOR_TASK_RUNNERS = 'SET_CONSOLES_FOR_TASK_RUNNERS';
const ADD_CONSOLE_FOR_TASK_RUNNER = exports.ADD_CONSOLE_FOR_TASK_RUNNER = 'ADD_CONSOLE_FOR_TASK_RUNNER';
const REMOVE_CONSOLE_FOR_TASK_RUNNER = exports.REMOVE_CONSOLE_FOR_TASK_RUNNER = 'REMOVE_CONSOLE_FOR_TASK_RUNNER';
const SET_TOOLBAR_VISIBILITY = exports.SET_TOOLBAR_VISIBILITY = 'SET_TOOLBAR_VISIBILITY';
const STOP_TASK = exports.STOP_TASK = 'STOP_TASK';
const TASKS_READY = exports.TASKS_READY = 'TASKS_READY';
const TASK_COMPLETED = exports.TASK_COMPLETED = 'TASK_COMPLETED';
const TASK_PROGRESS = exports.TASK_PROGRESS = 'TASK_PROGRESS';
const TASK_MESSAGE = exports.TASK_MESSAGE = 'TASK_MESSAGE';
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

function setStateForTaskRunner(taskRunner, taskRunnerState) {
  return {
    type: SET_STATE_FOR_TASK_RUNNER,
    payload: { taskRunner, taskRunnerState }
  };
}

// Only sets the states for task runners that have keys in the map
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

function setConsoleService(service) {
  return {
    type: SET_CONSOLE_SERVICE,
    payload: { service }
  };
}

function setConsolesForTaskRunners(consolesForTaskRunners) {
  return {
    type: SET_CONSOLES_FOR_TASK_RUNNERS,
    payload: { consolesForTaskRunners }
  };
}

function addConsoleForTaskRunner(taskRunner, consoleApi) {
  return {
    type: ADD_CONSOLE_FOR_TASK_RUNNER,
    payload: { consoleApi, taskRunner }
  };
}

function removeConsoleForTaskRunner(taskRunner) {
  return {
    type: REMOVE_CONSOLE_FOR_TASK_RUNNER,
    payload: { taskRunner }
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

function requestToggleToolbarVisibility(visible, taskRunner) {
  return {
    type: REQUEST_TOGGLE_TOOLBAR_VISIBILITY,
    payload: { visible, taskRunner }
  };
}

function toggleToolbarVisibility(visible, taskRunner) {
  return {
    type: TOGGLE_TOOLBAR_VISIBILITY,
    payload: { visible, taskRunner }
  };
}

function unregisterTaskRunner(taskRunner) {
  return {
    type: UNREGISTER_TASK_RUNNER,
    payload: { taskRunner }
  };
}