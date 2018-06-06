'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialPackagesActivated = initialPackagesActivated;
exports.readyTaskRunners = readyTaskRunners;
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

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function initialPackagesActivated(state = false, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).DID_ACTIVATE_INITIAL_PACKAGES:
      return true;
    default:
      return state;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

function readyTaskRunners(state = (_immutable || _load_immutable()).Set(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      return (_immutable || _load_immutable()).Set();
    case (_Actions || _load_Actions()).SET_STATE_FOR_TASK_RUNNER:
      return state.add(action.payload.taskRunner);
    case (_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS:
      return state.concat(action.payload.statesForTaskRunners.keys());
    case (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER:
      return state.remove(action.payload.taskRunner);
    default:
      return state;
  }
}

function taskRunners(state = (_immutable || _load_immutable()).List(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).REGISTER_TASK_RUNNER:
      {
        const { taskRunner } = action.payload;
        return state.push(taskRunner).sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
      }
    case (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER:
      {
        const { taskRunner } = action.payload;
        return state.delete(state.indexOf(taskRunner));
      }
    default:
      {
        return state;
      }
  }
}

function statesForTaskRunners(state = (_immutable || _load_immutable()).Map(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_PROJECT_ROOT:
      return (_immutable || _load_immutable()).Map();
    case (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER:
      return state.delete(action.payload.taskRunner);
    case (_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS:
      return state.merge(action.payload.statesForTaskRunners);
    case (_Actions || _load_Actions()).SET_STATE_FOR_TASK_RUNNER:
      const { taskRunner, taskRunnerState } = action.payload;
      return state.set(taskRunner, taskRunnerState);
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

function consolesForTaskRunners(state = (_immutable || _load_immutable()).Map(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_CONSOLES_FOR_TASK_RUNNERS:
      state.forEach(value => value.dispose());
      return action.payload.consolesForTaskRunners;
    case (_Actions || _load_Actions()).ADD_CONSOLE_FOR_TASK_RUNNER:
      const { consoleApi, taskRunner } = action.payload;
      return state.set(taskRunner, consoleApi);
    case (_Actions || _load_Actions()).REMOVE_CONSOLE_FOR_TASK_RUNNER:
      const previous = state.get(action.payload.taskRunner);
      if (previous) {
        previous.dispose();
      }
      return state.delete(action.payload.taskRunner);
    case (_Actions || _load_Actions()).SET_CONSOLE_SERVICE:
      state.forEach(value => value.dispose());
      return (_immutable || _load_immutable()).Map();
    default:
      return state;
  }
}