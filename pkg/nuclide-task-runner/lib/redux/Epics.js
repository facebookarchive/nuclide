'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRootEpic = setProjectRootEpic;
exports.setActiveTaskRunnerEpic = setActiveTaskRunnerEpic;
exports.combineTaskRunnerStatesEpic = combineTaskRunnerStatesEpic;
exports.updatePreferredVisibilityEpic = updatePreferredVisibilityEpic;
exports.updatePreferredTaskRunnerEpic = updatePreferredTaskRunnerEpic;
exports.verifySavedBeforeRunningTaskEpic = verifySavedBeforeRunningTaskEpic;
exports.runTaskEpic = runTaskEpic;
exports.stopTaskEpic = stopTaskEpic;
exports.toggleToolbarVisibilityEpic = toggleToolbarVisibilityEpic;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');
}

var _tasks;

function _load_tasks() {
  return _tasks = require('../../../commons-node/tasks');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
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

function setProjectRootEpic(actions, store, options) {
  return actions.ofType((_Actions || _load_Actions()).REGISTER_TASK_RUNNER, (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER, (_Actions || _load_Actions()).DID_ACTIVATE_INITIAL_PACKAGES)
  // Refreshes everything. Not the most efficient, but good enough
  .map(() => (_Actions || _load_Actions()).setProjectRoot(store.getState().projectRoot));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function setActiveTaskRunnerEpic(actions, store, options) {
  return actions.ofType((_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS).switchMap(() => {
    const { projectRoot } = store.getState();

    if (!projectRoot) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTaskRunner(null, false));
    }

    const {
      activeTaskRunner,
      taskRunners,
      statesForTaskRunners
    } = store.getState();
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
      const atLeastOneTaskRunnerEnabled = taskRunners.some(runner => {
        const state = statesForTaskRunners.get(runner);
        return state && state.enabled;
      });
      if (atLeastOneTaskRunnerEnabled) {
        // Advertise the toolbar if there's a chance it's useful at this new working root.
        visibilityAction = _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true, true));
      } else {
        visibilityAction = _rxjsBundlesRxMinJs.Observable.empty();
      }
      taskRunner = activeTaskRunner;
    }

    // We have nothing to go with, let's make best effort to select a task runner
    if (!taskRunner) {
      taskRunner = getBestEffortTaskRunner(taskRunners, statesForTaskRunners);
    }

    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTaskRunner(taskRunner, false)), visibilityAction);
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

    // Only act if responding to an explicit user action
    if (updateUserPreferences) {
      if (!projectRoot && visible) {
        atom.notifications.addError('Add a project to use the task runner toolbar', {
          dismissable: true
        });
      } else if (!activeTaskRunner && visible) {
        atom.notifications.addError('No task runner available for the current working root selected in file tree', {
          dismissable: true
        });
      } else if (projectRoot) {
        // The user explicitly changed the visibility, remember this state
        const { preferencesForWorkingRoots } = options;
        const taskRunnerId = activeTaskRunner ? activeTaskRunner.id : null;
        preferencesForWorkingRoots.setItem(projectRoot.getPath(), {
          taskRunnerId,
          visible
        });
      }
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
      const updatedPreference = {
        visible: true,
        taskRunnerId: activeTaskRunner.id
      };
      preferencesForWorkingRoots.setItem(projectRoot.getPath(), updatedPreference);
    }
  }).ignoreElements();
}

/**
 * Verifies that all the files are saved prior to running a task.
 */
function verifySavedBeforeRunningTaskEpic(actions, store) {
  return actions.filter(action => action.type === (_Actions || _load_Actions()).RUN_TASK && action.payload.verifySaved === true).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).RUN_TASK)) {
      throw new Error('Invariant violation: "action.type === Actions.RUN_TASK"');
    }

    const { taskMeta } = action.payload;
    const unsavedEditors = atom.workspace.getTextEditors().filter(editor => editor.getPath() != null && editor.isModified());

    // Everything saved? Run it!
    if (unsavedEditors.length === 0) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).runTask(taskMeta, false));
    }

    return promptForShouldSave(taskMeta).switchMap(shouldSave => {
      if (shouldSave) {
        const saveAll = _rxjsBundlesRxMinJs.Observable.defer(() => {
          const stillUnsaved = atom.workspace.getTextEditors().filter(editor => editor.getPath() != null && editor.isModified());
          return Promise.all(unsavedEditors.filter(editor => stillUnsaved.indexOf(editor) !== -1).map(editor => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).saveBuffer)(editor.getBuffer())));
        });
        return _rxjsBundlesRxMinJs.Observable.concat(saveAll.ignoreElements(), _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).runTask(taskMeta))).catch(err => {
          atom.notifications.addError('An unexpected error occurred while saving the files.', { dismissable: true, detail: err.stack.toString() });
          return _rxjsBundlesRxMinJs.Observable.empty();
        });
      }
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).runTask(taskMeta, false));
    });
  });
}

function runTaskEpic(actions, store) {
  return actions.filter(action => action.type === (_Actions || _load_Actions()).RUN_TASK && action.payload.verifySaved === false).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).RUN_TASK)) {
      throw new Error('Invariant violation: "action.type === Actions.RUN_TASK"');
    }

    const state = store.getState();
    const stopRunningTask = state.runningTask != null;

    const { taskMeta } = action.payload;
    const { activeTaskRunner } = state;
    const newTaskRunner = taskMeta.taskRunner;

    return _rxjsBundlesRxMinJs.Observable.concat(stopRunningTask ? _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).stopTask()) : _rxjsBundlesRxMinJs.Observable.empty(), activeTaskRunner === newTaskRunner ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTaskRunner(newTaskRunner, true)), store.getState().visible ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true, true)), _rxjsBundlesRxMinJs.Observable.defer(() => {
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
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTaskRunner(taskRunner, true), (_Actions || _load_Actions()).setToolbarVisibility(true, true));
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
    const taskMetaForLogging = Object.assign({}, taskMeta, { taskRunner: undefined });
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().debug('Error running task:', taskMetaForLogging, error);
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

/**
 * Returns an observable that:
 *   - prompts for whether the files should be saved before running the given task when subscribed
 *   - contains 0 or 1 elements:
 *       - `true` if the file should be saved before running
 *       - `false` if it shouldn't be
 *       - nothing if the user decides to cancel
 *   - dismisses the notification when unsubscribed
 */
function promptForShouldSave(taskMeta) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    let notification = atom.notifications.addInfo('You have files with unsaved changes.', {
      dismissable: true,
      description: `Do you want to save them before running the ${taskMeta.label} task?`,
      buttons: [{
        text: `Save All & ${taskMeta.label}`,
        onDidClick() {
          observer.next(true);
          observer.complete();
        }
      }, {
        text: `${taskMeta.label} Without Saving`,
        onDidClick() {
          observer.next(false);
          observer.complete();
        }
      }, {
        text: 'Cancel',
        className: 'icon icon-circle-slash',
        onDidClick() {
          observer.complete();
        }
      }]
    });
    return () => {
      if (!(notification != null)) {
        throw new Error('Invariant violation: "notification != null"');
      }

      notification.dismiss();
      notification = null;
    };
  });
}