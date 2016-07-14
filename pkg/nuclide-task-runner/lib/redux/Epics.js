'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState, Store, Task, TaskId, TaskRunner} from '../types';
import type {ActionsObservable} from '../../../commons-node/redux-observable';

import {observableFromSubscribeFunction} from '../../../commons-node/event';
import once from '../../../commons-node/once';
import {bindObservableAsProps} from '../../../nuclide-ui/lib/bindObservableAsProps';
import {Toolbar} from '../ui/Toolbar';
import {getActiveTaskRunner} from '../getActiveTaskRunner';
import {getTask} from '../getTask';
import * as Actions from './Actions';
import invariant from 'assert';
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
        runTask: task => { store.dispatch(Actions.runTask(task)); },
        selectTask: task => { store.dispatch(Actions.selectTask(task)); },
        stopTask: () => { store.dispatch(Actions.stopTask()); },
        getActiveTaskRunnerIcon: () => {
          const activeTaskRunner = getActiveTaskRunner(store.getState());
          return activeTaskRunner && activeTaskRunner.getIcon();
        },
      };

      const props = Observable.from(store)
        // Delay the inital render. This way we (probably) won't wind up rendering the wrong task
        // runner before the correct one is registered.
        .cache(1)
        .skipUntil(Observable.interval(300).first())

        .map(state => {
          const activeTaskRunner = getActiveTaskRunner(state);
          return {
            ...staticProps,
            taskRunnerInfo: Array.from(state.taskRunners.values()),
            getExtraUi: activeTaskRunner != null && activeTaskRunner.getExtraUi != null
              ? activeTaskRunner.getExtraUi.bind(activeTaskRunner)
              : null,
            progress: state.taskStatus && state.taskStatus.progress,
            visible: state.visible,
            activeTaskId: state.activeTaskId,
            taskIsRunning: state.taskStatus != null,
            tasks: state.tasks,
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

    const tasksToAction = tasks => ({
      type: Actions.TASKS_UPDATED,
      payload: {
        taskRunnerId: taskRunner.id,
        tasks,
      },
    });
    const unregistrationEvents = actions.filter(a => (
      a.type === Actions.UNREGISTER_TASK_RUNNER && a.payload.id === taskRunner.id
    ));
    return observableFromSubscribeFunction(taskRunner.observeTasks.bind(taskRunner))
      .map(tasksToAction)
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
      if (store.getState().taskStatus != null) { return Observable.empty(); }

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

          const task = getTask(taskToRun, state.tasks);
          invariant(task != null);

          if (!task.enabled) {
            return Observable.empty();
          }

          return createTaskObservable(activeTaskRunner, task, () => store.getState())
            // Stop listening once the task is done.
            .takeUntil(
              actions.ofType(Actions.TASK_COMPLETED, Actions.TASK_ERRORED, Actions.TASK_STOPPED)
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
      const {taskStatus} = store.getState();
      const taskInfo = taskStatus == null ? null : taskStatus.info;
      if (taskInfo == null) { return Observable.empty(); }
      taskInfo.cancel();
      return Observable.of({
        type: Actions.TASK_STOPPED,
        payload: {taskInfo},
      });
    });
}

export function toggleToolbarVisibilityEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.TOGGLE_TOOLBAR_VISIBILITY)
    .map(action => Actions.setToolbarVisibility(!store.getState().visible));
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(
  taskRunner: TaskRunner,
  task: Task,
  getState: () => AppState,
): Observable<Action> {
  let finished;
  // $FlowFixMe(matthewwithanm): Type this.
  return Observable.using(
    () => {
      let taskInfo = taskRunner.runTask(task.type);
      // We may call cancel multiple times so let's make sure it's idempotent.
      taskInfo = {...taskInfo, cancel: once(taskInfo.cancel)};
      finished = false;
      return {
        taskInfo,
        unsubscribe() {
          if (!finished) {
            taskInfo.cancel();
          }
        },
      };
    },
    ({taskInfo}) => Observable.of(taskInfo),
  )
    .switchMap(taskInfo => {
      const progressStream = taskInfo.observeProgress == null
        ? Observable.empty()
        : observableFromSubscribeFunction(
            taskInfo.observeProgress.bind(taskInfo),
          );

      return Observable
        .of({
          type: Actions.TASK_STARTED,
          payload: {taskInfo},
        })
        .concat(
          progressStream.map(progress => ({
            type: Actions.TASK_PROGRESS,
            payload: {progress},
          }))
        )
        .merge(
          observableFromSubscribeFunction(taskInfo.onDidError.bind(taskInfo))
            .map(err => { throw err; })
        )
        .takeUntil(
          observableFromSubscribeFunction(taskInfo.onDidComplete.bind(taskInfo))
        )
        .concat(Observable.of({
          type: Actions.TASK_COMPLETED,
          payload: {taskInfo},
        }));
    })
    .catch(error => {
      atom.notifications.addError(
        `The task "${task.label}" failed`,
        {
          description: error.message,
          dismissable: true,
        },
      );
      const {taskStatus} = getState();
      return Observable.of({
        type: Actions.TASK_ERRORED,
        payload: {
          error,
          taskInfo: taskStatus == null ? null : taskStatus.info,
        },
      });
    })
    .finally(() => {
      finished = true;
    })
    .share();
}

function taskIdsAreEqual(a: ?TaskId, b: ?TaskId): boolean {
  if (a == null || b == null) { return false; }
  return a.type === b.type && a.taskRunnerId === b.taskRunnerId;
}
