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
exports.didLoadInitialPackages = didLoadInitialPackages;
exports.registerTaskRunner = registerTaskRunner;
exports.runTask = runTask;
exports.selectTask = selectTask;
exports.setProjectRoot = setProjectRoot;
exports.setTaskLists = setTaskLists;
exports.setToolbarVisibility = setToolbarVisibility;
exports.stopTask = stopTask;
exports.toggleToolbarVisibility = toggleToolbarVisibility;
exports.unregisterTaskRunner = unregisterTaskRunner;

const DID_LOAD_INITIAL_PACKAGES = exports.DID_LOAD_INITIAL_PACKAGES = 'DID_LOAD_INITIAL_PACKAGES';
const REGISTER_TASK_RUNNER = exports.REGISTER_TASK_RUNNER = 'REGISTER_TASK_RUNNER';
const RUN_TASK = exports.RUN_TASK = 'RUN_TASK';
const SELECT_TASK = exports.SELECT_TASK = 'SELECT_TASK';
const SET_PROJECT_ROOT = exports.SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';
const SET_TASK_LISTS = exports.SET_TASK_LISTS = 'SET_TASK_LISTS';
const SET_TOOLBAR_VISIBILITY = exports.SET_TOOLBAR_VISIBILITY = 'SET_TOOLBAR_VISIBILITY';
const STOP_TASK = exports.STOP_TASK = 'STOP_TASK';
const TASK_COMPLETED = exports.TASK_COMPLETED = 'TASK_COMPLETED';
const TASK_PROGRESS = exports.TASK_PROGRESS = 'TASK_PROGRESS';
const TASK_STARTED = exports.TASK_STARTED = 'TASK_STARTED';
const TASK_STOPPED = exports.TASK_STOPPED = 'TASK_STOPPED';
const TASK_ERRORED = exports.TASK_ERRORED = 'TASK_ERRORED';
const TOGGLE_TOOLBAR_VISIBILITY = exports.TOGGLE_TOOLBAR_VISIBILITY = 'TOGGLE_TOOLBAR_VISIBILITY';
const UNREGISTER_TASK_RUNNER = exports.UNREGISTER_TASK_RUNNER = 'UNREGISTER_TASK_RUNNER';

function didLoadInitialPackages() {
  return { type: DID_LOAD_INITIAL_PACKAGES };
}

function registerTaskRunner(taskRunner) {
  return {
    type: REGISTER_TASK_RUNNER,
    payload: { taskRunner }
  };
}

function runTask(taskId) {
  return {
    type: RUN_TASK,
    payload: { taskId }
  };
}

function selectTask(taskId) {
  return {
    type: SELECT_TASK,
    payload: { taskId }
  };
}

function setProjectRoot(projectRoot) {
  return {
    type: SET_PROJECT_ROOT,
    payload: { projectRoot }
  };
}

function setTaskLists(taskLists) {
  return {
    type: SET_TASK_LISTS,
    payload: { taskLists }
  };
}

function setToolbarVisibility(visible) {
  return {
    type: SET_TOOLBAR_VISIBILITY,
    payload: { visible }
  };
}

function stopTask() {
  return { type: STOP_TASK };
}

function toggleToolbarVisibility(taskRunnerId) {
  return {
    type: TOGGLE_TOOLBAR_VISIBILITY,
    payload: { taskRunnerId }
  };
}

function unregisterTaskRunner(taskRunner) {
  return {
    type: UNREGISTER_TASK_RUNNER,
    payload: {
      id: taskRunner.id
    }
  };
}