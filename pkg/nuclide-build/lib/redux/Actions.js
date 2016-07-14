'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  BuildSystem,
  CreatePanelAction,
  DestroyPanelAction,
  RegisterBuildSystemAction,
  RunTaskAction,
  SelectTaskAction,
  SetToolbarVisibilityAction,
  StopTaskAction,
  Store,
  TaskId,
  ToggleToolbarVisibilityAction,
  UnregisterBuildSystemAction,
} from '../types';

export const CREATE_PANEL = 'CREATE_PANEL';
export const DESTROY_PANEL = 'DESTROY_PANEL';
export const PANEL_CREATED = 'PANEL_CREATED';
export const PANEL_DESTROYED = 'PANEL_DESTROYED';
export const REGISTER_BUILD_SYSTEM = 'REGISTER_BUILD_SYSTEM';
export const RUN_TASK = 'RUN_TASK';
export const SELECT_TASK = 'SELECT_TASK';
export const SET_TOOLBAR_VISIBILITY = 'SET_TOOLBAR_VISIBILITY';
export const STOP_TASK = 'STOP_TASK';
export const TASK_COMPLETED = 'TASK_COMPLETED';
export const TASK_PROGRESS = 'TASK_PROGRESS';
export const TASK_STARTED = 'TASK_STARTED';
export const TASK_STOPPED = 'TASK_STOPPED';
export const TASK_ERRORED = 'TASK_ERRORED';
export const TASKS_UPDATED = 'TASKS_UPDATED';
export const TOGGLE_TOOLBAR_VISIBILITY = 'TOGGLE_TOOLBAR_VISIBILITY';
export const TOOLBAR_VISIBILITY_UPDATED = 'TOOLBAR_VISIBILITY_UPDATED';
export const UNREGISTER_BUILD_SYSTEM = 'UNREGISTER_BUILD_SYSTEM';

export function createPanel(store: Store): CreatePanelAction {
  return {
    type: CREATE_PANEL,
    payload: {store},
  };
}

export function destroyPanel(): DestroyPanelAction {
  return {type: DESTROY_PANEL};
}

export function registerBuildSystem(buildSystem: BuildSystem): RegisterBuildSystemAction {
  return {
    type: REGISTER_BUILD_SYSTEM,
    payload: {buildSystem},
  };
}

export function runTask(taskId?: TaskId): RunTaskAction {
  return {
    type: RUN_TASK,
    payload: {taskId},
  };
}

export function selectTask(taskId: TaskId): SelectTaskAction {
  return {
    type: SELECT_TASK,
    payload: {taskId},
  };
}

export function setToolbarVisibility(visible: boolean): SetToolbarVisibilityAction {
  return {
    type: SET_TOOLBAR_VISIBILITY,
    payload: {visible},
  };
}

export function stopTask(): StopTaskAction {
  return {type: STOP_TASK};
}

export function toggleToolbarVisibility(): ToggleToolbarVisibilityAction {
  return {type: TOGGLE_TOOLBAR_VISIBILITY};
}

export function unregisterBuildSystem(buildSystem: BuildSystem): UnregisterBuildSystemAction {
  return {
    type: UNREGISTER_BUILD_SYSTEM,
    payload: {
      id: buildSystem.id,
    },
  };
}
