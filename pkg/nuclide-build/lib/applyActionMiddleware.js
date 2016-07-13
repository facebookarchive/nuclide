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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.applyActionMiddleware = applyActionMiddleware;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeOnce2;

function _commonsNodeOnce() {
  return _commonsNodeOnce2 = _interopRequireDefault(require('../../commons-node/once'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _getActiveBuildSystem2;

function _getActiveBuildSystem() {
  return _getActiveBuildSystem2 = require('./getActiveBuildSystem');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var HANDLED_ACTION_TYPES = [(_ActionTypes2 || _ActionTypes()).RUN_TASK, (_ActionTypes2 || _ActionTypes()).STOP_TASK, (_ActionTypes2 || _ActionTypes()).REFRESH_TASKS];

function applyActionMiddleware(actions, getState) {

  var output = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge(

  // Forward on the actions that we don't handle here.
  actions.filter(function (action) {
    return HANDLED_ACTION_TYPES.indexOf(action.type) === -1;
  }), (0, (_commonsNodeStream2 || _commonsNodeStream()).compact)(actions.filter(function (action) {
    return action.type === (_ActionTypes2 || _ActionTypes()).STOP_TASK;
  }).map(function (action) {
    var _getState = getState();

    var taskStatus = _getState.taskStatus;

    return taskStatus == null ? null : taskStatus.info;
  })).do(function (taskInfo) {
    taskInfo.cancel();
  }).map(function (taskInfo) {
    return {
      type: (_ActionTypes2 || _ActionTypes()).TASK_STOPPED,
      payload: { taskInfo: taskInfo }
    };
  }),

  // Update the tasks...
  actions
  // ...when the toolbar becomes visible
  .filter(function (action) {
    return action.type === (_ActionTypes2 || _ActionTypes()).TOOLBAR_VISIBILITY_UPDATED && action.payload.visible;
  }).merge(
  // ...or when it's already visible and we hear a REFRESH_TASKS action.
  actions.filter(function (action) {
    return action.type === (_ActionTypes2 || _ActionTypes()).REFRESH_TASKS && getState().visible;
  })).map(function (action) {
    return (0, (_getActiveBuildSystem2 || _getActiveBuildSystem()).getActiveBuildSystem)(getState());
  }).distinctUntilChanged().switchMap(function (activeBuildSystem) {
    var tasksToActions = function tasksToActions(tasks) {
      return {
        type: (_ActionTypes2 || _ActionTypes()).TASKS_UPDATED,
        payload: { tasks: tasks }
      };
    };
    var noTasks = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(tasksToActions([]));
    return activeBuildSystem == null ? noTasks : noTasks.concat((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(activeBuildSystem.observeTasks.bind(activeBuildSystem)).map(tasksToActions));
  }),

  // Dispatch the run action to the selected build system and collect the results.
  actions.filter(function (action) {
    return action.type === (_ActionTypes2 || _ActionTypes()).RUN_TASK;
  }).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).RUN_TASK);
    var activeBuildSystem = (0, (_getActiveBuildSystem2 || _getActiveBuildSystem()).getActiveBuildSystem)(getState());
    var taskType = action.payload.taskType;

    if (activeBuildSystem == null) {
      throw new Error('No build system is selected');
    }

    var task = getState().tasks.find(function (t) {
      return t.type === taskType;
    });
    (0, (_assert2 || _assert()).default)(task != null);

    if (!task.enabled) {
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }

    return runTask(activeBuildSystem, task, getState)
    // Stop listening once the task is done.
    .takeUntil(output.filter(function (a) {
      return a.type === (_ActionTypes2 || _ActionTypes()).TASK_COMPLETED || a.type === (_ActionTypes2 || _ActionTypes()).TASK_ERRORED || a.type === (_ActionTypes2 || _ActionTypes()).TASK_STOPPED;
    }));
  })).share();

  return output;
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function runTask(buildSystem, task, getState) {
  var finished = undefined;
  // $FlowFixMe(matthewwithanm): Type this.
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.using(function () {
    var taskInfo = buildSystem.runTask(task.type);
    // We may call cancel multiple times so let's make sure it's idempotent.
    taskInfo = _extends({}, taskInfo, { cancel: (0, (_commonsNodeOnce2 || _commonsNodeOnce()).default)(taskInfo.cancel) });
    finished = false;
    return {
      taskInfo: taskInfo,
      unsubscribe: function unsubscribe() {
        if (!finished) {
          taskInfo.cancel();
        }
      }
    };
  }, function (_ref) {
    var taskInfo = _ref.taskInfo;
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(taskInfo);
  }).switchMap(function (taskInfo) {
    var progressStream = taskInfo.observeProgress == null ? (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty() : (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(taskInfo.observeProgress.bind(taskInfo));

    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: (_ActionTypes2 || _ActionTypes()).TASK_STARTED,
      payload: { taskInfo: taskInfo }
    }).concat(progressStream.map(function (progress) {
      return {
        type: (_ActionTypes2 || _ActionTypes()).TASK_PROGRESS,
        payload: { progress: progress }
      };
    })).merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(taskInfo.onDidError.bind(taskInfo)).map(function (err) {
      throw err;
    })).takeUntil((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(taskInfo.onDidComplete.bind(taskInfo))).concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: (_ActionTypes2 || _ActionTypes()).TASK_COMPLETED,
      payload: { taskInfo: taskInfo }
    }));
  }).catch(function (error) {
    atom.notifications.addError('The task "' + task.label + '" failed', {
      description: error.message,
      dismissable: true
    });

    var _getState2 = getState();

    var taskStatus = _getState2.taskStatus;

    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: (_ActionTypes2 || _ActionTypes()).TASK_ERRORED,
      payload: {
        error: error,
        taskInfo: taskStatus == null ? null : taskStatus.info
      }
    });
  }).finally(function () {
    finished = true;
  }).share();
}