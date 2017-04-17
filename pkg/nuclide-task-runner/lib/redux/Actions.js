/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Directory} from '../../../nuclide-remote-connection';
import type {
  DidActivateInitialPackagesAction,
  RegisterTaskRunnerAction,
  RunTaskAction,
  SelectTaskRunnerAction,
  SetProjectRootAction,
  SetStatesForTaskRunnersAction,
  SetToolbarVisibilityAction,
  StopTaskAction,
  TaskMetadata,
  TaskRunner,
  TaskRunnerState,
  ToggleToolbarVisibilityAction,
  UnregisterTaskRunnerAction,
} from '../types';

export const DID_ACTIVATE_INITIAL_PACKAGES = 'DID_ACTIVATE_INITIAL_PACKAGES';
export const REGISTER_TASK_RUNNER = 'REGISTER_TASK_RUNNER';
export const RUN_TASK = 'RUN_TASK';
export const SELECT_TASK_RUNNER = 'SELECT_TASK_RUNNER';
export const SET_STATES_FOR_TASK_RUNNERS = 'SET_STATES_FOR_TASK_RUNNERS';
export const SET_PROJECT_ROOT = 'SET_PROJECT_ROOT';
export const SET_TOOLBAR_VISIBILITY = 'SET_TOOLBAR_VISIBILITY';
export const STOP_TASK = 'STOP_TASK';
export const TASKS_READY = 'TASKS_READY';
export const TASK_COMPLETED = 'TASK_COMPLETED';
export const TASK_PROGRESS = 'TASK_PROGRESS';
export const TASK_STARTED = 'TASK_STARTED';
export const TASK_STOPPED = 'TASK_STOPPED';
export const TASK_ERRORED = 'TASK_ERRORED';
export const TOGGLE_TOOLBAR_VISIBILITY = 'TOGGLE_TOOLBAR_VISIBILITY';
export const UNREGISTER_TASK_RUNNER = 'UNREGISTER_TASK_RUNNER';

export function didActivateInitialPackages(): DidActivateInitialPackagesAction {
  return {type: DID_ACTIVATE_INITIAL_PACKAGES};
}

export function registerTaskRunner(taskRunner: TaskRunner): RegisterTaskRunnerAction {
  return {
    type: REGISTER_TASK_RUNNER,
    payload: {taskRunner},
  };
}

export function runTask(
  taskMeta: TaskMetadata & {taskRunner: TaskRunner},
  verifySaved: boolean = true,
): RunTaskAction {
  return {
    type: RUN_TASK,
    payload: {
      verifySaved,
      taskMeta,
    },
  };
}

export function selectTaskRunner(
  taskRunner: ?TaskRunner,
  updateUserPreferences: boolean,
): SelectTaskRunnerAction {
  return {
    type: SELECT_TASK_RUNNER,
    payload: {taskRunner, updateUserPreferences},
  };
}

export function setStatesForTaskRunners(
  statesForTaskRunners: Map<TaskRunner, TaskRunnerState>,
): SetStatesForTaskRunnersAction {
  return {
    type: SET_STATES_FOR_TASK_RUNNERS,
    payload: {statesForTaskRunners},
  };
}

export function setProjectRoot(projectRoot: ?Directory): SetProjectRootAction {
  return {
    type: SET_PROJECT_ROOT,
    payload: {projectRoot},
  };
}

export function setToolbarVisibility(
  visible: boolean,
  updateUserPreferences: boolean,
): SetToolbarVisibilityAction {
  return {
    type: SET_TOOLBAR_VISIBILITY,
    payload: {visible, updateUserPreferences},
  };
}

export function stopTask(): StopTaskAction {
  return {type: STOP_TASK};
}

export function toggleToolbarVisibility(
  visible: ?boolean,
  taskRunner: ?TaskRunner,
): ToggleToolbarVisibilityAction {
  return {
    type: TOGGLE_TOOLBAR_VISIBILITY,
    payload: {visible, taskRunner},
  };
}

export function unregisterTaskRunner(taskRunner: TaskRunner): UnregisterTaskRunnerAction {
  return {
    type: UNREGISTER_TASK_RUNNER,
    payload: {taskRunner},
  };
}
