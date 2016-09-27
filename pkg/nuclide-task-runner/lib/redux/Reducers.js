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

exports.app = app;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../../commons-node/collection');
}

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

var _shallowequal2;

function _shallowequal() {
  return _shallowequal2 = _interopRequireDefault(require('shallowequal'));
}

// Normally there would be more than one reducer. Since we were using a single reducer here before
// we ported to Redux, we just left it this way.

function app(state, action) {
  switch (action.type) {
    case (_Actions2 || _Actions()).SELECT_TASK:
      {
        var taskId = action.payload.taskId;

        return _extends({}, state, {
          activeTaskId: taskId,
          previousSessionActiveTaskId: null
        });
      }
    case (_Actions2 || _Actions()).TASK_COMPLETED:
      {
        return _extends({}, state, {
          runningTaskInfo: null
        });
      }
    case (_Actions2 || _Actions()).TASK_PROGRESS:
      {
        var progress = action.payload.progress;

        return _extends({}, state, {
          runningTaskInfo: _extends({}, state.runningTaskInfo, {
            progress: progress
          })
        });
      }
    case (_Actions2 || _Actions()).TASK_ERRORED:
      {
        return _extends({}, state, {
          runningTaskInfo: null
        });
      }
    case (_Actions2 || _Actions()).TASK_STARTED:
      {
        var task = action.payload.task;

        return _extends({}, state, {
          runningTaskInfo: {
            task: task,
            progress: null
          }
        });
      }
    case (_Actions2 || _Actions()).TASK_STOPPED:
      {
        return _extends({}, state, {
          runningTaskInfo: null
        });
      }
    case (_Actions2 || _Actions()).TOOLBAR_VISIBILITY_UPDATED:
      {
        return _extends({}, state, {
          visible: action.payload.visible
        });
      }
    case (_Actions2 || _Actions()).SET_PROJECT_ROOT:
      {
        var projectRoot = action.payload.projectRoot;

        return _extends({}, state, {
          projectRoot: projectRoot
        });
      }
    case (_Actions2 || _Actions()).REGISTER_TASK_RUNNER:
      {
        var taskRunner = action.payload.taskRunner;

        return _extends({}, state, {
          taskRunners: new Map(state.taskRunners).set(taskRunner.id, taskRunner)
        });
      }
    case (_Actions2 || _Actions()).UNREGISTER_TASK_RUNNER:
      {
        var id = action.payload.id;

        var taskRunners = new Map(state.taskRunners);
        var taskLists = new Map(state.taskLists);
        taskRunners.delete(id);
        taskLists.delete(id);
        return validateActiveTask(_extends({}, state, {
          taskRunners: taskRunners,
          taskLists: taskLists
        }));
      }
    case (_Actions2 || _Actions()).TASK_LIST_UPDATED:
      {
        var _ret = (function () {
          var _action$payload = action.payload;
          var taskList = _action$payload.taskList;
          var taskRunnerId = _action$payload.taskRunnerId;

          var taskRunner = state.taskRunners.get(taskRunnerId);
          var taskRunnerName = taskRunner && taskRunner.name;
          var annotatedTaskList = taskList.map(function (taskMeta) {
            return _extends({}, taskMeta, { taskRunnerId: taskRunnerId, taskRunnerName: taskRunnerName });
          });

          // If the task list hasn't changed, ignore it.
          if ((0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayEqual)(annotatedTaskList, state.taskLists.get(taskRunnerId) || [], (_shallowequal2 || _shallowequal()).default)) {
            return {
              v: state
            };
          }

          var newState = _extends({}, state, {
            taskLists: new Map(state.taskLists).set(taskRunnerId, annotatedTaskList)
          });

          var prevTaskId = state.previousSessionActiveTaskId;

          // If the new tasks contain the one we were waiting to restore from the user's previous
          // session make it the active one.
          if (prevTaskId != null && taskRunnerId === prevTaskId.taskRunnerId && annotatedTaskList.some(function (taskMeta) {
            return taskMeta.type === prevTaskId.type;
          })) {
            return {
              v: _extends({}, newState, {
                activeTaskId: state.previousSessionActiveTaskId,
                previousSessionActiveTaskId: null
              })
            };
          }

          return {
            v: validateActiveTask(newState)
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
  }

  return state;
}

/**
 * Ensure that the active task is in the task list. If not, pick a fallback.
 */
function validateActiveTask(state) {
  if (activeTaskIsValid(state)) {
    return state;
  }
  return _extends({}, state, {
    activeTaskId: null,
    // Remember what we really wanted, so we can return to it later.
    previousSessionActiveTaskId: state.previousSessionActiveTaskId || state.activeTaskId
  });
}

/**
 * Is the active task a valid one according to the tasks we have?
 */
function activeTaskIsValid(state) {
  if (state.activeTaskId == null) {
    return false;
  }
  var activeTaskId = state.activeTaskId;

  for (var taskList of state.taskLists.values()) {
    for (var taskMeta of taskList) {
      if (taskMeta.taskRunnerId === activeTaskId.taskRunnerId && taskMeta.type === activeTaskId.type && !taskMeta.disabled) {
        return true;
      }
    }
  }
  return false;
}