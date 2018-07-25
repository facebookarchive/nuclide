"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
exports.trackEpic = trackEpic;
exports.printTaskCanceledEpic = printTaskCanceledEpic;
exports.printTaskSucceededEpic = printTaskSucceededEpic;
exports.appendMessageToConsoleEpic = appendMessageToConsoleEpic;

function _observable() {
  const data = require("../../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _tasks() {
  const data = require("../../../commons-node/tasks");

  _tasks = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
function setProjectRootForNewTaskRunnerEpic(actions, store) {
  return actions.ofType(Actions().REGISTER_TASK_RUNNER).mergeMap(action => {
    if (!(action.type === Actions().REGISTER_TASK_RUNNER)) {
      throw new Error("Invariant violation: \"action.type === Actions.REGISTER_TASK_RUNNER\"");
    }

    const {
      taskRunner
    } = action.payload;
    const unregistered = actions.filter(a => a.type === Actions().UNREGISTER_TASK_RUNNER && a.payload.taskRunner === taskRunner);
    const {
      projectRoot,
      initialPackagesActivated
    } = store.getState();

    if (!initialPackagesActivated || projectRoot == null) {
      return _RxMin.Observable.empty();
    }

    return getTaskRunnerState(taskRunner, projectRoot).map(result => Actions().setStateForTaskRunner(result.taskRunner, result.taskRunnerState)).takeUntil(unregistered);
  });
}

function setConsolesForTaskRunnersEpic(actions, store) {
  return actions.ofType(Actions().SET_CONSOLE_SERVICE).switchMap(() => {
    const {
      consoleService
    } = store.getState();

    if (consoleService == null) {
      return _RxMin.Observable.empty();
    }

    const consolesForTaskRunners = store.getState().taskRunners.map(runner => [runner, consoleService({
      id: runner.id,
      name: runner.name
    })]);
    return _RxMin.Observable.of(Actions().setConsolesForTaskRunners(Immutable().Map(consolesForTaskRunners)));
  });
}

function addConsoleForTaskRunnerEpic(actions, store) {
  return actions.ofType(Actions().REGISTER_TASK_RUNNER).switchMap(action => {
    const {
      consoleService
    } = store.getState();

    if (consoleService == null) {
      return _RxMin.Observable.empty();
    }

    if (!(action.type === Actions().REGISTER_TASK_RUNNER)) {
      throw new Error("Invariant violation: \"action.type === Actions.REGISTER_TASK_RUNNER\"");
    }

    const {
      taskRunner
    } = action.payload;
    const {
      id,
      name
    } = taskRunner;
    return _RxMin.Observable.of(Actions().addConsoleForTaskRunner(taskRunner, consoleService({
      id,
      name
    })));
  });
}

function removeConsoleForTaskRunnerEpic(actions, store) {
  return actions.ofType(Actions().UNREGISTER_TASK_RUNNER).switchMap(action => {
    const {
      consoleService
    } = store.getState();

    if (consoleService == null) {
      return _RxMin.Observable.empty();
    }

    if (!(action.type === Actions().UNREGISTER_TASK_RUNNER)) {
      throw new Error("Invariant violation: \"action.type === Actions.UNREGISTER_TASK_RUNNER\"");
    }

    return _RxMin.Observable.of(Actions().removeConsoleForTaskRunner(action.payload.taskRunner));
  });
}

function setActiveTaskRunnerEpic(actions, store, options) {
  return actions.filter(action => action.type === Actions().SET_STATES_FOR_TASK_RUNNERS || action.type === Actions().SET_STATE_FOR_TASK_RUNNER || action.type === Actions().UNREGISTER_TASK_RUNNER && action.payload.taskRunner === store.getState().activeTaskRunner).switchMap(action => {
    const {
      projectRoot
    } = store.getState();

    if (projectRoot == null) {
      return _RxMin.Observable.of(Actions().selectTaskRunner(null, false));
    }

    const {
      activeTaskRunner,
      taskRunners,
      statesForTaskRunners
    } = store.getState();
    const {
      preferencesForWorkingRoots
    } = options;
    const preference = preferencesForWorkingRoots.getItem(projectRoot);
    let visibilityAction;
    let taskRunner = activeTaskRunner;

    if (preference) {
      // The user had a session for this root in the past, restore it
      visibilityAction = _RxMin.Observable.of(Actions().setToolbarVisibility(preference.visible, false));
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
        visibilityAction = _RxMin.Observable.of(Actions().setToolbarVisibility(true, true));
      } else {
        visibilityAction = _RxMin.Observable.of(Actions().setToolbarVisibility(false, false));
      }

      taskRunner = activeTaskRunner;
    } // We have nothing to go with, let's make best effort to select a task runner


    if (!taskRunner || taskRunner === activeTaskRunner && action.type === Actions().UNREGISTER_TASK_RUNNER) {
      taskRunner = getBestEffortTaskRunner(taskRunners, statesForTaskRunners);
    }

    return _RxMin.Observable.concat(_RxMin.Observable.of(Actions().selectTaskRunner(taskRunner, false)), visibilityAction);
  });
}

function combineTaskRunnerStatesEpic(actions, store, options) {
  return actions.ofType(Actions().SET_PROJECT_ROOT, Actions().DID_ACTIVATE_INITIAL_PACKAGES).switchMap(() => {
    const {
      projectRoot,
      taskRunners,
      initialPackagesActivated
    } = store.getState();

    if (!initialPackagesActivated) {
      return _RxMin.Observable.empty();
    }

    if (taskRunners.count() === 0) {
      return _RxMin.Observable.of(Actions().setStatesForTaskRunners(Immutable().Map()));
    }

    const runnersAndStates = taskRunners.map(taskRunner => getTaskRunnerState(taskRunner, projectRoot));
    return _RxMin.Observable.from(runnersAndStates) // $FlowFixMe: type combineAll
    .combineAll().map(tuples => {
      const statesForTaskRunners = new Map();
      tuples.forEach(result => {
        if (store.getState().taskRunners.includes(result.taskRunner)) {
          statesForTaskRunners.set(result.taskRunner, result.taskRunnerState);
        }
      });
      return Actions().setStatesForTaskRunners(Immutable().Map(statesForTaskRunners));
    });
  });
}

function toggleToolbarVisibilityEpic(actions, store) {
  return actions.ofType(Actions().REQUEST_TOGGLE_TOOLBAR_VISIBILITY).flatMap(action => {
    if (!(action.type === Actions().REQUEST_TOGGLE_TOOLBAR_VISIBILITY)) {
      throw new Error("Invariant violation: \"action.type === Actions.REQUEST_TOGGLE_TOOLBAR_VISIBILITY\"");
    }

    const state = store.getState();
    const {
      activeTaskRunner,
      projectRoot
    } = state;
    const currentlyVisible = state.visible;
    const {
      visible,
      taskRunner
    } = action.payload; // eslint-disable-next-line eqeqeq

    if (visible === true || visible === null && !currentlyVisible) {
      if (projectRoot == null) {
        atom.notifications.addError('Add a project to use the task runner toolbar', {
          dismissable: true
        });
        return _RxMin.Observable.empty();
      } else if (activeTaskRunner == null) {
        atom.notifications.addError('No task runner available for the current working root selected in file tree', {
          dismissable: true
        });
        return _RxMin.Observable.of(Actions().setToolbarVisibility(false, true));
      }
    }

    return _RxMin.Observable.of(Actions().toggleToolbarVisibility(visible, taskRunner));
  });
}

function updatePreferredVisibilityEpic(actions, store, options) {
  return actions.ofType(Actions().SET_TOOLBAR_VISIBILITY).do(action => {
    if (!(action.type === Actions().SET_TOOLBAR_VISIBILITY)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_TOOLBAR_VISIBILITY\"");
    }

    const {
      visible,
      updateUserPreferences
    } = action.payload;
    const {
      projectRoot,
      activeTaskRunner
    } = store.getState(); // Only act if responding to an explicit user action

    if (updateUserPreferences && projectRoot != null && activeTaskRunner != null) {
      // The user explicitly changed the visibility, remember this state
      const {
        preferencesForWorkingRoots
      } = options;
      preferencesForWorkingRoots.setItem(projectRoot, {
        taskRunnerId: activeTaskRunner.id,
        visible
      });
    }
  }).ignoreElements();
}

