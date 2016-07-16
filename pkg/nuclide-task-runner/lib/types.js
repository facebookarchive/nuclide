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
import type {RemoteDirectory} from '../../nuclide-remote-connection';
import {Directory as LocalDirectory} from 'atom';

export type Directory = LocalDirectory | RemoteDirectory;

export type AppState = {
  activeTaskId: ?TaskId,
  taskRunners: Map<string, TaskRunner>,
  panel: ?atom$Panel,
  previousSessionActiveTaskId: ?TaskId,
  projectRoot: ?Directory,
  tasks: Map<string, Array<AnnotatedTask>>,
  taskStatus: ?{
    info: TaskInfo,
    progress: ?number,
  },
  visible: boolean,
};

type TaskProgressEvent = {
  kind: 'progress',
  progress: ?number,
};

/**
 * Currently, there's only one type of task event, but we may add more (e.g. status).
 */
export type TaskEvent = TaskProgressEvent;

export type SerializedAppState = {
  previousSessionActiveTaskId: ?TaskId,
  visible: boolean,
};

export type TaskId = {
  type: string,
  taskRunnerId: string,
};

export type Task = {
  type: string,
  label: string,
  description: string,
  enabled: boolean, // Can the action be run now?
  cancelable?: boolean, // By default, this is true (all tasks are cancelable).
  icon: Octicon,
};

export type AnnotatedTask = Task & {
  taskRunnerId: string,
  taskRunnerName: string,
};

export interface TaskRunner {
  id: string,
  name: string,
  getExtraUi?: () => ReactClass<any>, // activeTaskType will be provided as a nullable property.
  observeTasks: (callback: (tasks: Array<Task>) => mixed) => IDisposable,
  getIcon(): ReactClass<any>,
  runTask(taskName: string): TaskInfo,
  setProjectRoot?: (projectRoot: ?Directory) => void,
}

export type TaskRunnerInfo = {
  id: string,
  name: string,
};

export interface TaskInfo {
  observeProgress?: (callback: (progress: ?number) => mixed) => IDisposable,
  onDidComplete(callback: () => mixed): IDisposable,
  onDidError(callback: (error: Error) => mixed): IDisposable,
  cancel(): void,
  getTrackingData?: () => Object,
}

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
};

export type BoundActionCreators = {
  createPanel(store: Store): void,
  destroyPanel(): void,
  registerTaskRunner(taskRunner: TaskRunner): void,
  runTask(taskId: ?TaskId): void,
  selectTask(taskId: TaskId): void,
  setProjectRoot(dir: ?Directory): void,
  setToolbarVisibility(visible: boolean): void,
  stopTask(): void,
  toggleToolbarVisibility(): void,
  unregisterTaskRunner(taskRunner: TaskRunner): void,
};

//
// Action types.
//

export type CreatePanelAction = {
  type: 'CREATE_PANEL',
  payload: {
    store: Store,
  },
};

export type DestroyPanelAction = {
  type: 'DESTROY_PANEL',
};

export type PanelCreatedAction = {
  type: 'PANEL_CREATED',
  payload: {
    panel: Object,
  },
};

export type PanelDestroyedAction = {
  type: 'PANEL_DESTROYED',
};

export type SelectTaskAction = {
  type: 'SELECT_TASK',
  payload: {
    taskId: TaskId,
  },
};

export type TaskCompletedAction = {
  type: 'TASK_COMPLETED',
  payload: {
    taskInfo: TaskInfo,
  },
};

type TaskProgressAction = {
  type: 'TASK_PROGRESS',
  payload: {
    progress: ?number,
  },
};

export type TaskErroredAction = {
  type: 'TASK_ERRORED',
  payload: {
    error: Error,
    taskInfo: ?TaskInfo,
  },
};

export type TaskStartedAction = {
  type: 'TASK_STARTED',
  payload: {
    taskInfo: TaskInfo,
  },
};

export type TaskStoppedAction = {
  type: 'TASK_STOPPED',
  payload: {
    taskInfo: TaskInfo,
  },
};

export type ToolbarVisibilityUpdatedAction = {
  type: 'TOOLBAR_VISIBILITY_UPDATED',
  payload: {
    visible: boolean,
  },
};

export type RegisterTaskRunnerAction = {
  type: 'REGISTER_TASK_RUNNER',
  payload: {
    taskRunner: TaskRunner,
  },
};

export type RunTaskAction = {
  type: 'RUN_TASK',
  payload: {
    taskId: ?TaskId,
  },
};

export type SetProjectRootAction = {
  type: 'SET_PROJECT_ROOT',
  payload: {
    projectRoot: ?Directory,
  },
};

export type SetToolbarVisibilityAction = {
  type: 'SET_TOOLBAR_VISIBILITY',
  payload: {
    visible: boolean,
  },
};

export type StopTaskAction = {
  type: 'STOP_TASK',
};

export type ToggleToolbarVisibilityAction = {
  type: 'TOGGLE_TOOLBAR_VISIBILITY',
};

export type TasksUpdatedAction = {
  type: 'TASKS_UPDATED',
  payload: {
    taskRunnerId: string,
    tasks: Array<Task>,
  },
};

export type UnregisterTaskRunnerAction = {
  type: 'UNREGISTER_TASK_RUNNER',
  payload: {
    id: string,
  },
};

export type Action =
  PanelCreatedAction
  | PanelDestroyedAction
  | RunTaskAction
  | SelectTaskAction
  | SetProjectRootAction
  | SetToolbarVisibilityAction
  | StopTaskAction
  | TaskCompletedAction
  | TaskProgressAction
  | TaskErroredAction
  | TaskStartedAction
  | TaskStoppedAction
  | TasksUpdatedAction
  | ToggleToolbarVisibilityAction
  | ToolbarVisibilityUpdatedAction
  | RegisterTaskRunnerAction
  | UnregisterTaskRunnerAction;

export type TaskRunnerServiceApi = {
  register(taskRunner: TaskRunner): IDisposable,
};
