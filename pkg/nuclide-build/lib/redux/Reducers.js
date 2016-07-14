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
    case Actions.REGISTER_BUILD_SYSTEM: {
      const {buildSystem} = action.payload;
      return {
        ...state,
        buildSystems: new Map(state.buildSystems).set(buildSystem.id, buildSystem),
      };
    }
    case Actions.UNREGISTER_BUILD_SYSTEM: {
      const {id} = action.payload;
      const buildSystems = new Map(state.buildSystems);
      const tasks = new Map(state.tasks);
      buildSystems.delete(id);
      tasks.delete(id);
      return {
        ...state,
        buildSystems,
        tasks,
      };
    }
    case Actions.TASKS_UPDATED: {
      const {tasks, buildSystemId} = action.payload;
      const buildSystem = state.buildSystems.get(buildSystemId);
      const buildSystemName = buildSystem && buildSystem.name;
      const annotatedTasks = tasks.map(task => ({...task, buildSystemId, buildSystemName}));
      const newState = {
        ...state,
        tasks: new Map(state.tasks).set(buildSystemId, annotatedTasks),
      };

      const prevTaskId = state.previousSessionActiveTaskId;

      // If the new tasks contain the one we were waiting to restore from the user's previous
      // session make it the active one.
      if (
        prevTaskId != null
        && buildSystemId === prevTaskId.buildSystemId
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
        return state.activeTaskId.buildSystemId === buildSystemId
          && !annotatedTasks.some(task => task.type === activeTaskType);
      };
      if (state.activeTaskId == null || activeTaskWasRemoved()) {
        const activeTask = getFirstTask(newState.tasks);
        return {
          ...newState,
          activeTaskId: activeTask == null
            ? null
            : {type: activeTask.type, buildSystemId: activeTask.buildSystemId},
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