function updatePreferredTaskRunnerEpic(actions, store, options) {
  return actions.ofType(Actions().SELECT_TASK_RUNNER).do(action => {
    if (!(action.type === Actions().SELECT_TASK_RUNNER)) {
      throw new Error("Invariant violation: \"action.type === Actions.SELECT_TASK_RUNNER\"");
    }

    const {
      updateUserPreferences
    } = action.payload;
    const {
      projectRoot,
      activeTaskRunner
    } = store.getState();

    if (updateUserPreferences && projectRoot != null && activeTaskRunner) {
      // The user explicitly selected this task runner, remember this state
      const {
        preferencesForWorkingRoots
      } = options;
      const updatedPreference = {
        visible: true,
        taskRunnerId: activeTaskRunner.id
      };
      preferencesForWorkingRoots.setItem(projectRoot, updatedPreference);
    }
  }).ignoreElements();
}
/**
 * Verifies that all the files are saved prior to running a task.
 */


function verifySavedBeforeRunningTaskEpic(actions, store) {
  return actions.filter(action => action.type === Actions().RUN_TASK && action.payload.verifySaved === true).switchMap(action => {
    if (!(action.type === Actions().RUN_TASK)) {
      throw new Error("Invariant violation: \"action.type === Actions.RUN_TASK\"");
    }

    const {
      taskMeta
    } = action.payload;
    const unsavedEditors = atom.workspace.getTextEditors().filter(editor => editor.getPath() != null && editor.isModified()); // Everything saved? Run it!

    if (unsavedEditors.length === 0) {
      return _RxMin.Observable.of(Actions().runTask(taskMeta, false));
    }

    return promptForShouldSave(taskMeta).switchMap(shouldSave => {
      if (shouldSave) {
        const saveAll = _RxMin.Observable.defer(() => {
          const stillUnsaved = atom.workspace.getTextEditors().filter(editor => editor.getPath() != null && editor.isModified());
          return Promise.all(unsavedEditors.filter(editor => stillUnsaved.indexOf(editor) !== -1).map(editor => editor.save()));
        });

        return _RxMin.Observable.concat(saveAll.ignoreElements(), _RxMin.Observable.of(Actions().runTask(taskMeta))).catch(err => {
          atom.notifications.addError('An unexpected error occurred while saving the files.', {
            dismissable: true,
            detail: err.stack.toString()
          });
          return _RxMin.Observable.empty();
        });
      }

      return _RxMin.Observable.of(Actions().runTask(taskMeta, false));
    });
  });
}

