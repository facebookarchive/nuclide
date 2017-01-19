'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = app;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _taskIdsAreEqual;

function _load_taskIdsAreEqual() {
  return _taskIdsAreEqual = require('../taskIdsAreEqual');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Normally there would be more than one reducer. Since we were using a single reducer here before
// we ported to Redux, we just left it this way.
function app(state, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SELECT_TASK:
      {
        const { taskId } = action.payload;
        return Object.assign({}, state, {
          activeTaskId: taskId,
          activeTaskRunnerId: taskId.taskRunnerId,
          previousSessionActiveTaskId: null,
          previousSessionActiveTaskRunnerId: null
        });
      }
    case (_Actions || _load_Actions()).SELECT_TASK_RUNNER:
      {
        const { taskRunnerId } = action.payload;
        return Object.assign({}, state, {
          activeTaskRunnerId: taskRunnerId,
          previousSessionActiveTaskRunnerId: null
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
        const { progress } = action.payload;
        return Object.assign({}, state, {
          runningTaskInfo: Object.assign({}, state.runningTaskInfo, {
            progress
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
        const { task } = action.payload;
        return Object.assign({}, state, {
          runningTaskInfo: {
            task,
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
    case (_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY:
      {
        const { visible } = action.payload;
        return Object.assign({}, state, { visible });
      }
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      {
        const { projectRoot } = action.payload;
        return Object.assign({}, state, {
          projectRoot,
          projectWasOpened: state.projectWasOpened || projectRoot != null,
          tasksAreReady: false
        });
      }
    case (_Actions || _load_Actions()).SET_TASK_LISTS:
      {
        const { taskLists } = action.payload;
        return validateActiveTask(Object.assign({}, state, { taskLists }));
      }
    case (_Actions || _load_Actions()).TASKS_READY:
      {
        // When the tasks become ready, select a default task.
        const initialTaskMeta = getInitialTaskMeta(state.previousSessionActiveTaskId, state.activeTaskId, state.taskLists);

        return validateActiveTask(Object.assign({}, state, {
          tasksAreReady: true,
          activeTaskId: initialTaskMeta == null ? null : { taskRunnerId: initialTaskMeta.taskRunnerId, type: initialTaskMeta.type },
          activeTaskRunnerId: initialTaskMeta == null ? null : initialTaskMeta.taskRunnerId,
          previousSessionActiveTaskId: null
        }));
      }
    case (_Actions || _load_Actions()).INITIALIZE_VIEW:
      {
        const { visible } = action.payload;
        return Object.assign({}, state, {
          viewIsInitialized: true,
          visible,
          previousSessionVisible: null
        });
      }
    case (_Actions || _load_Actions()).REGISTER_TASK_RUNNER:
      {
        const { taskRunner } = action.payload;
        return Object.assign({}, state, {
          taskRunners: new Map(state.taskRunners).set(taskRunner.id, taskRunner)
        });
      }
    case (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER:
      {
        const { id } = action.payload;
        const taskRunners = new Map(state.taskRunners);
        const taskLists = new Map(state.taskLists);
        taskRunners.delete(id);
        taskLists.delete(id);
        return validateActiveTask(Object.assign({}, state, {
          taskRunners,
          taskLists
        }));
      }
  }

  return state;
}

/**
 * Ensure that the active task is in the task list. If not, pick a fallback.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function validateActiveTask(state) {
  if (activeTaskIsValid(state)) {
    return state;
  }
  return Object.assign({}, state, {
    activeTaskId: null,
    activeTaskRunnerId: null
  });
}

/**
 * Is the active task a valid one according to the tasks we have?
 */
function activeTaskIsValid(state) {
  if (state.activeTaskId == null) {
    return false;
  }
  const { activeTaskId } = state;
  for (const taskList of state.taskLists.values()) {
    for (const taskMeta of taskList) {
      if (taskMeta.taskRunnerId === activeTaskId.taskRunnerId && taskMeta.type === activeTaskId.type && !taskMeta.disabled) {
        return true;
      }
    }
  }
  return false;
}

const flatten = arr => Array.prototype.concat.apply([], arr);

function getInitialTaskMeta(previousSessionActiveTaskId, activeTaskId, taskLists) {
  const allTaskMetadatas = flatten(Array.from(taskLists.values()));
  let candidate;

  for (const taskMeta of allTaskMetadatas) {
    // No disabled tasks.
    if (taskMeta.disabled) {
      continue;
    }

    // If the task we're waiting to restore is present, use that.
    if (previousSessionActiveTaskId && (0, (_taskIdsAreEqual || _load_taskIdsAreEqual()).taskIdsAreEqual)(taskMeta, previousSessionActiveTaskId)) {
      return taskMeta;
    }

    // If the task that's already active is present, use that.
    if (activeTaskId && (0, (_taskIdsAreEqual || _load_taskIdsAreEqual()).taskIdsAreEqual)(taskMeta, activeTaskId)) {
      return taskMeta;
    }

    if (candidate == null) {
      candidate = taskMeta;
      continue;
    }

    // Prefer tasks that are explicitly enabled over those that aren't.
    if (taskMeta.disabled === false && candidate.disabled == null) {
      candidate = taskMeta;
      continue;
    }

    // Prefer tasks with higher priority.
    const priorityDiff = (taskMeta.priority || 0) - (candidate.priority || 0);
    if (priorityDiff !== 0) {
      if (priorityDiff > 0) {
        candidate = taskMeta;
      }
      continue;
    }

    // Prefer task runner names that come first alphabetically.
    const nameDiff = taskMeta.taskRunnerName.localeCompare(candidate.taskRunnerName);
    if (nameDiff !== 0) {
      if (nameDiff < 0) {
        candidate = taskMeta;
      }
      continue;
    }

    // Prefer task types that come first alphabetically.
    const typeDiff = taskMeta.type.localeCompare(candidate.type);
    if (typeDiff !== 0) {
      if (typeDiff < 0) {
        candidate = taskMeta;
      }
      continue;
    }
  }

  return candidate;
}