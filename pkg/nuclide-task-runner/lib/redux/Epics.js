'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRootEpic = setProjectRootEpic;
exports.setActiveTaskRunnerEpic = setActiveTaskRunnerEpic;
exports.combineTaskRunnerStatesEpic = combineTaskRunnerStatesEpic;
exports.updatePreferredVisibilityEpic = updatePreferredVisibilityEpic;
exports.updatePreferredTaskRunnerEpic = updatePreferredTaskRunnerEpic;
exports.runTaskEpic = runTaskEpic;
exports.stopTaskEpic = stopTaskEpic;
exports.toggleToolbarVisibilityEpic = toggleToolbarVisibilityEpic;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../../commons-node/tasks');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function setProjectRootEpic(actions, store, options) {
  return actions.ofType((_Actions || _load_Actions()).REGISTER_TASK_RUNNER, (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER, (_Actions || _load_Actions()).DID_ACTIVATE_INITIAL_PACKAGES)
  // Refreshes everything. Not the most efficient, but good enough
  .map(() => (_Actions || _load_Actions()).setProjectRoot(store.getState().projectRoot));
}

function setActiveTaskRunnerEpic(actions, store, options) {
  return actions.ofType((_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS).switchMap(() => {
    const { projectRoot } = store.getState();

    if (!projectRoot) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTaskRunner(null, false));
    }

    const { activeTaskRunner, taskRunners, statesForTaskRunners } = store.getState();
    const { preferencesForWorkingRoots } = options;
    const preference = preferencesForWorkingRoots.getItem(projectRoot.getPath());

    let visibilityAction;
    let taskRunner = activeTaskRunner;

    if (preference) {
      // The user had a session for this root in the past, restore it
      visibilityAction = _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(preference.visible, false));
      const preferredId = preference.taskRunnerId;
      if (!activeTaskRunner || activeTaskRunner.id !== preferredId) {
        const preferredRunner = taskRunners.find(runner => runner.id === preferredId);
        const state = preferredRunner && statesForTaskRunners.get(preferredRunner);
        if (state && state.enabled) {
          taskRunner = preferredRunner;
        }
      }
    } else {
      // This is a new root, try to make as few UI changes as possible
      visibilityAction = _rxjsBundlesRxMinJs.Observable.empty();
      taskRunner = activeTaskRunner;
    }

    // We have nothing to go with, let's make best effort to select a task runner
    if (!taskRunner) {
      taskRunner = getBestEffortTaskRunner(taskRunners, statesForTaskRunners);
    }

    return _rxjsBundlesRxMinJs.Observable.concat(visibilityAction, _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTaskRunner(taskRunner, false)));
  });
}

function combineTaskRunnerStatesEpic(actions, store, options) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROJECT_ROOT).switchMap(() => {
    const { projectRoot, taskRunners, taskRunnersReady } = store.getState();

    if (!taskRunnersReady) {
      // We will dispatch another set project root when everyone is ready.
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    if (taskRunners.length === 0) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setStatesForTaskRunners(new Map()));
    }

    // This depends on the epic above, triggering setProjectRoot when taskRunners change
    const runnersAndStates = taskRunners.map(taskRunner => _rxjsBundlesRxMinJs.Observable.create(observer => new (_UniversalDisposable || _load_UniversalDisposable()).default(taskRunner.setProjectRoot(projectRoot, (enabled, tasks) => {
      observer.next([taskRunner, { enabled, tasks: enabled ? tasks : [] }]);
    }))));

    return _rxjsBundlesRxMinJs.Observable.from(runnersAndStates)
    // $FlowFixMe: type combineAll
    .combineAll().map(tuples => {
      const statesForTaskRunners = new Map();
      tuples.forEach(([taskRunner, state]) => {
        statesForTaskRunners.set(taskRunner, state);
      });
      return statesForTaskRunners;
    }).map(statesForTaskRunners => (_Actions || _load_Actions()).setStatesForTaskRunners(statesForTaskRunners));
  });
}

function updatePreferredVisibilityEpic(actions, store, options) {
  return actions.ofType((_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_TOOLBAR_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_TOOLBAR_VISIBILITY"');
    }

    const { visible, updateUserPreferences } = action.payload;
    const { projectRoot, activeTaskRunner } = store.getState();

    if (updateUserPreferences && projectRoot) {
      // The user explicitly changed the visibility, remember this state
      const { preferencesForWorkingRoots } = options;
      const taskRunnerId = activeTaskRunner ? activeTaskRunner.id : null;
      preferencesForWorkingRoots.setItem(projectRoot.getPath(), { taskRunnerId, visible });
    }
  }).ignoreElements();
}

