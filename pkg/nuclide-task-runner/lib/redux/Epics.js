'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.aggregateTaskListsEpic = aggregateTaskListsEpic;
exports.setProjectRootEpic = setProjectRootEpic;
exports.runTaskEpic = runTaskEpic;
exports.stopTaskEpic = stopTaskEpic;
exports.toggleToolbarVisibilityEpic = toggleToolbarVisibilityEpic;

var _tasks;

function _load_tasks() {
  return _tasks = require('../../../commons-node/tasks');
}

var _event;

function _load_event() {
  return _event = require('../../../commons-node/event');
}

var _observable;

function _load_observable() {
  return _observable = require('../../../commons-node/observable');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _getTaskMetadata;

function _load_getTaskMetadata() {
  return _getTaskMetadata = require('../getTaskMetadata');
}

var _Selectors;

function _load_Selectors() {
  return _Selectors = require('../redux/Selectors');
}

var _taskIdsAreEqual;

function _load_taskIdsAreEqual() {
  return _taskIdsAreEqual = require('../taskIdsAreEqual');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function aggregateTaskListsEpic(actions, store) {
  // Wait until the initial packages have loaded.
  return actions.ofType((_Actions || _load_Actions()).DID_LOAD_INITIAL_PACKAGES)
  // Then, whenever the project root changes...
  .switchMap(() => store.getState().states.map(state => state.projectRoot)).distinctUntilChanged((a, b) => {
    const aPath = a && a.getPath();
    const bPath = b && b.getPath();
    return aPath === bPath;
  }).switchMap(projectRoot => {
    // We get the state stream from the state. Ideally, we'd just use `Observable.from(store)`,
    // but Redux gives us a partial store so we have to work around it.
    // See redux-observable/redux-observable#56
    var _store$getState = store.getState();

    const states = _store$getState.states;

    const taskRunnersByIdStream = states.map(state => state.taskRunners).distinctUntilChanged();

    // We want to make sure that we don't call `observeTaskList()` when nothing's changed, so we
    // use `diffSets()` to identify changes.
    const diffs = (0, (_observable || _load_observable()).diffSets)(taskRunnersByIdStream.map(taskRunnersById => new Set(taskRunnersById.keys()))).share();

    // Create a stream containing the task list updates, tagged by task runner id.
    const taskListsByIdStream = diffs.mergeMap((_ref) => {
      let added = _ref.added;
      return (
        // Get an observable of task lists for each task runner. Tag it with the task runner id
        // so that we can tie them back later.
        _rxjsBundlesRxMinJs.Observable.from(added).mergeMap(taskRunnerId => {
          const taskRunner = store.getState().taskRunners.get(taskRunnerId);

          if (!(taskRunner != null)) {
            throw new Error('Invariant violation: "taskRunner != null"');
          }

          const taskLists = (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => taskRunner.observeTaskList(cb))
          // When the task runner is removed, stop listening to its task list.
          .takeUntil(diffs.filter(diff => diff.removed.has(taskRunnerId))).map(taskList => {
            // Annotate each task with some info about its runner.
            const annotatedTaskList = taskList.map(task => Object.assign({}, task, {
              taskRunnerId: taskRunnerId,
              taskRunnerName: taskRunner.name
            }));
            // Tag each task list with the id of its runner for adding to the map.
            return { taskRunnerId: taskRunnerId, taskList: annotatedTaskList };
          })
          // When it completes, null the task list.
          .concat(_rxjsBundlesRxMinJs.Observable.of({ taskRunnerId: taskRunnerId, taskList: null })).share();
          // If it takes too long to get a task list, start with an empty list.
          const timeout = _rxjsBundlesRxMinJs.Observable.of({ taskRunnerId: taskRunnerId, taskList: [] }).delay(2000).takeUntil(taskLists.take(1));
          return _rxjsBundlesRxMinJs.Observable.merge(timeout, taskLists);
        })
      );
    }).scan(
    // Combine the lists from each task runner into a single map.
    // Watch out! We're mutating the map.
    (acc, _ref2) => {
      let taskRunnerId = _ref2.taskRunnerId,
          taskList = _ref2.taskList;

      if (taskList == null) {
        acc.delete(taskRunnerId);
      } else {
        acc.set(taskRunnerId, taskList);
      }
      return acc;
    }, new Map());

    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setProjectRoot(projectRoot)), taskListsByIdStream.map(taskListsById => (_Actions || _load_Actions()).setTaskLists(taskListsById)));
  });
}function setProjectRootEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROJECT_ROOT).do(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_PROJECT_ROOT)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_PROJECT_ROOT"');
    }

    const projectRoot = action.payload.projectRoot;

    for (const taskRunner of store.getState().taskRunners.values()) {
      if (taskRunner.setProjectRoot != null) {
        taskRunner.setProjectRoot(projectRoot);
      }
    }
  })
  // This is just for side-effects.
  .ignoreElements();
}

function runTaskEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).RUN_TASK).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).RUN_TASK)) {
      throw new Error('Invariant violation: "action.type === Actions.RUN_TASK"');
    }

    const taskToRun = action.payload.taskId || (0, (_Selectors || _load_Selectors()).getActiveTaskId)(store.getState());

    // Don't do anything if there's no active task.
    if (taskToRun == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    // Don't do anything if a task is already running.
    if (store.getState().runningTaskInfo != null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    return _rxjsBundlesRxMinJs.Observable.concat((0, (_taskIdsAreEqual || _load_taskIdsAreEqual()).taskIdsAreEqual)(store.getState().activeTaskId, taskToRun) ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTask(taskToRun)), store.getState().visible ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true)), _rxjsBundlesRxMinJs.Observable.defer(() => {
      const state = store.getState();
      const activeTaskRunner = (0, (_Selectors || _load_Selectors()).getActiveTaskRunner)(state);

      if (activeTaskRunner == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const taskMeta = (0, (_getTaskMetadata || _load_getTaskMetadata()).getTaskMetadata)(taskToRun, state.taskLists);

      if (!(taskMeta != null)) {
        throw new Error('Invariant violation: "taskMeta != null"');
      }

      if (!taskMeta.runnable) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      return createTaskObservable(activeTaskRunner, taskMeta, () => store.getState())
      // Stop listening once the task is done.
      .takeUntil(actions.ofType((_Actions || _load_Actions()).TASK_COMPLETED, (_Actions || _load_Actions()).TASK_ERRORED, (_Actions || _load_Actions()).TASK_STOPPED));
    }));
  });
}

function stopTaskEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).STOP_TASK).switchMap(action => {
    var _store$getState2 = store.getState();

    const runningTaskInfo = _store$getState2.runningTaskInfo;

    const task = runningTaskInfo == null ? null : runningTaskInfo.task;
    if (task == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_STOPPED,
      payload: { task: task }
    });
  });
}

function toggleToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).TOGGLE_TOOLBAR_VISIBILITY)) {
      throw new Error('Invariant violation: "action.type === Actions.TOGGLE_TOOLBAR_VISIBILITY"');
    }

    const state = store.getState();
    const taskRunnerId = action.payload.taskRunnerId;

    // If no taskRunnerId is provided, just toggle the visibility.

    if (taskRunnerId == null) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(!state.visible));
    }

    // If the active task corresponds to the task runner you want to toggle, just toggle the
    // visibility.
    const activeTaskId = state.activeTaskId;

    if (activeTaskId != null && activeTaskId.taskRunnerId === taskRunnerId) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(!state.visible));
    }

    // Choose the first task for that task runner.
    const taskListForRunner = state.taskLists.get(taskRunnerId) || [];
    const taskIdToSelect = taskListForRunner.length > 0 ? taskListForRunner[0] : null;
    if (taskIdToSelect == null) {
      const taskRunner = state.taskRunners.get(taskRunnerId);

      if (!(taskRunner != null)) {
        throw new Error('Invariant violation: "taskRunner != null"');
      }

      atom.notifications.addWarning(`The ${ taskRunner.name } task runner doesn't have any tasks!`);
    }

    return _rxjsBundlesRxMinJs.Observable.concat(
    // Make sure the toolbar is shown.
    _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setToolbarVisibility(true)),

    // Select the task.
    taskIdToSelect == null ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).selectTask(taskIdToSelect)));
  });
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(taskRunner, taskMeta, getState) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const task = taskRunner.runTask(taskMeta.type);
    const events = (0, (_tasks || _load_tasks()).observableFromTask)(task);

    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_STARTED,
      payload: { task: task }
    }).concat(events.filter(event => event.type === 'progress').map(event => ({
      type: (_Actions || _load_Actions()).TASK_PROGRESS,
      payload: { progress: event.progress }
    }))).concat(_rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_COMPLETED,
      payload: { task: task }
    }));
  }).catch(error => {
    atom.notifications.addError(`The task "${ taskMeta.label }" failed`, {
      description: error.message,
      dismissable: true
    });
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Error running task:', taskMeta, error);

    var _getState = getState();

    const runningTaskInfo = _getState.runningTaskInfo;

    return _rxjsBundlesRxMinJs.Observable.of({
      type: (_Actions || _load_Actions()).TASK_ERRORED,
      payload: {
        error: error,
        task: runningTaskInfo == null ? null : runningTaskInfo.task
      }
    });
  }).share();
}