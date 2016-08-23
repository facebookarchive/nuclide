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
import {bindObservableAsProps} from '../../../nuclide-ui/lib/bindObservableAsProps';
import {Toolbar} from '../ui/Toolbar';
import {getActiveTaskRunner} from '../getActiveTaskRunner';
import {getTaskMetadata} from '../getTaskMetadata';
import * as Actions from './Actions';
import invariant from 'assert';
import memoize from 'lodash.memoize';
import {React, ReactDOM} from 'react-for-atom';
import {Observable} from 'rxjs';


// We expect a store here because we want to subscribe to it. The one we get as an argument if we
// return a function here doesn't have Symbol.observable.
export function createPanelEpic(actions: ActionsObservable<Action>): Observable<Action> {
  return actions.ofType(Actions.CREATE_PANEL)
    .map(action => {
      invariant(action.type === Actions.CREATE_PANEL);

      // Ideally we would just use the store that's passed to the epic (and not have to include
      // it with the action), however that store doesn't have the full functionality (see
      // @reactjs/redux#1834)
      const {store} = action.payload;

      const staticProps = {
        runTask: taskId => { store.dispatch(Actions.runTask(taskId)); },
        selectTask: taskId => { store.dispatch(Actions.selectTask(taskId)); },
        stopTask: () => { store.dispatch(Actions.stopTask()); },
        getActiveTaskRunnerIcon: () => {
          const activeTaskRunner = getActiveTaskRunner(store.getState());
          return activeTaskRunner && activeTaskRunner.getIcon();
        },
      };

      // Delay the inital render. This way we (probably) won't wind up rendering the wrong task
      // runner before the correct one is registered.
      const props = Observable.interval(300).first()
        .switchMap(() => Observable.from(store))
        .map(state => {
          const activeTaskRunner = getActiveTaskRunner(state);
          return {
            ...staticProps,
            taskRunnerInfo: Array.from(state.taskRunners.values()),
            getExtraUi: getExtraUiFactory(activeTaskRunner),
            progress: state.runningTaskInfo && state.runningTaskInfo.progress,
            visible: state.visible,
            activeTaskId: state.activeTaskId,
            taskIsRunning: state.runningTaskInfo != null,
            taskLists: state.taskLists,
          };
        });

      const StatefulToolbar = bindObservableAsProps(props, Toolbar);
      const container = document.createElement('div');
      // $FlowIssue: bindObservableAsProps doesn't handle props exactly right.
      ReactDOM.render(<StatefulToolbar />, container);
      const panel = atom.workspace.addTopPanel({item: container});

      return {
        type: Actions.PANEL_CREATED,
        payload: {panel},
      };
    });
}

export function destroyPanelEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.DESTROY_PANEL)
    .switchMap(action => {
      const {panel} = store.getState();
      if (panel == null) {
        return Observable.empty();
      }
      const item = panel.getItem();
      ReactDOM.unmountComponentAtNode(item);
      panel.destroy();
      return Observable.of({type: Actions.PANEL_DESTROYED});
    });
}

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

/**
 * Since `getExtraUi` may create a React class dynamically, we want to ensure that we only ever call
 * it once. To do that, we memoize the function and cache the result.
 */
const extraUiFactories = new WeakMap();
function getExtraUiFactory(taskRunner: ?TaskRunner): ?() => ReactClass<any> {
  let getExtraUi = extraUiFactories.get(taskRunner);
  if (getExtraUi != null) { return getExtraUi; }
  if (taskRunner == null) { return null; }
  if (taskRunner.getExtraUi == null) { return null; }
  getExtraUi = memoize(taskRunner.getExtraUi.bind(taskRunner));
  extraUiFactories.set(taskRunner, getExtraUi);
  return getExtraUi;
}
