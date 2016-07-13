'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState, BuildSystem, IconButtonOption, Store, Task} from '../types';
import type {ActionsObservable} from '../../../commons-node/redux-observable';

import {observableFromSubscribeFunction} from '../../../commons-node/event';
import once from '../../../commons-node/once';
import {bindObservableAsProps} from '../../../nuclide-ui/lib/bindObservableAsProps';
import {BuildToolbar} from '../ui/BuildToolbar';
import {getActiveBuildSystem} from '../getActiveBuildSystem';
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
        runTask: taskType => { store.dispatch(Actions.runTask(taskType)); },
        selectBuildSystem: id => { store.dispatch(Actions.selectBuildSystem(id)); },
        selectTask: taskType => { store.dispatch(Actions.selectTask(taskType)); },
        stopTask: () => { store.dispatch(Actions.stopTask()); },
        getActiveBuildSystemIcon: () => {
          const activeBuildSystem = getActiveBuildSystem(store.getState());
          return activeBuildSystem && activeBuildSystem.getIcon();
        },
      };

      const props = Observable.from(store)
        .map(state => {
          const activeBuildSystem = getActiveBuildSystem(state);
          return {
            ...staticProps,
            getExtraUi: activeBuildSystem != null && activeBuildSystem.getExtraUi != null
              ? activeBuildSystem.getExtraUi.bind(activeBuildSystem)
              : null,
            buildSystemOptions: getBuildSystemOptions(state),
            activeBuildSystemId: activeBuildSystem && activeBuildSystem.id,
            progress: state.taskStatus && state.taskStatus.progress,
            visible: state.visible,
            activeTaskType: state.activeTaskType,
            taskIsRunning: state.taskStatus != null,
            tasks: state.tasks,
          };
        });

      const StatefulBuildToolbar = bindObservableAsProps(props, BuildToolbar);
      const container = document.createElement('div');
      // $FlowIssue: bindObservableAsProps doesn't handle props exactly right.
      ReactDOM.render(<StatefulBuildToolbar />, container);
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

/**
 * Update the tasks to match the active build system.
 */
export function refreshTasksEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.REFRESH_TASKS)
    .switchMap(action => (
      // Only update the tasks if the toolbar is visible. Otherwise, they'll be updated when it
      // becomes visible later. This prevents us from doing unnecessary work.
      store.getState().visible ? Observable.of(Actions.updateTasks()) : Observable.empty()
    ));
}

export function runTaskEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.RUN_TASK)
    .switchMap(action => {
      invariant(action.type === Actions.RUN_TASK);
      const taskType = action.payload.taskType || store.getState().activeTaskType;

      // Don't do anything if there's no active task.
      if (taskType == null) { return Observable.empty(); }

      // Don't do anything if a task is already running.
      if (store.getState().taskStatus != null) { return Observable.empty(); }

      return Observable.concat(
        store.getState().activeTaskType === taskType
          ? Observable.empty()
          : Observable.of(Actions.selectTask(taskType)),
        Observable.defer(() => {
          const state = store.getState();
          const activeBuildSystem = getActiveBuildSystem(state);

          if (activeBuildSystem == null) {
            return Observable.empty();
          }

          const task = state.tasks.find(t => t.type === taskType);
          invariant(task != null);

          if (!task.enabled) {
            return Observable.empty();
          }

          return createTaskObservable(activeBuildSystem, task, () => store.getState())
            // Stop listening once the task is done.
            .takeUntil(
              actions.ofType(Actions.TASK_COMPLETED, Actions.TASK_ERRORED, Actions.TASK_STOPPED)
            );
        }),
      );
    });
}

export function setToolbarVisibilityEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.SET_TOOLBAR_VISIBILITY)
    .switchMap(action => {
      invariant(action.type === Actions.SET_TOOLBAR_VISIBILITY);
      const {visible} = action.payload;
      const visibilityUpdatedAction = {
        type: Actions.TOOLBAR_VISIBILITY_UPDATED,
        payload: {visible},
      };

      // When the toolbar becomes visible, update the task list too.
      return visible && !store.getState().visible
        ? Observable.of(visibilityUpdatedAction, Actions.updateTasks())
        : Observable.of(visibilityUpdatedAction);
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

export function updateTasksEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(Actions.UPDATE_TASKS)
    .switchMap(action => {
      const activeBuildSystem = getActiveBuildSystem(store.getState());
      const tasksToAction = tasks => ({
        type: Actions.TASKS_UPDATED,
        payload: {tasks},
      });
      const noTasks = Observable.of(tasksToAction([]));
      return activeBuildSystem == null
        ? noTasks
        : noTasks.concat(
            observableFromSubscribeFunction(
              activeBuildSystem.observeTasks.bind(activeBuildSystem)
            )
            .map(tasksToAction)
          );
    });
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(
  buildSystem: BuildSystem,
  task: Task,
  getState: () => AppState,
): Observable<Action> {
  let finished;
  // $FlowFixMe(matthewwithanm): Type this.
  return Observable.using(
    () => {
      let taskInfo = buildSystem.runTask(task.type);
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

function getBuildSystemOptions(state: AppState): Array<IconButtonOption> {
  // TODO: Sort alphabetically?
  return Array.from(state.buildSystems.values())
    .map(buildSystem => ({
      value: buildSystem.id,
      label: buildSystem.name,
    }));
}