function updatePreferredTaskRunnerEpic(actions, store, options) {
  return actions.ofType((_Actions || _load_Actions()).SELECT_TASK_RUNNER).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).SELECT_TASK_RUNNER)) {
      throw new Error('Invariant violation: "action.type === Actions.SELECT_TASK_RUNNER"');
    }

    const { updateUserPreferences } = action.payload;
    const { projectRoot, activeTaskRunner } = store.getState();

    if (updateUserPreferences && projectRoot && activeTaskRunner) {
      // The user explicitly selected this task runner, remember this state
      const { preferencesForWorkingRoots } = options;
      const updatedPreference = { visible: true, taskRunnerId: activeTaskRunner.id };
      preferencesForWorkingRoots.setItem(projectRoot.getPath(), updatedPreference);
    }
  }).ignoreElements();
}

function runTaskEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).RUN_TASK).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).RUN_TASK)) {
      throw new Error('Invariant violation: "action.type === Actions.RUN_TASK"');
    }

    const state = store.getState();
    // Don't do anything if a task is already running.
    if (state.runningTask) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const taskMeta = action.payload.taskMeta;

    const { activeTaskRunner } = state;
    const newTaskRunner = taskMeta.taskRunner;

    return _rxjsBundlesRxMinJs.Observable.concat(activeTaskRunner === newTaskRunner ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTaskRunner(newTaskRunner, true)), store.getState().visible ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true, true)), _rxjsBundlesRxMinJs.Observable.defer(() => {
      if (taskMeta.disabled) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      return createTaskObservable(taskMeta, store.getState)
      // Stop listening once the task is done.
      .takeUntil(actions.ofType((_Actions || _load_Actions()).TASK_COMPLETED, (_Actions || _load_Actions()).TASK_ERRORED, (_Actions || _load_Actions()).TASK_STOPPED));
    }));
  });
}

function stopTaskEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).STOP_TASK).switchMap(action => {
    const { runningTask } = store.getState();
    if (!runningTask) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_STOPPED,
      payload: { taskStatus: runningTask }
    });
  });
}

function toggleToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_TOOLBAR_VISIBILITY"');
    }

    const state = store.getState();
    const { activeTaskRunner, statesForTaskRunners } = state;
    const { taskRunner } = action.payload;

    // If changing to a new task runner, select it and show it.
    if (taskRunner != null) {
      const taskRunnerState = statesForTaskRunners.get(taskRunner);
      if (taskRunnerState != null && taskRunnerState.enabled && taskRunner !== activeTaskRunner) {
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true, true), (_Actions || _load_Actions()).selectTaskRunner(taskRunner, true));
      }
    }

    // Otherwise, just toggle the visibility.
    return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(!state.visible, true));
  });
}

let taskFailedNotification;

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(taskMeta, getState) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    if (taskFailedNotification != null) {
      taskFailedNotification.dismiss();
    }
    const task = taskMeta.taskRunner.runTask(taskMeta.type);
    const taskStatus = { metadata: taskMeta, task };
    const events = (0, (_tasks || _load_tasks()).observableFromTask)(task);

    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_STARTED,
      payload: { taskStatus }
    }).concat(events.filter(event => event.type === 'progress').map(event => ({
      type: (_Actions || _load_Actions()).TASK_PROGRESS,
      payload: { progress: event.progress }
    }))).concat(_rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_COMPLETED,
      payload: { taskStatus: Object.assign({}, taskStatus, { progress: 1 }) }
    }));
  }).catch(error => {
    taskFailedNotification = atom.notifications.addError(`The task "${taskMeta.label}" failed`, {
      description: error.message,
      dismissable: true
    });
    taskFailedNotification.onDidDismiss(() => {
      taskFailedNotification = null;
    });
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Error running task:', taskMeta, error);
    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_ERRORED,
      payload: {
        error,
        taskStatus: (0, (_nullthrows || _load_nullthrows()).default)(getState().runningTask)
      }
    });
  }).share();
}

function getBestEffortTaskRunner(taskRunners, statesForTaskRunners) {
  return taskRunners.reduce((memo, runner) => {
    const state = statesForTaskRunners.get(runner);
    // Disabled task runners aren't selectable
    if (!state || !state.enabled) {
      return memo;
    }
    // Select at least something
    if (memo == null) {
      return runner;
    }

    // Highest priority wins
    const memoPriority = memo.getPriority && memo.getPriority() || 0;
    const runnerPriority = runner.getPriority && runner.getPriority() || 0;
    if (runnerPriority > memoPriority) {
      return runner;
    }
    return memo;
  }, null);
}