function runTaskEpic(actions, store) {
  return actions.filter(action => action.type === Actions().RUN_TASK && action.payload.verifySaved === false).switchMap(action => {
    if (!(action.type === Actions().RUN_TASK)) {
      throw new Error("Invariant violation: \"action.type === Actions.RUN_TASK\"");
    }

    const state = store.getState();
    const stopRunningTask = state.runningTask != null;
    const {
      taskMeta
    } = action.payload;
    const {
      activeTaskRunner
    } = state;
    const newTaskRunner = taskMeta.taskRunner;
    return _RxMin.Observable.concat(stopRunningTask ? _RxMin.Observable.of(Actions().stopTask()) : _RxMin.Observable.empty(), activeTaskRunner === newTaskRunner ? _RxMin.Observable.empty() : _RxMin.Observable.of(Actions().selectTaskRunner(newTaskRunner, true)), store.getState().visible ? _RxMin.Observable.empty() : _RxMin.Observable.of(Actions().setToolbarVisibility(true, true)), _RxMin.Observable.defer(() => {
      if (taskMeta.disabled) {
        return _RxMin.Observable.empty();
      }

      return createTaskObservable(taskMeta, store.getState) // Stop listening once the task is done.
      .takeUntil(actions.ofType(Actions().TASK_COMPLETED, Actions().TASK_ERRORED, Actions().TASK_STOPPED));
    }));
  });
}

