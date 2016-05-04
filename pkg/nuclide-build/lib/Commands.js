'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState, BuildSystem, IconButtonOption} from './types';
import type Rx from 'rxjs';

import {injectObservableAsProps} from '../../nuclide-ui/lib/HOC';
import * as ActionTypes from './ActionTypes';
import {getActiveBuildSystem} from './getActiveBuildSystem';
import {createPanelItem} from './ui/createPanelItem';
import {BuildToolbar} from './ui/BuildToolbar';
import {React} from 'react-for-atom';


export class Commands {
  _dispatch: (action: Action) => void;
  _getState: () => AppState;

  constructor(dispatch: (action: Action) => void, getState: () => AppState) {
    this._dispatch = dispatch;
    this._getState = getState;

    (this: any).runTask = this.runTask.bind(this);
    (this: any).selectBuildSystem = this.selectBuildSystem.bind(this);
    (this: any).selectTask = this.selectTask.bind(this);
    (this: any).stopTask = this.stopTask.bind(this);
  }

  createPanel(stateStream: Rx.BehaviorSubject<AppState>): void {
    const props = stateStream
      .map(state => {
        const activeBuildSystem = getActiveBuildSystem(state);
        const getExtraUi = activeBuildSystem != null && activeBuildSystem.getExtraUi != null
          ? activeBuildSystem.getExtraUi.bind(activeBuildSystem)
          : null;
        return {
          buildSystemOptions: getBuildSystemOptions(state),
          activeBuildSystemId: activeBuildSystem && activeBuildSystem.id,
          getActiveBuildSystemIcon: () => activeBuildSystem && activeBuildSystem.getIcon(),
          getExtraUi,
          progress: state.taskStatus && state.taskStatus.progress,
          visible: state.visible,
          runTask: this.runTask,
          activeTaskType: state.activeTaskType,
          selectBuildSystem: this.selectBuildSystem,
          selectTask: this.selectTask,
          stopTask: this.stopTask,
          taskIsRunning: state.taskStatus != null,
          tasks: state.tasks,
        };
      });

    const StatefulBuildToolbar = injectObservableAsProps(props, BuildToolbar);
    // $FlowIssue: injectObservableAsProps doesn't handle props exactly right.
    const item = createPanelItem(<StatefulBuildToolbar />);
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


function getBuildSystemOptions(state: AppState): Array<IconButtonOption> {
  // TODO: Sort alphabetically?
  return Array.from(state.buildSystems.values())
    .map(buildSystem => ({
      value: buildSystem.id,
      label: buildSystem.name,
    }));
}
