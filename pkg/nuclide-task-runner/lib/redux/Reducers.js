'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AnnotatedTask, AppState} from '../types';

import * as Actions from './Actions';

// Normally there would be more than one reducer. Since we were using a single reducer here before
// we ported to Redux, we just left it this way.
export function app(state: AppState, action: Action): AppState {
  switch (action.type) {
    case Actions.PANEL_CREATED: {
      const {panel} = action.payload;
      return {
        ...state,
        panel,
      };
    }
    case Actions.PANEL_DESTROYED: {
      return {
        ...state,
        panel: null,
      };
    }
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
        taskStatus: null,
      };
    }
    case Actions.TASK_PROGRESS: {
      const {progress} = action.payload;
      return {
        ...state,
        taskStatus: {
          ...state.taskStatus,
          progress,
        },
      };
    }
    case Actions.TASK_ERRORED: {
      return {
        ...state,
        taskStatus: null,
      };
    }
    case Actions.TASK_STARTED: {
      const {taskInfo} = action.payload;
      return {
        ...state,
        taskStatus: {
          info: taskInfo,
          progress: null,
        },
      };
    }
    case Actions.TASK_STOPPED: {
      return {
        ...state,
        taskStatus: null,
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
      const tasks = new Map(state.tasks);
      taskRunners.delete(id);
      tasks.delete(id);
      return {
        ...state,
        taskRunners,
        tasks,
      };
    }
    case Actions.TASKS_UPDATED: {
      const {tasks, taskRunnerId} = action.payload;
      const taskRunner = state.taskRunners.get(taskRunnerId);
      const taskRunnerName = taskRunner && taskRunner.name;
      const annotatedTasks = tasks.map(task => ({...task, taskRunnerId, taskRunnerName}));
      const newState = {
        ...state,
        tasks: new Map(state.tasks).set(taskRunnerId, annotatedTasks),
      };

      const prevTaskId = state.previousSessionActiveTaskId;

      // If the new tasks contain the one we were waiting to restore from the user's previous
      // session make it the active one.
      if (
        prevTaskId != null
        && taskRunnerId === prevTaskId.taskRunnerId
        && annotatedTasks.some(task => task.type === prevTaskId.type)
      ) {
        return {
          ...newState,
          activeTaskId: state.previousSessionActiveTaskId,
          previousSessionActiveTaskId: null,
        };
      }

      // If there's no active task (or it was removed), just pick one.
      const activeTaskWasRemoved = () => {
        if (state.activeTaskId == null) { return false; }
        const activeTaskType = state.activeTaskId.type;
        return state.activeTaskId.taskRunnerId === taskRunnerId
          && !annotatedTasks.some(task => task.type === activeTaskType);
      };
      if (state.activeTaskId == null || activeTaskWasRemoved()) {
        const activeTask = getFirstTask(newState.tasks);
        return {
          ...newState,
          activeTaskId: activeTask == null
            ? null
            : {type: activeTask.type, taskRunnerId: activeTask.taskRunnerId},
          // Remember what we really wanted, so we can return to it later.
          previousSessionActiveTaskId: state.previousSessionActiveTaskId || state.activeTaskId,
        };
      }

      return newState;
    }
  }

  return state;
}

function getFirstTask(tasks: Map<string, Array<AnnotatedTask>>): ?AnnotatedTask {
  for (const tasksArray of tasks.values()) {
    for (const task of tasksArray) {
      return task;
    }
  }
}
