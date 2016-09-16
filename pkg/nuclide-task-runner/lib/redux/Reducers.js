'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AnnotatedTaskMetadata, AppState} from '../types';

import {arrayEqual} from '../../../commons-node/collection';
import * as Actions from './Actions';
import shallowEqual from 'shallowequal';

// Normally there would be more than one reducer. Since we were using a single reducer here before
// we ported to Redux, we just left it this way.
export function app(state: AppState, action: Action): AppState {
  switch (action.type) {
    case Actions.SELECT_TASK: {
      const {taskId} = action.payload;
      return {
        ...state,
        activeTaskId: taskId,
        previousSessionActiveTaskId: null,
      };
    }
    case Actions.TASK_COMPLETED: {
      return {
        ...state,
        runningTaskInfo: null,
      };
    }
    case Actions.TASK_PROGRESS: {
      const {progress} = action.payload;
      return {
        ...state,
        runningTaskInfo: {
          ...state.runningTaskInfo,
          progress,
        },
      };
    }
    case Actions.TASK_ERRORED: {
      return {
        ...state,
        runningTaskInfo: null,
      };
    }
    case Actions.TASK_STARTED: {
      const {task} = action.payload;
      return {
        ...state,
        runningTaskInfo: {
          task,
          progress: null,
        },
      };
    }
    case Actions.TASK_STOPPED: {
      return {
        ...state,
        runningTaskInfo: null,
      };
    }
    case Actions.TOOLBAR_VISIBILITY_UPDATED: {
      return {
        ...state,
        visible: action.payload.visible,
      };
    }
    case Actions.SET_PROJECT_ROOT: {
      const {projectRoot} = action.payload;
      return {
        ...state,
        projectRoot,
      };
    }
    case Actions.REGISTER_TASK_RUNNER: {
      const {taskRunner} = action.payload;
      return {
        ...state,
        taskRunners: new Map(state.taskRunners).set(taskRunner.id, taskRunner),
      };
    }
    case Actions.UNREGISTER_TASK_RUNNER: {
      const {id} = action.payload;
      const taskRunners = new Map(state.taskRunners);
      const taskLists = new Map(state.taskLists);
      taskRunners.delete(id);
      taskLists.delete(id);
      return validateActiveTask({
        ...state,
        taskRunners,
        taskLists,
      });
    }
    case Actions.TASK_LIST_UPDATED: {
      const {taskList, taskRunnerId} = action.payload;
      const taskRunner = state.taskRunners.get(taskRunnerId);
      const taskRunnerName = taskRunner && taskRunner.name;
      const annotatedTaskList = taskList
        .map(taskMeta => ({...taskMeta, taskRunnerId, taskRunnerName}));

      // If the task list hasn't changed, ignore it.
      if (arrayEqual(annotatedTaskList, state.taskLists.get(taskRunnerId) || [], shallowEqual)) {
        return state;
      }

      const newState = {
        ...state,
        taskLists: new Map(state.taskLists).set(taskRunnerId, annotatedTaskList),
      };

      const prevTaskId = state.previousSessionActiveTaskId;

      // If the new tasks contain the one we were waiting to restore from the user's previous
      // session make it the active one.
      if (
        prevTaskId != null
        && taskRunnerId === prevTaskId.taskRunnerId
        && annotatedTaskList.some(taskMeta => taskMeta.type === prevTaskId.type)
      ) {
        return {
          ...newState,
          activeTaskId: state.previousSessionActiveTaskId,
          previousSessionActiveTaskId: null,
        };
      }

      return validateActiveTask(newState);
    }
  }

  return state;
}

/**
 * Ensure that the active task is in the task list. If not, pick a fallback.
 */
function validateActiveTask(state: AppState): AppState {
  if (activeTaskIsValid(state)) { return state; }
  const firstTask = getFirstTask(state.taskLists);
  return {
    ...state,
    activeTaskId: firstTask == null
      ? null
      : {type: firstTask.type, taskRunnerId: firstTask.taskRunnerId},
    // Remember what we really wanted, so we can return to it later.
    previousSessionActiveTaskId: state.previousSessionActiveTaskId || state.activeTaskId,
  };
}

/**
 * Is the active task a valid one according to the tasks we have?
 */
function activeTaskIsValid(state: AppState): boolean {
  if (state.activeTaskId == null) { return false; }
  const {activeTaskId} = state;
  for (const taskList of state.taskLists.values()) {
    for (const taskMeta of taskList) {
      if (
        taskMeta.taskRunnerId === activeTaskId.taskRunnerId
        && taskMeta.type === activeTaskId.type
        && !taskMeta.disabled
      ) {
        return true;
      }
    }
  }
  return false;
}

function getFirstTask(
  taskLists: Map<string,
  Array<AnnotatedTaskMetadata>>,
): ?AnnotatedTaskMetadata {
  let candidate;
  for (const taskList of taskLists.values()) {
    for (const taskMeta of taskList) {
      // For backwards compat, we don't (currently) require that the "disabled" property be present,
      // but we prefer tasks that have it.
      if (taskMeta.disabled === false) {
        return taskMeta;
      } else if (!taskMeta.disabled) {
        candidate = taskMeta;
      }
    }
  }
  return candidate;
}