function stopTaskEpic(actions, store) {
  return actions.ofType(Actions().STOP_TASK).switchMap(action => {
    const {
      activeTaskRunner,
      runningTask
    } = store.getState();

    if (!runningTask) {
      return _RxMin.Observable.empty();
    }

    if (!activeTaskRunner) {
      throw new Error("Invariant violation: \"activeTaskRunner\"");
    }

    return _RxMin.Observable.of({
      type: Actions().TASK_STOPPED,
      payload: {
        taskStatus: runningTask,
        taskRunner: activeTaskRunner
      }
    });
  });
}

function setToolbarVisibilityEpic(actions, store) {
  return actions.ofType(Actions().TOGGLE_TOOLBAR_VISIBILITY).switchMap(action => {
    if (!(action.type === Actions().TOGGLE_TOOLBAR_VISIBILITY)) {
      throw new Error("Invariant violation: \"action.type === Actions.TOGGLE_TOOLBAR_VISIBILITY\"");
    }

    const state = store.getState();
    const {
      activeTaskRunner,
      statesForTaskRunners
    } = state;
    const {
      visible,
      taskRunner
    } = action.payload; // If changing to a new task runner, select it and show it.

    if (taskRunner != null) {
      const taskRunnerState = statesForTaskRunners.get(taskRunner);

      if (taskRunnerState != null && taskRunnerState.enabled && taskRunner !== activeTaskRunner) {
        return _RxMin.Observable.of(Actions().selectTaskRunner(taskRunner, true), Actions().setToolbarVisibility(visible != null ? visible : true, true));
      }
    } // Otherwise, just toggle the visibility (unless the "visible" override is provided).


    return _RxMin.Observable.of(Actions().setToolbarVisibility(visible != null ? visible : !state.visible, true));
  });
}

function trackEpic(actions, store) {
  const trackingEvents = actions.map(action => {
    switch (action.type) {
      case Actions().TASK_STARTED:
        return {
          type: 'nuclide-task-runner:task-started',
          data: getTaskTrackEventData(action, store.getState())
        };

      case Actions().TASK_STOPPED:
        return {
          type: 'nuclide-task-runner:task-stopped',
          data: getTaskTrackEventData(action, store.getState())
        };

      case Actions().TASK_COMPLETED:
        return {
          type: 'nuclide-task-runner:task-completed',
          data: getTaskTrackEventData(action, store.getState())
        };

      case Actions().TASK_ERRORED:
        return {
          type: 'nuclide-task-runner:task-errored',
          data: getTaskTrackEventData(action, store.getState())
        };

      case Actions().SET_TOOLBAR_VISIBILITY:
        const visible = action.payload.visible;
        return visible ? {
          type: 'nuclide-task-runner:show'
        } : {
          type: 'nuclide-task-runner: hide'
        };

      default:
        return null;
    }
  }).let(_observable().compact);
  return trackingEvents.do(_nuclideAnalytics().trackEvent).ignoreElements();
}

