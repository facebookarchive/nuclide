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
exports.app = app;

var _collection;

function _load_collection() {
  return _collection = require('../../../commons-node/collection');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Normally there would be more than one reducer. Since we were using a single reducer here before
// we ported to Redux, we just left it this way.
function app(state, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SELECT_TASK:
      {
        const taskId = action.payload.taskId;

        return Object.assign({}, state, {
          activeTaskId: taskId,
          previousSessionActiveTaskId: null
        });
      }
    case (_Actions || _load_Actions()).TASK_COMPLETED:
      {
        return Object.assign({}, state, {
          runningTaskInfo: null
        });
      }
    case (_Actions || _load_Actions()).TASK_PROGRESS:
      {
        const progress = action.payload.progress;

        return Object.assign({}, state, {
          runningTaskInfo: Object.assign({}, state.runningTaskInfo, {
            progress: progress
          })
        });
      }
    case (_Actions || _load_Actions()).TASK_ERRORED:
      {
        return Object.assign({}, state, {
          runningTaskInfo: null
        });
      }
    case (_Actions || _load_Actions()).TASK_STARTED:
      {
        const task = action.payload.task;

        return Object.assign({}, state, {
          runningTaskInfo: {
            task: task,
            progress: null
          }
        });
      }
    case (_Actions || _load_Actions()).TASK_STOPPED:
      {
        return Object.assign({}, state, {
          runningTaskInfo: null
        });
      }
    case (_Actions || _load_Actions()).TOOLBAR_VISIBILITY_UPDATED:
      {
        return Object.assign({}, state, {
          visible: action.payload.visible
        });
      }
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      {
        const projectRoot = action.payload.projectRoot;

        return Object.assign({}, state, {
          projectRoot: projectRoot
        });
      }
    case (_Actions || _load_Actions()).REGISTER_TASK_RUNNER:
      {
        const taskRunner = action.payload.taskRunner;

        return Object.assign({}, state, {
          taskRunners: new Map(state.taskRunners).set(taskRunner.id, taskRunner)
        });
      }
    case (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER:
      {
        const id = action.payload.id;

        const taskRunners = new Map(state.taskRunners);
        const taskLists = new Map(state.taskLists);
        taskRunners.delete(id);
        taskLists.delete(id);
        return validateActiveTask(Object.assign({}, state, {
          taskRunners: taskRunners,
          taskLists: taskLists
        }));
      }
    case (_Actions || _load_Actions()).TASK_LIST_UPDATED:
      {
        var _action$payload = action.payload;
        const taskList = _action$payload.taskList,
              taskRunnerId = _action$payload.taskRunnerId;

        const taskRunner = state.taskRunners.get(taskRunnerId);
        const taskRunnerName = taskRunner && taskRunner.name;
        const annotatedTaskList = taskList.map(taskMeta => Object.assign({}, taskMeta, { taskRunnerId: taskRunnerId, taskRunnerName: taskRunnerName }));

        // If the task list hasn't changed, ignore it.
        if ((0, (_collection || _load_collection()).arrayEqual)(annotatedTaskList, state.taskLists.get(taskRunnerId) || [], (_shallowequal || _load_shallowequal()).default)) {
          return state;
        }

        const newState = Object.assign({}, state, {
          taskLists: new Map(state.taskLists).set(taskRunnerId, annotatedTaskList)
        });

        const prevTaskId = state.previousSessionActiveTaskId;

        // If the new tasks contain the one we were waiting to restore from the user's previous
        // session make it the active one.
        if (prevTaskId != null && taskRunnerId === prevTaskId.taskRunnerId && annotatedTaskList.some(taskMeta => taskMeta.type === prevTaskId.type)) {
          return Object.assign({}, newState, {
            activeTaskId: state.previousSessionActiveTaskId,
            previousSessionActiveTaskId: null
          });
        }

        return validateActiveTask(newState);
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
  return Object.assign({}, state, {
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
  const activeTaskId = state.activeTaskId;

  for (const taskList of state.taskLists.values()) {
    for (const taskMeta of taskList) {
      if (taskMeta.taskRunnerId === activeTaskId.taskRunnerId && taskMeta.type === activeTaskId.type && !taskMeta.disabled) {
        return true;
      }
    }
  }
  return false;
}