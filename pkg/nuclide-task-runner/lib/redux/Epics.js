'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRootEpic = setProjectRootEpic;
exports.setProjectRootForNewTaskRunnerEpic = setProjectRootForNewTaskRunnerEpic;
exports.setConsolesForTaskRunnersEpic = setConsolesForTaskRunnersEpic;
exports.addConsoleForTaskRunnerEpic = addConsoleForTaskRunnerEpic;
exports.removeConsoleForTaskRunnerEpic = removeConsoleForTaskRunnerEpic;
exports.setActiveTaskRunnerEpic = setActiveTaskRunnerEpic;
exports.combineTaskRunnerStatesEpic = combineTaskRunnerStatesEpic;
exports.toggleToolbarVisibilityEpic = toggleToolbarVisibilityEpic;
exports.updatePreferredVisibilityEpic = updatePreferredVisibilityEpic;
exports.updatePreferredTaskRunnerEpic = updatePreferredTaskRunnerEpic;
exports.verifySavedBeforeRunningTaskEpic = verifySavedBeforeRunningTaskEpic;
exports.runTaskEpic = runTaskEpic;
exports.stopTaskEpic = stopTaskEpic;
exports.setToolbarVisibilityEpic = setToolbarVisibilityEpic;
exports.printTaskCancelledEpic = printTaskCancelledEpic;
exports.printTaskSucceededEpic = printTaskSucceededEpic;
exports.appendMessageToConsoleEpic = appendMessageToConsoleEpic;

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
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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
 * @format
 */

function setProjectRootEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).DID_ACTIVATE_INITIAL_PACKAGES).map(() => (_Actions || _load_Actions()).setProjectRoot(store.getState().projectRoot));
}

function setProjectRootForNewTaskRunnerEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REGISTER_TASK_RUNNER).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).REGISTER_TASK_RUNNER)) {
      throw new Error('Invariant violation: "action.type === Actions.REGISTER_TASK_RUNNER"');
    }

    const { taskRunner } = action.payload;
    const { projectRoot, taskRunnersReady } = store.getState();

    if (!taskRunnersReady) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    return getTaskRunnerState(taskRunner, projectRoot).map(result => (_Actions || _load_Actions()).setStateForTaskRunner(result.taskRunner, result.taskRunnerState));
  });
}

function setConsolesForTaskRunnersEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_CONSOLE_SERVICE, (_Actions || _load_Actions()).DID_ACTIVATE_INITIAL_PACKAGES).switchMap(() => {
    const { consoleService, taskRunnersReady } = store.getState();
    if (consoleService == null || !taskRunnersReady) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const consolesForTaskRunners = store.getState().taskRunners.map(runner => [runner, consoleService({ id: runner.name, name: runner.name })]);
    return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setConsolesForTaskRunners(new Map(consolesForTaskRunners)));
  });
}

function addConsoleForTaskRunnerEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REGISTER_TASK_RUNNER).switchMap(action => {
    const { consoleService, taskRunnersReady } = store.getState();
    if (consoleService == null || !taskRunnersReady) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    if (!(action.type === (_Actions || _load_Actions()).REGISTER_TASK_RUNNER)) {
      throw new Error('Invariant violation: "action.type === Actions.REGISTER_TASK_RUNNER"');
    }

    const { taskRunner } = action.payload;
    const { id, name } = taskRunner;
    return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).addConsoleForTaskRunner(taskRunner, consoleService({ id, name })));
  });
}

function removeConsoleForTaskRunnerEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER).switchMap(action => {
    const { consoleService, taskRunnersReady } = store.getState();
    if (consoleService == null || !taskRunnersReady) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    if (!(action.type === (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER)) {
      throw new Error('Invariant violation: "action.type === Actions.UNREGISTER_TASK_RUNNER"');
    }

    return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).removeConsoleForTaskRunner(action.payload.taskRunner));
  });
}

function setActiveTaskRunnerEpic(actions, store, options) {
  return actions.filter(action => action.type === (_Actions || _load_Actions()).SET_STATES_FOR_TASK_RUNNERS || action.type === (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER && action.payload.taskRunner === store.getState().activeTaskRunner).switchMap(action => {
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
        visibilityAction = _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(false, false));
      }
      taskRunner = activeTaskRunner;
    }

    // We have nothing to go with, let's make best effort to select a task runner
    if (!taskRunner || taskRunner === activeTaskRunner && action.type === (_Actions || _load_Actions()).UNREGISTER_TASK_RUNNER) {
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

    const runnersAndStates = taskRunners.map(taskRunner => getTaskRunnerState(taskRunner, projectRoot));

    return _rxjsBundlesRxMinJs.Observable.from(runnersAndStates)
    // $FlowFixMe: type combineAll
    .combineAll().map(tuples => {
      const statesForTaskRunners = new Map();
      tuples.forEach(result => {
        if (store.getState().taskRunners.includes(result.taskRunner)) {
          statesForTaskRunners.set(result.taskRunner, result.taskRunnerState);
        }
      });
      return (_Actions || _load_Actions()).setStatesForTaskRunners(statesForTaskRunners);
    });
  });
}

function toggleToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).REQUEST_TOGGLE_TOOLBAR_VISIBILITY).flatMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).REQUEST_TOGGLE_TOOLBAR_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.REQUEST_TOGGLE_TOOLBAR_VISIBILITY"');
    }

    const state = store.getState();
    const { activeTaskRunner, projectRoot } = state;
    const currentlyVisible = state.visible;
    const { visible, taskRunner } = action.payload;

    if (visible === true || visible === null && !currentlyVisible) {
      if (projectRoot == null) {
        atom.notifications.addError('Add a project to use the task runner toolbar', {
          dismissable: true
        });
        return _rxjsBundlesRxMinJs.Observable.empty();
      } else if (activeTaskRunner == null) {
        atom.notifications.addError('No task runner available for the current working root selected in file tree', {
          dismissable: true
        });
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(false, true));
      }
    }
    return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).toggleToolbarVisibility(visible, taskRunner));
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
    if (updateUserPreferences && projectRoot != null && activeTaskRunner != null) {
      // The user explicitly changed the visibility, remember this state
      const { preferencesForWorkingRoots } = options;
      preferencesForWorkingRoots.setItem(projectRoot.getPath(), {
        taskRunnerId: activeTaskRunner.id,
        visible
      });
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
    const { activeTaskRunner, runningTask } = store.getState();
    if (!runningTask) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    if (!activeTaskRunner) {
      throw new Error('Invariant violation: "activeTaskRunner"');
    }

    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_STOPPED,
      payload: { taskStatus: runningTask, taskRunner: activeTaskRunner }
    });
  });
}

function setToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_TOOLBAR_VISIBILITY"');
    }

    const state = store.getState();
    const { activeTaskRunner, statesForTaskRunners } = state;
    const { visible, taskRunner } = action.payload;

    // If changing to a new task runner, select it and show it.
    if (taskRunner != null) {
      const taskRunnerState = statesForTaskRunners.get(taskRunner);
      if (taskRunnerState != null && taskRunnerState.enabled && taskRunner !== activeTaskRunner) {
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTaskRunner(taskRunner, true), (_Actions || _load_Actions()).setToolbarVisibility(visible != null ? visible : true, true));
      }
    }

    // Otherwise, just toggle the visibility (unless the "visible" override is provided).
    return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(visible != null ? visible : !state.visible, true));
  });
}

function printTaskCancelledEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TASK_STOPPED).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).TASK_STOPPED)) {
      throw new Error('Invariant violation: "action.type === Actions.TASK_STOPPED"');
    }

    const { type } = action.payload.taskStatus.metadata;
    const { taskRunner } = action.payload;
    const capitalizedType = type.slice(0, 1).toUpperCase() + type.slice(1);
    return {
      type: (_Actions || _load_Actions()).TASK_MESSAGE,
      payload: {
        message: { text: `${capitalizedType} cancelled.`, level: 'warning' },
        taskRunner
      }
    };
  });
}

function printTaskSucceededEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TASK_COMPLETED).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).TASK_COMPLETED)) {
      throw new Error('Invariant violation: "action.type === Actions.TASK_COMPLETED"');
    }

    const { type } = action.payload.taskStatus.metadata;
    const { taskRunner } = action.payload;
    const capitalizedType = type.slice(0, 1).toUpperCase() + type.slice(1);
    return {
      type: (_Actions || _load_Actions()).TASK_MESSAGE,
      payload: {
        message: { text: `${capitalizedType} succeeded.`, level: 'success' },
        taskRunner
      }
    };
  });
}

function appendMessageToConsoleEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TASK_MESSAGE).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).TASK_MESSAGE)) {
      throw new Error('Invariant violation: "action.type === Actions.TASK_MESSAGE"');
    }

    const { message, taskRunner } = action.payload;
    const consoleApi = store.getState().consolesForTaskRunners.get(taskRunner);
    if (consoleApi) {
      consoleApi.append(Object.assign({}, message));
    }
  }).ignoreElements();
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
    }).concat(events.flatMap(event => {
      if (event.type === 'progress') {
        return _rxjsBundlesRxMinJs.Observable.of({
          type: (_Actions || _load_Actions()).TASK_PROGRESS,
          payload: { progress: event.progress }
        });
      } else if (event.type === 'message') {
        return _rxjsBundlesRxMinJs.Observable.of({
          type: (_Actions || _load_Actions()).TASK_MESSAGE,
          payload: {
            message: event.message,
            taskRunner: taskMeta.taskRunner
          }
        });
      } else if (event.type === 'status' && event.status != null) {
        return _rxjsBundlesRxMinJs.Observable.of({
          type: (_Actions || _load_Actions()).TASK_MESSAGE,
          payload: {
            message: { text: event.status, level: 'info' },
            taskRunner: taskMeta.taskRunner
          }
        });
      } else {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
    })).concat(_rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_COMPLETED,
      payload: {
        taskStatus: Object.assign({}, taskStatus, { progress: 1 }),
        taskRunner: taskMeta.taskRunner
      }
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
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-task-runner').debug('Error running task:', taskMetaForLogging, error);
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

function getTaskRunnerState(taskRunner, projectRoot) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => new (_UniversalDisposable || _load_UniversalDisposable()).default(taskRunner.setProjectRoot(projectRoot, (enabled, tasks) => {
    observer.next({
      taskRunner,
      taskRunnerState: { enabled, tasks: enabled ? tasks : [] }
    });
  })));
}