function getTaskTrackEventData(action, state) {
  if (!(action.type === Actions().TASK_STARTED || action.type === Actions().TASK_STOPPED || action.type === Actions().TASK_COMPLETED || action.type === Actions().TASK_ERRORED)) {
    throw new Error("Invariant violation: \"action.type === Actions.TASK_STARTED ||\\n      action.type === Actions.TASK_STOPPED ||\\n      action.type === Actions.TASK_COMPLETED ||\\n      action.type === Actions.TASK_ERRORED\"");
  }

  const {
    activeTaskRunner,
    projectRoot
  } = state;

  if (!(projectRoot != null)) {
    throw new Error("Invariant violation: \"projectRoot != null\"");
  }

  if (!activeTaskRunner) {
    throw new Error("Invariant violation: \"activeTaskRunner\"");
  }

  const {
    taskStatus
  } = action.payload;
  const {
    task
  } = taskStatus;
  const taskTrackingData = // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  typeof task.getTrackingData === 'function' ? task.getTrackingData() : {};
  const error = action.type === Actions().TASK_ERRORED ? action.payload.error : null;
  const duration = action.type === Actions().TASK_STARTED ? null : new Date().getTime() - parseInt(action.payload.taskStatus.startDate.getTime(), 10);
  return Object.assign({}, taskTrackingData, {
    projectRoot,
    taskRunnerId: activeTaskRunner.id,
    taskType: taskStatus.metadata.type,
    errorMessage: error != null ? error.message : null,
    stackTrace: error != null ? String(error.stack) : null,
    duration
  });
}

function printTaskCanceledEpic(actions, store) {
  return actions.ofType(Actions().TASK_STOPPED).map(action => {
    if (!(action.type === Actions().TASK_STOPPED)) {
      throw new Error("Invariant violation: \"action.type === Actions.TASK_STOPPED\"");
    }

    const {
      type
    } = action.payload.taskStatus.metadata;
    const {
      taskRunner
    } = action.payload;
    const capitalizedType = type.slice(0, 1).toUpperCase() + type.slice(1);
    return {
      type: Actions().TASK_MESSAGE,
      payload: {
        message: {
          text: `${capitalizedType} cancelled.`,
          level: 'warning'
        },
        taskRunner
      }
    };
  });
}

function printTaskSucceededEpic(actions, store) {
  return actions.ofType(Actions().TASK_COMPLETED).map(action => {
    if (!(action.type === Actions().TASK_COMPLETED)) {
      throw new Error("Invariant violation: \"action.type === Actions.TASK_COMPLETED\"");
    }

    const {
      type
    } = action.payload.taskStatus.metadata;
    const {
      taskRunner
    } = action.payload;
    const capitalizedType = type.slice(0, 1).toUpperCase() + type.slice(1);
    return {
      type: Actions().TASK_MESSAGE,
      payload: {
        message: {
          text: `${capitalizedType} succeeded.`,
          level: 'success'
        },
        taskRunner
      }
    };
  });
}

