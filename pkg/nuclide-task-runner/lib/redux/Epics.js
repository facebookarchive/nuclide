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

exports.registerTaskRunnerEpic = registerTaskRunnerEpic;
exports.runTaskEpic = runTaskEpic;
exports.setProjectRootEpic = setProjectRootEpic;
exports.setToolbarVisibilityEpic = setToolbarVisibilityEpic;
exports.stopTaskEpic = stopTaskEpic;
exports.toggleToolbarVisibilityEpic = toggleToolbarVisibilityEpic;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _commonsNodeTasks2;

function _commonsNodeTasks() {
  return _commonsNodeTasks2 = require('../../../commons-node/tasks');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../../commons-node/event');
}

var _getTaskMetadata2;

function _getTaskMetadata() {
  return _getTaskMetadata2 = require('../getTaskMetadata');
}

var _reduxSelectors2;

function _reduxSelectors() {
  return _reduxSelectors2 = require('../redux/Selectors');
}

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

function registerTaskRunnerEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).REGISTER_TASK_RUNNER).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).REGISTER_TASK_RUNNER);
    var taskRunner = action.payload.taskRunner;

    // Set the project root on the new task runner.
    var setProjectRoot = taskRunner.setProjectRoot;

    if (typeof setProjectRoot === 'function') {
      var projectRoot = store.getState().projectRoot;
      setProjectRoot.call(taskRunner, projectRoot);
    }

    var taskListToAction = function taskListToAction(taskList) {
      return {
        type: (_Actions2 || _Actions()).TASK_LIST_UPDATED,
        payload: {
          taskRunnerId: taskRunner.id,
          taskList: taskList
        }
      };
    };
    var unregistrationEvents = actions.filter(function (a) {
      return a.type === (_Actions2 || _Actions()).UNREGISTER_TASK_RUNNER && a.payload.id === taskRunner.id;
    });
    return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(taskRunner.observeTaskList.bind(taskRunner)).map(taskListToAction).takeUntil(unregistrationEvents);
  });
}

function runTaskEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).RUN_TASK).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).RUN_TASK);
    var taskToRun = action.payload.taskId || (0, (_reduxSelectors2 || _reduxSelectors()).getActiveTaskId)(store.getState());

    // Don't do anything if there's no active task.
    if (taskToRun == null) {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }

    // Don't do anything if a task is already running.
    if (store.getState().runningTaskInfo != null) {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat(taskIdsAreEqual(store.getState().activeTaskId, taskToRun) ? (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty() : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).selectTask(taskToRun)), store.getState().visible ? (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty() : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).setToolbarVisibility(true)), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.defer(function () {
      var state = store.getState();
      var activeTaskRunner = (0, (_reduxSelectors2 || _reduxSelectors()).getActiveTaskRunner)(state);

      if (activeTaskRunner == null) {
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
      }

      var taskMeta = (0, (_getTaskMetadata2 || _getTaskMetadata()).getTaskMetadata)(taskToRun, state.taskLists);
      (0, (_assert2 || _assert()).default)(taskMeta != null);

      if (!taskMeta.runnable) {
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
      }

      return createTaskObservable(activeTaskRunner, taskMeta, function () {
        return store.getState();
      })
      // Stop listening once the task is done.
      .takeUntil(actions.ofType((_Actions2 || _Actions()).TASK_COMPLETED, (_Actions2 || _Actions()).TASK_ERRORED, (_Actions2 || _Actions()).TASK_STOPPED));
    }));
  });
}

function setProjectRootEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).SET_PROJECT_ROOT).do(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).SET_PROJECT_ROOT);
    var projectRoot = action.payload.projectRoot;

    // Set the project root on all registered task runners.
    store.getState().taskRunners.forEach(function (taskRunner) {
      if (typeof taskRunner.setProjectRoot === 'function') {
        taskRunner.setProjectRoot(projectRoot);
      }
    });
  })
  // This is just for side-effects
  .ignoreElements();
}

function setToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).SET_TOOLBAR_VISIBILITY).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).SET_TOOLBAR_VISIBILITY);
    var visible = action.payload.visible;

    return {
      type: (_Actions2 || _Actions()).TOOLBAR_VISIBILITY_UPDATED,
      payload: { visible: visible }
    };
  });
}

function stopTaskEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).STOP_TASK).switchMap(function (action) {
    var _store$getState = store.getState();

    var runningTaskInfo = _store$getState.runningTaskInfo;

    var task = runningTaskInfo == null ? null : runningTaskInfo.task;
    if (task == null) {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({
      type: (_Actions2 || _Actions()).TASK_STOPPED,
      payload: { task: task }
    });
  });
}

function toggleToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).TOGGLE_TOOLBAR_VISIBILITY).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).TOGGLE_TOOLBAR_VISIBILITY);
    var state = store.getState();
    var taskRunnerId = action.payload.taskRunnerId;

    // If no taskRunnerId is provided, just toggle the visibility.
    if (taskRunnerId == null) {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).setToolbarVisibility(!state.visible));
    }

    // If the active task corresponds to the task runner you want to toggle, just toggle the
    // visibility.
    var activeTaskId = state.activeTaskId;

    if (activeTaskId != null && activeTaskId.taskRunnerId === taskRunnerId) {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).setToolbarVisibility(!state.visible));
    }

    // Choose the first task for that task runner.
    var taskListForRunner = state.taskLists.get(taskRunnerId) || [];
    var taskIdToSelect = taskListForRunner.length > 0 ? taskListForRunner[0] : null;
    if (taskIdToSelect == null) {
      var taskRunner = state.taskRunners.get(taskRunnerId);
      (0, (_assert2 || _assert()).default)(taskRunner != null);
      atom.notifications.addWarning('The ' + taskRunner.name + ' task runner doesn\'t have any tasks!');
    }

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat(
    // Make sure the toolbar is shown.
    (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).setToolbarVisibility(true)),

    // Select the task.
    taskIdToSelect == null ? (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty() : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).selectTask(taskIdToSelect)));
  });
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(taskRunner, taskMeta, getState) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.defer(function () {
    var task = taskRunner.runTask(taskMeta.type);
    var events = (0, (_commonsNodeTasks2 || _commonsNodeTasks()).observableFromTask)(task);

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({
      type: (_Actions2 || _Actions()).TASK_STARTED,
      payload: { task: task }
    }).concat(events.filter(function (event) {
      return event.type === 'progress';
    }).map(function (event) {
      return {
        type: (_Actions2 || _Actions()).TASK_PROGRESS,
        payload: { progress: event.progress }
      };
    })).concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({
      type: (_Actions2 || _Actions()).TASK_COMPLETED,
      payload: { task: task }
    }));
  }).catch(function (error) {
    atom.notifications.addError('The task "' + taskMeta.label + '" failed', {
      detail: error.stack,
      dismissable: true
    });

    var _getState = getState();

    var runningTaskInfo = _getState.runningTaskInfo;

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({
      type: (_Actions2 || _Actions()).TASK_ERRORED,
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