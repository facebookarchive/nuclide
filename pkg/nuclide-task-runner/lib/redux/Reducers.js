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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

// Normally there would be more than one reducer. Since we were using a single reducer here before
// we ported to Redux, we just left it this way.

function app(state, action) {
  switch (action.type) {
    case (_Actions2 || _Actions()).PANEL_CREATED:
      {
        var panel = action.payload.panel;

        return _extends({}, state, {
          panel: panel
        });
      }
    case (_Actions2 || _Actions()).PANEL_DESTROYED:
      {
        return _extends({}, state, {
          panel: null
        });
      }
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
          taskStatus: null
        });
      }
    case (_Actions2 || _Actions()).TASK_PROGRESS:
      {
        var progress = action.payload.progress;

        return _extends({}, state, {
          taskStatus: _extends({}, state.taskStatus, {
            progress: progress
          })
        });
      }
    case (_Actions2 || _Actions()).TASK_ERRORED:
      {
        return _extends({}, state, {
          taskStatus: null
        });
      }
    case (_Actions2 || _Actions()).TASK_STARTED:
      {
        var taskInfo = action.payload.taskInfo;

        return _extends({}, state, {
          taskStatus: {
            info: taskInfo,
            progress: null
          }
        });
      }
    case (_Actions2 || _Actions()).TASK_STOPPED:
      {
        return _extends({}, state, {
          taskStatus: null
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
        var tasks = new Map(state.tasks);
        taskRunners.delete(id);
        tasks.delete(id);
        return _extends({}, state, {
          taskRunners: taskRunners,
          tasks: tasks
        });
      }
    case (_Actions2 || _Actions()).TASKS_UPDATED:
      {
        var _ret = (function () {
          var _action$payload = action.payload;
          var tasks = _action$payload.tasks;
          var taskRunnerId = _action$payload.taskRunnerId;

          var taskRunner = state.taskRunners.get(taskRunnerId);
          var taskRunnerName = taskRunner && taskRunner.name;
          var annotatedTasks = tasks.map(function (task) {
            return _extends({}, task, { taskRunnerId: taskRunnerId, taskRunnerName: taskRunnerName });
          });
          var newState = _extends({}, state, {
            tasks: new Map(state.tasks).set(taskRunnerId, annotatedTasks)
          });

          var prevTaskId = state.previousSessionActiveTaskId;

          // If the new tasks contain the one we were waiting to restore from the user's previous
          // session make it the active one.
          if (prevTaskId != null && taskRunnerId === prevTaskId.taskRunnerId && annotatedTasks.some(function (task) {
            return task.type === prevTaskId.type;
          })) {
            return {
              v: _extends({}, newState, {
                activeTaskId: state.previousSessionActiveTaskId,
                previousSessionActiveTaskId: null
              })
            };
          }

          // If there's no active task (or it was removed), just pick one.
          var activeTaskWasRemoved = function activeTaskWasRemoved() {
            if (state.activeTaskId == null) {
              return false;
            }
            var activeTaskType = state.activeTaskId.type;
            return state.activeTaskId.taskRunnerId === taskRunnerId && !annotatedTasks.some(function (task) {
              return task.type === activeTaskType;
            });
          };
          if (state.activeTaskId == null || activeTaskWasRemoved()) {
            var activeTask = getFirstTask(newState.tasks);
            return {
              v: _extends({}, newState, {
                activeTaskId: activeTask == null ? null : { type: activeTask.type, taskRunnerId: activeTask.taskRunnerId },
                // Remember what we really wanted, so we can return to it later.
                previousSessionActiveTaskId: state.previousSessionActiveTaskId || state.activeTaskId
              })
            };
          }

          return {
            v: newState
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
  }

  return state;
}

function getFirstTask(tasks) {
  for (var tasksArray of tasks.values()) {
    for (var task of tasksArray) {
      return task;
    }
  }
}