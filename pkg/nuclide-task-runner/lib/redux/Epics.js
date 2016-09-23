'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState, Store, TaskId, TaskMetadata, TaskRunner} from '../types';
import type {ActionsObservable} from '../../../commons-node/redux-observable';

import {observableFromTask} from '../../../commons-node/tasks';
import {observableFromSubscribeFunction} from '../../../commons-node/event';
import {getTaskMetadata} from '../getTaskMetadata';
import {getActiveTaskRunner} from '../redux/Selectors';
import * as Actions from './Actions';
import invariant from 'assert';
import {Observable} from 'rxjs';

export function registerTaskRunnerEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.REGISTER_TASK_RUNNER).flatMap(action => {
    invariant(action.type === Actions.REGISTER_TASK_RUNNER);
    const {taskRunner} = action.payload;

    // Set the project root on the new task runner.
    const {setProjectRoot} = taskRunner;
    if (typeof setProjectRoot === 'function') {
      const projectRoot = store.getState().projectRoot;
      setProjectRoot.call(taskRunner, projectRoot);
    }

    const taskListToAction = taskList => ({
      type: Actions.TASK_LIST_UPDATED,
      payload: {
        taskRunnerId: taskRunner.id,
        taskList,
      },
    });
    const unregistrationEvents = actions.filter(a => (
      a.type === Actions.UNREGISTER_TASK_RUNNER && a.payload.id === taskRunner.id
    ));
    return observableFromSubscribeFunction(taskRunner.observeTaskList.bind(taskRunner))
      .map(taskListToAction)
      .takeUntil(unregistrationEvents);
  });
}

export function runTaskEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.RUN_TASK)
    .switchMap(action => {
      invariant(action.type === Actions.RUN_TASK);
      const taskToRun = action.payload.taskId || store.getState().activeTaskId;

      // Don't do anything if there's no active task.
      if (taskToRun == null) { return Observable.empty(); }

      // Don't do anything if a task is already running.
      if (store.getState().runningTaskInfo != null) { return Observable.empty(); }

      return Observable.concat(
        taskIdsAreEqual(store.getState().activeTaskId, taskToRun)
          ? Observable.empty()
          : Observable.of(Actions.selectTask(taskToRun)),
        store.getState().visible
          ? Observable.empty()
          : Observable.of(Actions.setToolbarVisibility(true)),
        Observable.defer(() => {
          const state = store.getState();
          const activeTaskRunner = getActiveTaskRunner(state);

          if (activeTaskRunner == null) {
            return Observable.empty();
          }

          const taskMeta = getTaskMetadata(taskToRun, state.taskLists);
          invariant(taskMeta != null);

          if (!taskMeta.runnable) {
            return Observable.empty();
          }

          return createTaskObservable(activeTaskRunner, taskMeta, () => store.getState())
            // Stop listening once the task is done.
            .takeUntil(
              actions.ofType(Actions.TASK_COMPLETED, Actions.TASK_ERRORED, Actions.TASK_STOPPED),
            );
        }),
      );
    });
}

export function setProjectRootEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.SET_PROJECT_ROOT)
    .do(action => {
      invariant(action.type === Actions.SET_PROJECT_ROOT);
      const {projectRoot} = action.payload;

      // Set the project root on all registered task runners.
      store.getState().taskRunners.forEach(taskRunner => {
        if (typeof taskRunner.setProjectRoot === 'function') {
          taskRunner.setProjectRoot(projectRoot);
        }
      });
    })
    // This is just for side-effects
    .ignoreElements();
}

export function setToolbarVisibilityEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.SET_TOOLBAR_VISIBILITY)
    .map(action => {
      invariant(action.type === Actions.SET_TOOLBAR_VISIBILITY);
      const {visible} = action.payload;
      return {
        type: Actions.TOOLBAR_VISIBILITY_UPDATED,
        payload: {visible},
      };
    });
}

export function stopTaskEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.STOP_TASK)
    .switchMap(action => {
      const {runningTaskInfo} = store.getState();
      const task = runningTaskInfo == null ? null : runningTaskInfo.task;
      if (task == null) { return Observable.empty(); }
      return Observable.of({
        type: Actions.TASK_STOPPED,
        payload: {task},
      });
    });
}

export function toggleToolbarVisibilityEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.TOGGLE_TOOLBAR_VISIBILITY)
    .switchMap(action => {
      invariant(action.type === Actions.TOGGLE_TOOLBAR_VISIBILITY);
      const state = store.getState();
      const {taskRunnerId} = action.payload;

      // If no taskRunnerId is provided, just toggle the visibility.
      if (taskRunnerId == null) {
        return Observable.of(Actions.setToolbarVisibility(!state.visible));
      }

      // If the active task corresponds to the task runner you want to toggle, just toggle the
      // visibility.
      const {activeTaskId} = state;
      if (activeTaskId != null && activeTaskId.taskRunnerId === taskRunnerId) {
        return Observable.of(Actions.setToolbarVisibility(!state.visible));
      }

      // Choose the first task for that task runner.
      const taskListForRunner = state.taskLists.get(taskRunnerId) || [];
      const taskIdToSelect = taskListForRunner.length > 0 ? taskListForRunner[0] : null;
      if (taskIdToSelect == null) {
        const taskRunner = state.taskRunners.get(taskRunnerId);
        invariant(taskRunner != null);
        atom.notifications.addWarning(`The ${taskRunner.name} task runner doesn't have any tasks!`);
      }

      return Observable.concat(
        // Make sure the toolbar is shown.
        Observable.of(Actions.setToolbarVisibility(true)),

        // Select the task.
        taskIdToSelect == null
          ? Observable.empty()
          : Observable.of(Actions.selectTask(taskIdToSelect)),
      );
    });
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(
  taskRunner: TaskRunner,
  taskMeta: TaskMetadata,
  getState: () => AppState,
): Observable<Action> {
  return Observable.defer(() => {
    const task = taskRunner.runTask(taskMeta.type);
    const events = observableFromTask(task);

    return Observable
      .of({
        type: Actions.TASK_STARTED,
        payload: {task},
      })
      .concat(
        events
          .filter(event => event.type === 'progress')
          .map(event => ({
            type: Actions.TASK_PROGRESS,
            payload: {progress: event.progress},
          })),
      )
      .concat(Observable.of({
        type: Actions.TASK_COMPLETED,
        payload: {task},
      }));
  })
    .catch(error => {
      atom.notifications.addError(
        `The task "${taskMeta.label}" failed`,
        {
          detail: error.stack,
          dismissable: true,
        },
      );
      const {runningTaskInfo} = getState();
      return Observable.of({
        type: Actions.TASK_ERRORED,
        payload: {
          error,
          task: runningTaskInfo == null ? null : runningTaskInfo.task,
        },
      });
    })
    .share();
}

function taskIdsAreEqual(a: ?TaskId, b: ?TaskId): boolean {
  if (a == null || b == null) { return false; }
  return a.type === b.type && a.taskRunnerId === b.taskRunnerId;
}