function appendMessageToConsoleEpic(actions, store) {
  return actions.ofType(Actions().TASK_MESSAGE).do(action => {
    if (!(action.type === Actions().TASK_MESSAGE)) {
      throw new Error("Invariant violation: \"action.type === Actions.TASK_MESSAGE\"");
    }

    const {
      message,
      taskRunner
    } = action.payload;
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
  return _RxMin.Observable.defer(() => {
    if (taskFailedNotification != null) {
      taskFailedNotification.dismiss();
    }

    const task = taskMeta.taskRunner.runTask(taskMeta.type);
    const taskStatus = {
      metadata: taskMeta,
      task,
      progress: null,
      startDate: new Date()
    };
    const events = (0, _tasks().observableFromTask)(task);
    return _RxMin.Observable.of({
      type: Actions().TASK_STARTED,
      payload: {
        taskStatus
      }
    }).concat(events.flatMap(event => {
      if (event.type === 'progress') {
        return _RxMin.Observable.of({
          type: Actions().TASK_PROGRESS,
          payload: {
            progress: event.progress
          }
        });
      } else if (event.type === 'message') {
        return _RxMin.Observable.of({
          type: Actions().TASK_MESSAGE,
          payload: {
            message: event.message,
            taskRunner: taskMeta.taskRunner
          }
        });
      } else if (event.type === 'status' && event.status != null) {
        return _RxMin.Observable.of({
          type: Actions().TASK_MESSAGE,
          payload: {
            message: {
              text: event.status,
              level: 'info'
            },
            taskRunner: taskMeta.taskRunner
          }
        });
      } else {
        return _RxMin.Observable.empty();
      }
    })).concat(_RxMin.Observable.of({
      type: Actions().TASK_COMPLETED,
      payload: {
        taskStatus: Object.assign({}, taskStatus, {
          progress: 1
        }),
        taskRunner: taskMeta.taskRunner
      }
    }));
  }).catch(error => {
    let description;
    let buttons;

    if (error instanceof _process().ProcessExitError) {
      description = formatProcessExitError(error);
      buttons = [{
        text: 'Copy command',
        className: 'icon icon-clippy',
        onDidClick: () => atom.clipboard.write(error.command + ' ' + error.args.join(' '))
      }];
    } else {
      description = error.message;
    }

    taskFailedNotification = atom.notifications.addError(`The task "${taskMeta.label}" failed`, {
      buttons,
      description,
      dismissable: true
    });
    taskFailedNotification.onDidDismiss(() => {
      taskFailedNotification = null;
    });
    const taskMetaForLogging = Object.assign({}, taskMeta, {
      taskRunner: undefined
    });
    (0, _log4js().getLogger)('nuclide-task-runner').debug('Error running task:', taskMetaForLogging, error);
    return _RxMin.Observable.of({
      type: Actions().TASK_ERRORED,
      payload: {
        error,
        taskStatus: (0, _nullthrows().default)(getState().runningTask)
      }
    });
  }).share();
}

function getBestEffortTaskRunner(taskRunners, statesForTaskRunners) {
  return taskRunners.reduce((memo, runner) => {
    const state = statesForTaskRunners.get(runner); // Disabled task runners aren't selectable

    if (!state || !state.enabled) {
      return memo;
    } // Select at least something


    if (memo == null) {
      return runner;
    } // Highest priority wins


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
  return _RxMin.Observable.create(observer => {
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
        throw new Error("Invariant violation: \"notification != null\"");
      }

      notification.dismiss();
      notification = null;
    };
  });
}

function getTaskRunnerState(taskRunner, projectRoot) {
  return _RxMin.Observable.create(observer => new (_UniversalDisposable().default)(taskRunner.setProjectRoot(projectRoot, (enabled, tasks) => {
    observer.next({
      taskRunner,
      taskRunnerState: {
        enabled,
        tasks: enabled ? tasks : []
      }
    });
  }))) // We need the initial state to return within reasonable time, otherwise the toolbar hangs.
  // We don't want to start with all runners disabled because it causes UI jumps
  // when a preferred runner gets enabled after a non-preferred one.
  .race(_RxMin.Observable.timer(10000).switchMap(() => _RxMin.Observable.throw('Enabling timed out'))).catch(error => {
    (0, _log4js().getLogger)('nuclide-task-runner').error(`Disabling ${taskRunner.name} task runner, because setProjectRoot failed.\n\n${error}`);
    return _RxMin.Observable.of({
      taskRunner,
      taskRunnerState: {
        enabled: false,
        tasks: []
      }
    });
  });
}

function formatProcessExitError(error) {
  let message = '```\n';
  message += error.command + ' ' + error.args.join(' ');
  message += '\n```\n<br />';

  if (error.stderr !== '') {
    message += 'Stderr:\n';
    message += '```\n';
    message += error.stderr;
    message += '\n```\n<br />';
  }

  if (error.exitCode != null) {
    message += `Exit code: ${error.exitCode}\n<br />`;
  } else if (error.signal != null) {
    message += `Signal: ${error.signal}\n<br />`;
  }

  return message;
}