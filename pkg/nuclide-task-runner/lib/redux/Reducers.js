/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Action, TaskRunner, TaskRunnerState, TaskStatus} from '../types';
import type {Directory} from '../../../nuclide-remote-connection';

import * as Actions from './Actions';

export function taskRunnersReady(state: boolean = false, action: Action): boolean {
  switch (action.type) {
    case Actions.DID_ACTIVATE_INITIAL_PACKAGES: return true;
    default: return state;
  }
}

export function isUpdatingTaskRunners(state: boolean = true, action: Action): boolean {
  switch (action.type) {
    case Actions.SET_PROJECT_ROOT: return true;
    case Actions.SET_STATES_FOR_TASK_RUNNERS: return false;
    default: return state;
  }
}

export function taskRunners(state: Array<TaskRunner> = [], action: Action): Array<TaskRunner> {
  switch (action.type) {
    case Actions.REGISTER_TASK_RUNNER: {
      const {taskRunner} = action.payload;
      return state.concat(taskRunner)
        .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
    }
    case Actions.UNREGISTER_TASK_RUNNER: {
      const {taskRunner} = action.payload;
      return state.slice().filter(element => element !== taskRunner);
    }
    default: {
      return state;
    }
  }
}

export function statesForTaskRunners(
  state: Map<TaskRunner, TaskRunnerState> = new Map(),
  action: Action,
): Map<TaskRunner, TaskRunnerState> {
  switch (action.type) {
    case Actions.SET_PROJECT_ROOT: return new Map();
    case Actions.SET_STATES_FOR_TASK_RUNNERS: return action.payload.statesForTaskRunners;
    default: return state;
  }
}

export function projectRoot(state: ?Directory = null, action: Action): ?Directory {
  switch (action.type) {
    case Actions.SET_PROJECT_ROOT: return action.payload.projectRoot;
    default: return state;
  }
}

export function visible(state: boolean = false, action: Action): boolean {
  switch (action.type) {
    case Actions.SET_TOOLBAR_VISIBILITY: return action.payload.visible;
    default: return state;
  }
}

export function activeTaskRunner(state: ?TaskRunner = null, action: Action): ?TaskRunner {
  switch (action.type) {
    case Actions.SELECT_TASK_RUNNER: return action.payload.taskRunner;
    case Actions.SET_PROJECT_ROOT: return null;
    default: return state;
  }
}

export function runningTask(state: ?TaskStatus = null, action: Action): ?TaskStatus {
  switch (action.type) {
    case Actions.TASK_COMPLETED: return null;
    case Actions.TASK_PROGRESS: return {...state, progress: action.payload.progress};
    case Actions.TASK_ERRORED: return null;
    case Actions.TASK_STARTED: return action.payload.taskStatus;
    case Actions.TASK_STOPPED: return null;
    default: return state;
  }
}
