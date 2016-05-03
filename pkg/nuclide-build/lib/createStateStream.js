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
        buildSystems: state.buildSystems.set(buildSystem.id, buildSystem),
      };

      // If the newly selected build system is the one we were waiting to restore from the user's
      // previous session (or we have no active build system), make it the active one.
      if (
        buildSystem.id === state.previousSessionActiveBuildSystemId ||
        state.activeBuildSystemId == null
      ) {
        newState.activeBuildSystemId = buildSystem.id;
        newState.previousSessionActiveBuildSystemId = null;
      }

      return newState;
    }
    case ActionTypes.SELECT_BUILD_SYSTEM: {
      const {id} = action.payload;
      return {
        ...state,
        activeBuildSystemId: id,
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
  }

  throw new Error(`Unrecognized action type: ${action.type}`);
}
