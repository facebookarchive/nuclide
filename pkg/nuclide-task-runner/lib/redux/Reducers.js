'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.taskRunnersReady = taskRunnersReady;
exports.isUpdatingTaskRunners = isUpdatingTaskRunners;
exports.taskRunners = taskRunners;
exports.statesForTaskRunners = statesForTaskRunners;
exports.projectRoot = projectRoot;
exports.visible = visible;
exports.activeTaskRunner = activeTaskRunner;
exports.runningTask = runningTask;
exports.consoleService = consoleService;
exports.consolesForTaskRunners = consolesForTaskRunners;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function taskRunnersReady(state = false, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).DID_ACTIVATE_INITIAL_PACKAGES:
      return true;
    default:
      return state;
  }
}

function isUpdatingTaskRunners(state = true, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      return true;
    case (_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS:
      return false;
    default:
      return state;
  }
}

function taskRunners(state = [], action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).REGISTER_TASK_RUNNER:
      {
        const { taskRunner } = action.payload;
        return state.concat(taskRunner).sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
      }
    case (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER:
      {
        const { taskRunner } = action.payload;
        return state.slice().filter(element => element !== taskRunner);
      }
    default:
      {
        return state;
      }
  }
}

function statesForTaskRunners(state = new Map(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      return new Map();
    case (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER:
      const newMap = new Map(state.entries());
      newMap.delete(action.payload.taskRunner);
      return newMap;
    case (_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS:
      return new Map([...state.entries(), ...action.payload.statesForTaskRunners.entries()]);
    case (_Actions || _load_Actions()).SET_STATE_FOR_TASK_RUNNER:
      const { taskRunner, taskRunnerState } = action.payload;
      return new Map(state.entries()).set(taskRunner, taskRunnerState);
    default:
      return state;
  }
}

function projectRoot(state = null, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      return action.payload.projectRoot;
    default:
      return state;
  }
}

function visible(state = false, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY:
      return action.payload.visible;
    default:
      return state;
  }
}

function activeTaskRunner(state = null, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SELECT_TASK_RUNNER:
      return action.payload.taskRunner;
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      return null;
    default:
      return state;
  }
}

function runningTask(state = null, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).TASK_COMPLETED:
      return null;
    case (_Actions || _load_Actions()).TASK_PROGRESS:
      return Object.assign({}, state, { progress: action.payload.progress });
    case (_Actions || _load_Actions()).TASK_ERRORED:
      return null;
    case (_Actions || _load_Actions()).TASK_STARTED:
      return action.payload.taskStatus;
    case (_Actions || _load_Actions()).TASK_STOPPED:
      return null;
    default:
      return state;
  }
}

function consoleService(state = null, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_CONSOLE_SERVICE:
      return action.payload.service;
    default:
      return state;
  }
}

function consolesForTaskRunners(state = new Map(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_CONSOLES_FOR_TASK_RUNNERS:
      state.forEach((value, key) => {
        value.dispose();
      });
      return action.payload.consolesForTaskRunners;
    case (_Actions || _load_Actions()).SET_CONSOLE_SERVICE:
      return new Map();
    case (_Actions || _load_Actions()).ADD_CONSOLE_FOR_TASK_RUNNER:
      const { consoleApi, taskRunner } = action.payload;
      return new Map(state.entries()).set(taskRunner, consoleApi);
    case (_Actions || _load_Actions()).REMOVE_CONSOLE_FOR_TASK_RUNNER:
      const previous = state.get(action.payload.taskRunner);
      const newState = new Map(state.entries());
      if (previous) {
        previous.dispose();
        newState.delete(action.payload.taskRunner);
      }
      return newState;
    default:
      return state;
  }
}