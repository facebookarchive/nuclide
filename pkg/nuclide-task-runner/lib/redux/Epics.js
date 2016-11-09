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
exports.registerTaskRunnerEpic = registerTaskRunnerEpic;
exports.runTaskEpic = runTaskEpic;
exports.setProjectRootEpic = setProjectRootEpic;
exports.setToolbarVisibilityEpic = setToolbarVisibilityEpic;
exports.stopTaskEpic = stopTaskEpic;
exports.toggleToolbarVisibilityEpic = toggleToolbarVisibilityEpic;

var _tasks;

function _load_tasks() {
  return _tasks = require('../../../commons-node/tasks');
}

var _event;

function _load_event() {
  return _event = require('../../../commons-node/event');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _getTaskMetadata;

function _load_getTaskMetadata() {
  return _getTaskMetadata = require('../getTaskMetadata');
}

var _Selectors;

function _load_Selectors() {
  return _Selectors = require('../redux/Selectors');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function registerTaskRunnerEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REGISTER_TASK_RUNNER).flatMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).REGISTER_TASK_RUNNER)) {
      throw new Error('Invariant violation: "action.type === Actions.REGISTER_TASK_RUNNER"');
    }

    const taskRunner = action.payload.taskRunner;

    // Set the project root on the new task runner.

    const setProjectRoot = taskRunner.setProjectRoot;

    if (typeof setProjectRoot === 'function') {
      const projectRoot = store.getState().projectRoot;
      setProjectRoot.call(taskRunner, projectRoot);
    }

    const taskListToAction = taskList => ({
      type: (_Actions || _load_Actions()).TASK_LIST_UPDATED,
      payload: {
        taskRunnerId: taskRunner.id,
        taskList: taskList
      }
    });
    const unregistrationEvents = actions.filter(a => a.type === (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER && a.payload.id === taskRunner.id);
    return (0, (_event || _load_event()).observableFromSubscribeFunction)(taskRunner.observeTaskList.bind(taskRunner)).map(taskListToAction).takeUntil(unregistrationEvents);
  });
}function runTaskEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).RUN_TASK).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).RUN_TASK)) {
      throw new Error('Invariant violation: "action.type === Actions.RUN_TASK"');
    }

    const taskToRun = action.payload.taskId || (0, (_Selectors || _load_Selectors()).getActiveTaskId)(store.getState());

    // Don't do anything if there's no active task.
    if (taskToRun == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    // Don't do anything if a task is already running.
    if (store.getState().runningTaskInfo != null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    return _rxjsBundlesRxMinJs.Observable.concat(taskIdsAreEqual(store.getState().activeTaskId, taskToRun) ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTask(taskToRun)), store.getState().visible ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true)), _rxjsBundlesRxMinJs.Observable.defer(() => {
      const state = store.getState();
      const activeTaskRunner = (0, (_Selectors || _load_Selectors()).getActiveTaskRunner)(state);

      if (activeTaskRunner == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const taskMeta = (0, (_getTaskMetadata || _load_getTaskMetadata()).getTaskMetadata)(taskToRun, state.taskLists);

      if (!(taskMeta != null)) {
        throw new Error('Invariant violation: "taskMeta != null"');
      }

      if (!taskMeta.runnable) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      return createTaskObservable(activeTaskRunner, taskMeta, () => store.getState())
      // Stop listening once the task is done.
      .takeUntil(actions.ofType((_Actions || _load_Actions()).TASK_COMPLETED, (_Actions || _load_Actions()).TASK_ERRORED, (_Actions || _load_Actions()).TASK_STOPPED));
    }));
  });
}

function setProjectRootEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROJECT_ROOT).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_PROJECT_ROOT)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_PROJECT_ROOT"');
    }

    const projectRoot = action.payload.projectRoot;

    // Set the project root on all registered task runners.

    store.getState().taskRunners.forEach(taskRunner => {
      if (typeof taskRunner.setProjectRoot === 'function') {
        taskRunner.setProjectRoot(projectRoot);
      }
    });
  })
  // This is just for side-effects
  .ignoreElements();
}

function setToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_TOOLBAR_VISIBILITY"');
    }

    const visible = action.payload.visible;

    return {
      type: (_Actions || _load_Actions()).TOOLBAR_VISIBILITY_UPDATED,
      payload: { visible: visible }
    };
  });
}

function stopTaskEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).STOP_TASK).switchMap(action => {
    var _store$getState = store.getState();

    const runningTaskInfo = _store$getState.runningTaskInfo;

    const task = runningTaskInfo == null ? null : runningTaskInfo.task;
    if (task == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_STOPPED,
      payload: { task: task }
    });
  });
}

function toggleToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_TOOLBAR_VISIBILITY"');
    }

    const state = store.getState();
    const taskRunnerId = action.payload.taskRunnerId;

    // If no taskRunnerId is provided, just toggle the visibility.

    if (taskRunnerId == null) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(!state.visible));
    }

    // If the active task corresponds to the task runner you want to toggle, just toggle the
    // visibility.
    const activeTaskId = state.activeTaskId;

    if (activeTaskId != null && activeTaskId.taskRunnerId === taskRunnerId) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(!state.visible));
    }

    // Choose the first task for that task runner.
    const taskListForRunner = state.taskLists.get(taskRunnerId) || [];
    const taskIdToSelect = taskListForRunner.length > 0 ? taskListForRunner[0] : null;
    if (taskIdToSelect == null) {
      const taskRunner = state.taskRunners.get(taskRunnerId);

      if (!(taskRunner != null)) {
        throw new Error('Invariant violation: "taskRunner != null"');
      }

      atom.notifications.addWarning(`The ${ taskRunner.name } task runner doesn't have any tasks!`);
    }

    return _rxjsBundlesRxMinJs.Observable.concat(
    // Make sure the toolbar is shown.
    _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true)),

    // Select the task.
    taskIdToSelect == null ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTask(taskIdToSelect)));
  });
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(taskRunner, taskMeta, getState) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const task = taskRunner.runTask(taskMeta.type);
    const events = (0, (_tasks || _load_tasks()).observableFromTask)(task);

    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_STARTED,
      payload: { task: task }
    }).concat(events.filter(event => event.type === 'progress').map(event => ({
      type: (_Actions || _load_Actions()).TASK_PROGRESS,
      payload: { progress: event.progress }
    }))).concat(_rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_COMPLETED,
      payload: { task: task }
    }));
  }).catch(error => {
    atom.notifications.addError(`The task "${ taskMeta.label }" failed`, {
      description: error.message,
      dismissable: true
    });
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Error running task:', taskMeta, error);

    var _getState = getState();

    const runningTaskInfo = _getState.runningTaskInfo;

    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_ERRORED,
      payload: {
        error: error,
        task: runningTaskInfo == null ? null : runningTaskInfo.task
      }
    });
  }).share();
}

function taskIdsAreEqual(a, b) {
  if (a == null || b == null) {
    return false;
  }
  return a.type === b.type && a.taskRunnerId === b.taskRunnerId;
}