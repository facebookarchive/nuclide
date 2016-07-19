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
  TaskRunner,
  CreatePanelAction,
  DestroyPanelAction,
  Directory,
  RegisterTaskRunnerAction,
  RunTaskAction,
  SelectTaskAction,
  SetProjectRootAction,
  SetToolbarVisibilityAction,
  StopTaskAction,
  Store,
  TaskId,
  ToggleToolbarVisibilityAction,
  UnregisterTaskRunnerAction,
} from '../types';

export const CREATE_PANEL = 'CREATE_PANEL';
export const DESTROY_PANEL = 'DESTROY_PANEL';
export const PANEL_CREATED = 'PANEL_CREATED';
export const PANEL_DESTROYED = 'PANEL_DESTROYED';
export const REGISTER_TASK_RUNNER = 'REGISTER_TASK_RUNNER';
export const RUN_TASK = 'RUN_TASK';
export const SELECT_TASK = 'SELECT_TASK';
export const SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';
export const SET_TOOLBAR_VISIBILITY = 'SET_TOOLBAR_VISIBILITY';
export const STOP_TASK = 'STOP_TASK';
export const TASK_COMPLETED = 'TASK_COMPLETED';
export const TASK_PROGRESS = 'TASK_PROGRESS';
export const TASK_STARTED = 'TASK_STARTED';
export const TASK_STOPPED = 'TASK_STOPPED';
export const TASK_ERRORED = 'TASK_ERRORED';
export const TASK_LIST_UPDATED = 'TASK_LIST_UPDATED';
export const TOGGLE_TOOLBAR_VISIBILITY = 'TOGGLE_TOOLBAR_VISIBILITY';
export const TOOLBAR_VISIBILITY_UPDATED = 'TOOLBAR_VISIBILITY_UPDATED';
export const UNREGISTER_TASK_RUNNER = 'UNREGISTER_TASK_RUNNER';

export function createPanel(store: Store): CreatePanelAction {
  return {
    type: CREATE_PANEL,
    payload: {store},
  };
}

export function destroyPanel(): DestroyPanelAction {
  return {type: DESTROY_PANEL};
}

export function registerTaskRunner(taskRunner: TaskRunner): RegisterTaskRunnerAction {
  return {
    type: REGISTER_TASK_RUNNER,
    payload: {taskRunner},
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

export function setProjectRoot(projectRoot: ?Directory): SetProjectRootAction {
  return {
    type: SET_PROJECT_ROOT,
    payload: {projectRoot},
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

export function toggleToolbarVisibility(taskRunnerId?: string): ToggleToolbarVisibilityAction {
  return {
    type: TOGGLE_TOOLBAR_VISIBILITY,
    payload: {taskRunnerId},
  };
}

export function unregisterTaskRunner(taskRunner: TaskRunner): UnregisterTaskRunnerAction {
  return {
    type: UNREGISTER_TASK_RUNNER,
    payload: {
      id: taskRunner.id,
    },
  };
}
