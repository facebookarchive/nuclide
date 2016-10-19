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

var _commonsNodeTasks;

function _load_commonsNodeTasks() {
  return _commonsNodeTasks = require('../../../commons-node/tasks');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../../commons-node/event');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _getTaskMetadata;

function _load_getTaskMetadata() {
  return _getTaskMetadata = require('../getTaskMetadata');
}

var _reduxSelectors;

function _load_reduxSelectors() {
  return _reduxSelectors = require('../redux/Selectors');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

function registerTaskRunnerEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REGISTER_TASK_RUNNER).flatMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_Actions || _load_Actions()).REGISTER_TASK_RUNNER);
    var taskRunner = action.payload.taskRunner;

    // Set the project root on the new task runner.
    var setProjectRoot = taskRunner.setProjectRoot;

    if (typeof setProjectRoot === 'function') {
      var projectRoot = store.getState().projectRoot;
      setProjectRoot.call(taskRunner, projectRoot);
    }

    var taskListToAction = function taskListToAction(taskList) {
      return {
        type: (_Actions || _load_Actions()).TASK_LIST_UPDATED,
        payload: {
          taskRunnerId: taskRunner.id,
          taskList: taskList
        }
      };
    };
    var unregistrationEvents = actions.filter(function (a) {
      return a.type === (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER && a.payload.id === taskRunner.id;
    });
    return (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(taskRunner.observeTaskList.bind(taskRunner)).map(taskListToAction).takeUntil(unregistrationEvents);
  });
}

function runTaskEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).RUN_TASK).switchMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_Actions || _load_Actions()).RUN_TASK);
    var taskToRun = action.payload.taskId || (0, (_reduxSelectors || _load_reduxSelectors()).getActiveTaskId)(store.getState());

    // Don't do anything if there's no active task.
    if (taskToRun == null) {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    }

    // Don't do anything if a task is already running.
    if (store.getState().runningTaskInfo != null) {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    }

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat(taskIdsAreEqual(store.getState().activeTaskId, taskToRun) ? (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty() : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).selectTask(taskToRun)), store.getState().visible ? (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty() : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true)), (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
      var state = store.getState();
      var activeTaskRunner = (0, (_reduxSelectors || _load_reduxSelectors()).getActiveTaskRunner)(state);

      if (activeTaskRunner == null) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }

      var taskMeta = (0, (_getTaskMetadata || _load_getTaskMetadata()).getTaskMetadata)(taskToRun, state.taskLists);
      (0, (_assert || _load_assert()).default)(taskMeta != null);

      if (!taskMeta.runnable) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }

      return createTaskObservable(activeTaskRunner, taskMeta, function () {
        return store.getState();
      })
      // Stop listening once the task is done.
      .takeUntil(actions.ofType((_Actions || _load_Actions()).TASK_COMPLETED, (_Actions || _load_Actions()).TASK_ERRORED, (_Actions || _load_Actions()).TASK_STOPPED));
    }));
  });
}

function setProjectRootEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROJECT_ROOT).do(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_Actions || _load_Actions()).SET_PROJECT_ROOT);
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
  return actions.ofType((_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY).map(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY);
    var visible = action.payload.visible;

    return {
      type: (_Actions || _load_Actions()).TOOLBAR_VISIBILITY_UPDATED,
      payload: { visible: visible }
    };
  });
}

function stopTaskEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).STOP_TASK).switchMap(function (action) {
    var _store$getState = store.getState();

    var runningTaskInfo = _store$getState.runningTaskInfo;

    var task = runningTaskInfo == null ? null : runningTaskInfo.task;
    if (task == null) {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    }
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
      type: (_Actions || _load_Actions()).TASK_STOPPED,
      payload: { task: task }
    });
  });
}

function toggleToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY).switchMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY);
    var state = store.getState();
    var taskRunnerId = action.payload.taskRunnerId;

    // If no taskRunnerId is provided, just toggle the visibility.
    if (taskRunnerId == null) {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).setToolbarVisibility(!state.visible));
    }

    // If the active task corresponds to the task runner you want to toggle, just toggle the
    // visibility.
    var activeTaskId = state.activeTaskId;

    if (activeTaskId != null && activeTaskId.taskRunnerId === taskRunnerId) {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).setToolbarVisibility(!state.visible));
    }

    // Choose the first task for that task runner.
    var taskListForRunner = state.taskLists.get(taskRunnerId) || [];
    var taskIdToSelect = taskListForRunner.length > 0 ? taskListForRunner[0] : null;
    if (taskIdToSelect == null) {
      var taskRunner = state.taskRunners.get(taskRunnerId);
      (0, (_assert || _load_assert()).default)(taskRunner != null);
      atom.notifications.addWarning('The ' + taskRunner.name + ' task runner doesn\'t have any tasks!');
    }

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat(
    // Make sure the toolbar is shown.
    (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true)),

    // Select the task.
    taskIdToSelect == null ? (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty() : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).selectTask(taskIdToSelect)));
  });
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(taskRunner, taskMeta, getState) {
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
    var task = taskRunner.runTask(taskMeta.type);
    var events = (0, (_commonsNodeTasks || _load_commonsNodeTasks()).observableFromTask)(task);

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
      type: (_Actions || _load_Actions()).TASK_STARTED,
      payload: { task: task }
    }).concat(events.filter(function (event) {
      return event.type === 'progress';
    }).map(function (event) {
      return {
        type: (_Actions || _load_Actions()).TASK_PROGRESS,
        payload: { progress: event.progress }
      };
    })).concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
      type: (_Actions || _load_Actions()).TASK_COMPLETED,
      payload: { task: task }
    }));
  }).catch(function (error) {
    atom.notifications.addError('The task "' + taskMeta.label + '" failed', {
      description: error.message,
      dismissable: true
    });
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Error running task:', taskMeta, error);

    var _getState = getState();

    var runningTaskInfo = _getState.runningTaskInfo;

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
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