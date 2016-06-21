'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState} from './types';

import * as ActionTypes from './ActionTypes';
import Rx from 'rxjs';

export function createStateStream(
  actions: Rx.Observable<Action>,
  initialState: AppState,
): Rx.BehaviorSubject<AppState> {
  const states = new Rx.BehaviorSubject(initialState);
  actions.scan(accumulateState, initialState).subscribe(states);
  return states;
}

function accumulateState(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionTypes.PANEL_CREATED: {
      const {panel} = action.payload;
      return {
        ...state,
        panel,
      };
    }
    case ActionTypes.PANEL_DESTROYED: {
      return {
        ...state,
        panel: null,
      };
    }
    case ActionTypes.SELECT_TASK: {
      const {taskType} = action.payload;
      return {
        ...state,
        activeTaskType: taskType,
        previousSessionActiveTaskType: null,
      };
    }
    case ActionTypes.TASK_COMPLETED: {
      return {
        ...state,
        taskStatus: null,
      };
    }
    case ActionTypes.TASK_PROGRESS: {
      const {progress} = action.payload;
      return {
        ...state,
        taskStatus: {
          ...state.taskStatus,
          progress,
        },
      };
    }
    case ActionTypes.TASK_ERRORED: {
      return {
        ...state,
        taskStatus: null,
      };
    }
    case ActionTypes.TASK_STARTED: {
      const {taskInfo} = action.payload;
      return {
        ...state,
        taskStatus: {
          info: taskInfo,
          progress: null,
        },
      };
    }
    case ActionTypes.TASK_STOPPED: {
      return {
        ...state,
        taskStatus: null,
      };
    }
    case ActionTypes.TOOLBAR_VISIBILITY_UPDATED: {
      return {
        ...state,
        visible: action.payload.visible,
      };
    }
    case ActionTypes.REGISTER_BUILD_SYSTEM: {
      const {buildSystem} = action.payload;
      const newState = {
        ...state,
        buildSystems: new Map(state.buildSystems).set(buildSystem.id, buildSystem),
      };

      // If the newly selected build system is the one we were waiting to restore from the user's
      // previous session (or we have no active build system), make it the active one.
      if (
        buildSystem.id === state.previousSessionActiveBuildSystemId ||
        state.activeBuildSystemId == null
      ) {
        return setBuildSystem(newState, buildSystem.id);
      }

      return newState;
    }
    case ActionTypes.SELECT_BUILD_SYSTEM: {
      const {id} = action.payload;
      return {
        ...setBuildSystem(state, id),

        // Now that the user has selected a build system, we no longer care about what the selected
        // one was the last session.
        previousSessionActiveBuildSystemId: null,
      };
    }
    case ActionTypes.UNREGISTER_BUILD_SYSTEM: {
      const {id} = action.payload;
      const buildSystems = new Map(state.buildSystems);
      buildSystems.delete(id);
      return {
        ...state,
        buildSystems,
      };
    }
    case ActionTypes.TASKS_UPDATED: {
      const {tasks} = action.payload;
      const newState = {
        ...state,
        tasks: tasks.slice(),
      };

      // If the new tasks contain the one we were waiting to restore from the user's previous
      // session make it the active one.
      if (tasks.some(task => task.type === state.previousSessionActiveTaskType)) {
        return {
          ...newState,
          activeTaskType: state.previousSessionActiveTaskType,
          previousSessionActiveTaskType: null,
        };
      }

      // If there's no active task (or it was removed), change the active task to something
      // sensible.
      if (
        (state.activeTaskType == null) || !tasks.some(task => task.type === state.activeTaskType)
      ) {
        const activeTaskType = tasks.length > 0
          ? tasks[0].type
          : null;
        return {
          ...newState,
          activeTaskType,
          // Remember what we really wanted, so we can return to it later.
          previousSessionActiveTaskType:
            state.previousSessionActiveTaskType || state.activeTaskType,
        };
      }

      return newState;
    }
  }

  throw new Error(`Unrecognized action type: ${action.type}`);
}

function setBuildSystem(state: AppState, buildSystemId: ?string): AppState {
  return {
    ...state,

    // We're not sure if the new build system will have the currently active task type.
    activeTaskType: null,
    previousSessionActiveTaskType: state.previousSessionActiveTaskType || state.activeTaskType,

    activeBuildSystemId: buildSystemId,
  };
}
