'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState, BuildSystem} from './types';
import type Rx from 'rxjs';

import * as ActionTypes from './ActionTypes';

export class Commands {
  _dispatch: (action: Action) => void;
  _getState: () => AppState;

  constructor(dispatch: (action: Action) => void, getState: () => AppState) {
    this._dispatch = dispatch;
    this._getState = getState;
  }

  createPanel(stateStream: Rx.BehaviorSubject<AppState>): void {
    const item = document.createElement('div'); // A dummy item for now

    const panel = atom.workspace.addTopPanel({item});

    this._dispatch({
      type: ActionTypes.PANEL_CREATED,
      payload: {panel},
    });
  }

  destroyPanel(): void {
    const {panel} = this._getState();
    if (panel == null) {
      return;
    }
    panel.destroy();
    this._dispatch({
      type: ActionTypes.PANEL_DESTROYED,
      payload: {panel},
    });
  }

  /**
   * Update the tasks to match the active build system.
   */
  refreshTasks(): void {
    this._dispatch({
      type: ActionTypes.REFRESH_TASKS,
    });
  }

  registerBuildSystem(buildSystem: BuildSystem): void {
    this._dispatch({
      type: ActionTypes.REGISTER_BUILD_SYSTEM,
      payload: {buildSystem},
    });
  }

  runTask(): void {
    const {activeTaskType} = this._getState();
    if (activeTaskType == null) {
      // TODO: Should we error here?
      return;
    }
    this._dispatch({
      type: ActionTypes.RUN_TASK,
      payload: {
        taskType: activeTaskType,
      },
    });
  }

  selectBuildSystem(id: ?string): void {
    this._dispatch({
      type: ActionTypes.SELECT_BUILD_SYSTEM,
      payload: {id},
    });
  }

  selectTask(taskType: ?string): void {
    this._dispatch({
      type: ActionTypes.SELECT_TASK,
      payload: {taskType},
    });
  }

  stopTask(): void {
    this._dispatch({
      type: ActionTypes.STOP_TASK,
    });
  }

  toggleToolbarVisibility(): void {
    this._dispatch({
      type: ActionTypes.TOOLBAR_VISIBILITY_UPDATED,
      payload: {
        visible: !this._getState().visible,
      },
    });
  }

  unregisterBuildSystem(buildSystem: BuildSystem): void {
    this._dispatch({
      type: ActionTypes.UNREGISTER_BUILD_SYSTEM,
      payload: {
        id: buildSystem.id,
      },
    });
  }

}
