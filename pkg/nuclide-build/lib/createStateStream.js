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

exports.createStateStream = createStateStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

function createStateStream(actions, initialState) {
  var states = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.BehaviorSubject(initialState);
  actions.scan(accumulateState, initialState).subscribe(states);
  return states;
}

function accumulateState(state, action) {
  switch (action.type) {
    case (_ActionTypes2 || _ActionTypes()).PANEL_CREATED:
      {
        var panel = action.payload.panel;

        return _extends({}, state, {
          panel: panel
        });
      }
    case (_ActionTypes2 || _ActionTypes()).PANEL_DESTROYED:
      {
        return _extends({}, state, {
          panel: null
        });
      }
    case (_ActionTypes2 || _ActionTypes()).SELECT_TASK:
      {
        var taskType = action.payload.taskType;

        return _extends({}, state, {
          activeTaskType: taskType,
          previousSessionActiveTaskType: null
        });
      }
    case (_ActionTypes2 || _ActionTypes()).TASK_COMPLETED:
      {
        return _extends({}, state, {
          taskStatus: null
        });
      }
    case (_ActionTypes2 || _ActionTypes()).TASK_PROGRESS:
      {
        var progress = action.payload.progress;

        return _extends({}, state, {
          taskStatus: _extends({}, state.taskStatus, {
            progress: progress
          })
        });
      }
    case (_ActionTypes2 || _ActionTypes()).TASK_ERRORED:
      {
        return _extends({}, state, {
          taskStatus: null
        });
      }
    case (_ActionTypes2 || _ActionTypes()).TASK_STARTED:
      {
        var taskInfo = action.payload.taskInfo;

        return _extends({}, state, {
          taskStatus: {
            info: taskInfo,
            progress: null
          }
        });
      }
    case (_ActionTypes2 || _ActionTypes()).TASK_STOPPED:
      {
        return _extends({}, state, {
          taskStatus: null
        });
      }
    case (_ActionTypes2 || _ActionTypes()).TOOLBAR_VISIBILITY_UPDATED:
      {
        return _extends({}, state, {
          visible: action.payload.visible
        });
      }
    case (_ActionTypes2 || _ActionTypes()).REGISTER_BUILD_SYSTEM:
      {
        var buildSystem = action.payload.buildSystem;

        var newState = _extends({}, state, {
          buildSystems: new Map(state.buildSystems).set(buildSystem.id, buildSystem)
        });

        // If the newly selected build system is the one we were waiting to restore from the user's
        // previous session (or we have no active build system), make it the active one.
        if (buildSystem.id === state.previousSessionActiveBuildSystemId || state.activeBuildSystemId == null) {
          return setBuildSystem(newState, buildSystem.id);
        }

        return newState;
      }
    case (_ActionTypes2 || _ActionTypes()).SELECT_BUILD_SYSTEM:
      {
        var id = action.payload.id;

        return _extends({}, setBuildSystem(state, id), {

          // Now that the user has selected a build system, we no longer care about what the selected
          // one was the last session.
          previousSessionActiveBuildSystemId: null
        });
      }
    case (_ActionTypes2 || _ActionTypes()).UNREGISTER_BUILD_SYSTEM:
      {
        var id = action.payload.id;

        var buildSystems = new Map(state.buildSystems);
        buildSystems.delete(id);
        return _extends({}, state, {
          buildSystems: buildSystems
        });
      }
    case (_ActionTypes2 || _ActionTypes()).TASKS_UPDATED:
      {
        var tasks = action.payload.tasks;

        var newState = _extends({}, state, {
          tasks: tasks.slice()
        });

        // If the new tasks contain the one we were waiting to restore from the user's previous
        // session make it the active one.
        if (tasks.some(function (task) {
          return task.type === state.previousSessionActiveTaskType;
        })) {
          return _extends({}, newState, {
            activeTaskType: state.previousSessionActiveTaskType,
            previousSessionActiveTaskType: null
          });
        }

        // If there's no active task (or it was removed), change the active task to something
        // sensible.
        if (state.activeTaskType == null || !tasks.some(function (task) {
          return task.type === state.activeTaskType;
        })) {
          var activeTaskType = tasks.length > 0 ? tasks[0].type : null;
          return _extends({}, newState, {
            activeTaskType: activeTaskType,
            // Remember what we really wanted, so we can return to it later.
            previousSessionActiveTaskType: state.previousSessionActiveTaskType || state.activeTaskType
          });
        }

        return newState;
      }
  }

  throw new Error('Unrecognized action type: ' + action.type);
}

function setBuildSystem(state, buildSystemId) {
  return _extends({}, state, {

    // We're not sure if the new build system will have the currently active task type.
    activeTaskType: null,
    previousSessionActiveTaskType: state.previousSessionActiveTaskType || state.activeTaskType,

    activeBuildSystemId: buildSystemId
  });
}