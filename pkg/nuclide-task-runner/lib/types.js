/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Task} from '../../commons-node/tasks';
import type {Octicon} from '../../nuclide-ui/lib/Octicons';
import type {RemoteDirectory} from '../../nuclide-remote-connection';
import type {Directory as LocalDirectoryType} from 'atom';

export type Directory = LocalDirectoryType | RemoteDirectory;

export type AppState = {
  activeTaskId: ?TaskId,
  taskRunners: Map<string, TaskRunner>,
  panel: ?atom$Panel,
  previousSessionActiveTaskId: ?TaskId,
  projectRoot: ?Directory,
  taskLists: Map<string, Array<AnnotatedTaskMetadata>>,
  taskStatus: ?{
    task: Task,
    progress: ?number,
  },
  visible: boolean,
};

export type SerializedAppState = {
  previousSessionActiveTaskId: ?TaskId,
  visible: boolean,
};

export type TaskId = {
  type: string,
  taskRunnerId: string,
};

export type TaskMetadata = {
  type: string,
  label: string,
  description: string,
  enabled: boolean, // Can the action be run now?
  cancelable?: boolean, // By default, this is true (all tasks are cancelable).
  icon: Octicon,
};

export type AnnotatedTaskMetadata = TaskMetadata & {
  taskRunnerId: string,
  taskRunnerName: string,
};

export interface TaskRunner {
  id: string,
  name: string,
  getExtraUi?: () => ReactClass<any>, // activeTaskType will be provided as a nullable property.
  observeTaskList: (callback: (taskList: Array<TaskMetadata>) => mixed) => IDisposable,
  getIcon(): ReactClass<any>,
  runTask(taskName: string): Task,
  setProjectRoot?: (projectRoot: ?Directory) => void,
}

export type TaskRunnerInfo = {
  id: string,
  name: string,
};

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
    task: Task,
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
    task: ?Task,
  },
};

export type TaskStartedAction = {
  type: 'TASK_STARTED',
  payload: {
    task: Task,
  },
};

export type TaskStoppedAction = {
  type: 'TASK_STOPPED',
  payload: {
    task: Task,
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
  payload: {
    taskRunnerId: ?string,
  },
};

export type TaskListUpdatedAction = {
  type: 'TASK_LIST_UPDATED',
  payload: {
    taskRunnerId: string,
    taskList: Array<TaskMetadata>,
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
  | TaskListUpdatedAction
  | TaskStartedAction
  | TaskStoppedAction
  | ToggleToolbarVisibilityAction
  | ToolbarVisibilityUpdatedAction
  | RegisterTaskRunnerAction
  | UnregisterTaskRunnerAction;

export type TaskRunnerServiceApi = {
  register(taskRunner: TaskRunner): IDisposable,
};
