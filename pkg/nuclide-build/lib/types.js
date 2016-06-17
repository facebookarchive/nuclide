/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Octicon} from '../../nuclide-ui/lib/Octicons';

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

type BuildProgressEvent = {
  kind: 'progress';
  progress: ?number;
};

/**
 * Currently, there's only one type of build event, but we may add more (e.g. status).
 */
export type BuildEvent = BuildProgressEvent;

export type SerializedAppState = {
  previousSessionActiveBuildSystemId: ?string;
  previousSessionActiveTaskType: ?string;
  visible: boolean;
};

export type Task = {
  type: string;
  label: string;
  description: string;
  enabled: boolean; // Can the action be run now?
  cancelable?: boolean; // By default, this is true (all tasks are cancelable).
  icon: Octicon;
};

export interface BuildSystem {
  id: string;
  name: string;
  getExtraUi?: () => ReactClass<any>;
  observeTasks: (callback: (tasks: Array<Task>) => mixed) => IDisposable;
  getIcon(): ReactClass<any>;
  runTask(taskName: string): TaskInfo;
}

export type IconButtonOption = {
  value: string;
  label: string;
};

export interface TaskInfo {
  observeProgress?: (callback: (progress: ?number) => mixed) => IDisposable;
  onDidComplete(callback: () => mixed): IDisposable;
  onDidError(callback: (error: Error) => mixed): IDisposable;
  cancel(): void;
  getTrackingData?: () => Object;
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

export type TaskCompletedAction = {
  type: 'TASK_COMPLETED';
  payload: {
    taskInfo: TaskInfo;
  };
};

type TaskProgressAction = {
  type: 'TASK_PROGRESS';
  payload: {
    progress: ?number;
  };
};

export type TaskErroredAction = {
  type: 'TASK_ERRORED';
  payload: {
    error: Error;
    taskInfo: ?TaskInfo;
  };
};

export type TaskStartedAction = {
  type: 'TASK_STARTED';
  payload: {
    taskInfo: TaskInfo;
  };
};

export type TaskStoppedAction = {
  type: 'TASK_STOPPED';
  payload: {
    taskInfo: TaskInfo;
  };
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

type TasksUpdatedAction = {
  type: 'TASKS_UPDATED';
  payload: {
    tasks: Array<Task>;
  };
};

export type Action =
  PanelCreatedAction
  | PanelDestroyedAction
  | RefreshTasksAction
  | RunTaskAction
  | SelectTaskAction
  | StopTaskAction
  | TaskCompletedAction
  | TaskProgressAction
  | TaskErroredAction
  | TaskStartedAction
  | TaskStoppedAction
  | TasksUpdatedAction
  | ToolbarVisibilityUpdatedAction
  | RegisterBuildSystemAction
  | UnregisterBuildSystemAction
  | SelectBuildSystemAction;

export type BuildSystemRegistry = {
  register(buildSystem: BuildSystem): IDisposable;
};
