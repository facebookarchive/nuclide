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

exports.registerTaskRunner = registerTaskRunner;
exports.runTask = runTask;
exports.selectTask = selectTask;
exports.setProjectRoot = setProjectRoot;
exports.setToolbarVisibility = setToolbarVisibility;
exports.stopTask = stopTask;
exports.toggleToolbarVisibility = toggleToolbarVisibility;
exports.unregisterTaskRunner = unregisterTaskRunner;
var REGISTER_TASK_RUNNER = 'REGISTER_TASK_RUNNER';
exports.REGISTER_TASK_RUNNER = REGISTER_TASK_RUNNER;
var RUN_TASK = 'RUN_TASK';
exports.RUN_TASK = RUN_TASK;
var SELECT_TASK = 'SELECT_TASK';
exports.SELECT_TASK = SELECT_TASK;
var SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';
exports.SET_PROJECT_ROOT = SET_PROJECT_ROOT;
var SET_TOOLBAR_VISIBILITY = 'SET_TOOLBAR_VISIBILITY';
exports.SET_TOOLBAR_VISIBILITY = SET_TOOLBAR_VISIBILITY;
var STOP_TASK = 'STOP_TASK';
exports.STOP_TASK = STOP_TASK;
var TASK_COMPLETED = 'TASK_COMPLETED';
exports.TASK_COMPLETED = TASK_COMPLETED;
var TASK_PROGRESS = 'TASK_PROGRESS';
exports.TASK_PROGRESS = TASK_PROGRESS;
var TASK_STARTED = 'TASK_STARTED';
exports.TASK_STARTED = TASK_STARTED;
var TASK_STOPPED = 'TASK_STOPPED';
exports.TASK_STOPPED = TASK_STOPPED;
var TASK_ERRORED = 'TASK_ERRORED';
exports.TASK_ERRORED = TASK_ERRORED;
var TASK_LIST_UPDATED = 'TASK_LIST_UPDATED';
exports.TASK_LIST_UPDATED = TASK_LIST_UPDATED;
var TOGGLE_TOOLBAR_VISIBILITY = 'TOGGLE_TOOLBAR_VISIBILITY';
exports.TOGGLE_TOOLBAR_VISIBILITY = TOGGLE_TOOLBAR_VISIBILITY;
var TOOLBAR_VISIBILITY_UPDATED = 'TOOLBAR_VISIBILITY_UPDATED';
exports.TOOLBAR_VISIBILITY_UPDATED = TOOLBAR_VISIBILITY_UPDATED;
var UNREGISTER_TASK_RUNNER = 'UNREGISTER_TASK_RUNNER';

exports.UNREGISTER_TASK_RUNNER = UNREGISTER_TASK_RUNNER;

function registerTaskRunner(taskRunner) {
  return {
    type: REGISTER_TASK_RUNNER,
    payload: { taskRunner: taskRunner }
  };
}

function runTask(taskId) {
  return {
    type: RUN_TASK,
    payload: { taskId: taskId }
  };
}

function selectTask(taskId) {
  return {
    type: SELECT_TASK,
    payload: { taskId: taskId }
  };
}

function setProjectRoot(projectRoot) {
  return {
    type: SET_PROJECT_ROOT,
    payload: { projectRoot: projectRoot }
  };
}

function setToolbarVisibility(visible) {
  return {
    type: SET_TOOLBAR_VISIBILITY,
    payload: { visible: visible }
  };
}

function stopTask() {
  return { type: STOP_TASK };
}

function toggleToolbarVisibility(taskRunnerId) {
  return {
    type: TOGGLE_TOOLBAR_VISIBILITY,
    payload: { taskRunnerId: taskRunnerId }
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