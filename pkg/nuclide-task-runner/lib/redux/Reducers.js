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
        if (state.viewIsInitialized) {
          return Object.assign({}, state, { visible });
        } else {
          // If you toggle before we've initialized, don't actually show the toolbar; just update the
          // value we'll use when we eventually initialize.
          return Object.assign({}, state, { previousSessionVisible: visible });
        }
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
        const tasksAreReady = state.tasksAreReady || (0, (_collection || _load_collection()).areSetsEqual)(new Set(taskLists.keys()), new Set(state.taskRunners.keys()));

        let newState = Object.assign({}, state, { tasksAreReady, taskLists });

        if (tasksAreReady && !state.tasksAreReady) {
          const initialTaskMeta = getInitialTaskMeta(state.previousSessionActiveTaskId, state.activeTaskId, taskLists);

          // Update the active task whenever tasks become ready.
          newState = Object.assign({}, newState, {
            activeTaskId: initialTaskMeta == null ? null : { taskRunnerId: initialTaskMeta.taskRunnerId, type: initialTaskMeta.type },
            previousSessionActiveTaskId: null
          });

          // Initialize the view (select a default task and set the visibility). If a project hasn't
          // been opened yet, we defer this until one has been. When that happens, a directory will be
          // added -> the current working root will be set -> we'll request taks lists -> this action
          // will be called again and we'll initialize.
          if (!state.viewIsInitialized && state.projectWasOpened) {
            // Initialize the view if we've yet to do so.
            newState = Object.assign({}, newState, {
              viewIsInitialized: true,
              visible: state.previousSessionVisible != null
              // Use the last known state, if we have one.
              ? state.previousSessionVisible
              // Otherwise, only show the toolbar if the initial task is enabled. (It's okay if a
              // task runner doesn't give us a "disabled" property for now, but we're not going to
              // show the bar for possibly irrelevant tasks.)
              : initialTaskMeta != null && initialTaskMeta.disabled === false,
              previousSessionVisible: null
            });
          }
        }

        return validateActiveTask(newState);
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
function validateActiveTask(state) {
  if (activeTaskIsValid(state)) {
    return state;
  }
  return Object.assign({}, state, {
    activeTaskId: null
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