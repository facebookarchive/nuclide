'use strict';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// FIXME: This file has a strange header because it needs to be ignored by the transpiler, but work
// with 'import type'". Once Babel understands "export interface", revert it to the normal one.

export type AppState = {
  activeBuildSystemId: ?string;
  activeTaskType: ?string;
  buildSystems: Map<string, BuildSystem>;
  panel: ?atom$Panel;
  previousSessionActiveTaskType: ?string;
  previousSessionActiveBuildSystemId: ?string;
  tasks: Array<Task>;
  taskStatus: ?{
    info: TaskInfo;
    progress: ?number;
  };
  visible: boolean;
};

export type Task = {
  type: string;
  label: string;
  description: string;
  enabled: boolean; // Can the action be run now?
  icon: string;
};

export interface BuildSystem {
  id: string;
  name: string;
  getExtraUi?: () => ReactClass;
  observeTasks: (callback: (tasks: Array<Task>) => mixed) => IDisposable;
  getIcon(): ReactClass;
  runTask(taskName: string): TaskInfo;
}

export interface TaskInfo {
  observeProgress?: (callback: (progress: ?number) => mixed) => IDisposable;
  onDidComplete(callback: () => mixed): IDisposable;
  onDidError(callback: (error: Error) => mixed): IDisposable;
  cancel(): void;
}

//
// Action types.
//

type PanelCreatedAction = {
  type: 'PANEL_CREATED';
  payload: {
    panel: Object;
  };
};

type PanelDestroyedAction = {
  type: 'PANEL_DESTROYED';
  payload: {
    panel: Object;
  };
};

type RunTaskAction = {
  type: 'RUN_TASK';
  payload: {
    taskType: string;
  };
};

type SelectTaskAction = {
  type: 'SELECT_TASK';
  payload: {
    taskType: ?string;
  };
};

type StopTaskAction = {
  type: 'STOP_TASK';
};

type ToolbarVisibilityUpdatedAction = {
  type: 'TOOLBAR_VISIBILITY_UPDATED';
  payload: {
    visible: boolean;
  };
};

type RefreshTasksAction = {
  type: 'REFRESH_TASKS';
};

type RegisterBuildSystemAction = {
  type: 'REGISTER_BUILD_SYSTEM';
  payload: {
    buildSystem: BuildSystem;
  };
};

type SelectBuildSystemAction = {
  type: 'SELECT_BUILD_SYSTEM';
  payload: {
    id: ?string;
  };
};

type UnregisterBuildSystemAction = {
  type: 'UNREGISTER_BUILD_SYSTEM';
  payload: {
    id: string;
  };
};

export type Action =
  PanelCreatedAction
  | PanelDestroyedAction
  | RefreshTasksAction
  | RunTaskAction
  | SelectTaskAction
  | StopTaskAction
  | ToolbarVisibilityUpdatedAction
  | RegisterBuildSystemAction
  | UnregisterBuildSystemAction
  | SelectBuildSystemAction;
