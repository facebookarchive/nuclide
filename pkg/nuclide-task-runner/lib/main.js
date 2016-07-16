'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GetToolBar} from '../../commons-atom/suda-tool-bar';
import type {
  AppState,
  BoundActionCreators,
  TaskRunnerServiceApi,
  SerializedAppState,
  Store,
  TaskStartedAction,
  TaskStoppedAction,
  TaskCompletedAction,
  TaskErroredAction,
  TaskRunner,
} from './types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';

import syncAtomCommands from '../../commons-atom/sync-atom-commands';
import createPackage from '../../commons-atom/createPackage';
import {combineEpics, createEpicMiddleware} from '../../commons-node/redux-observable';
import {DisposableSubscription} from '../../commons-node/stream';
import {trackEvent} from '../../nuclide-analytics';
import {createEmptyAppState} from './createEmptyAppState';
import * as Actions from './redux/Actions';
import * as Epics from './redux/Epics';
import * as Reducers from './redux/Reducers';
import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import {applyMiddleware, bindActionCreators, createStore} from 'redux';
import {Observable} from 'rxjs';

class Activation {
  _disposables: CompositeDisposable;
  _actionCreators: BoundActionCreators;
  _store: Store;

  constructor(rawState: ?SerializedAppState): void {
    const initialState = {
      ...createEmptyAppState(),
      ...(rawState || {}),
    };

    const epics = Object.keys(Epics)
      .map(k => Epics[k])
      .filter(epic => typeof epic === 'function');
    const rootEpic = combineEpics(...epics);
    this._store = createStore(
      Reducers.app,
      initialState,
      applyMiddleware(createEpicMiddleware(rootEpic), trackingMiddleware),
    );
    const states = Observable.from(this._store);
    this._actionCreators = bindActionCreators(Actions, this._store.dispatch);

    // Add the panel.
    // TODO: Defer this. We can subscribe to store and do this the first time visible === true
    this._actionCreators.createPanel(this._store);

    this._disposables = new CompositeDisposable(
      new Disposable(() => { this._actionCreators.destroyPanel(); }),
      atom.commands.add('atom-workspace', {
        'nuclide-task-runner:toggle-toolbar-visibility': event => {
          const visible = event.detail == null ? undefined : event.detail.visible;
          if (typeof visible === 'boolean') {
            this._actionCreators.setToolbarVisibility(visible);
          } else {
            this._actionCreators.toggleToolbarVisibility();
          }
        },
        'nuclide-task-runner:run-selected-task': event => {
          const detail = event != null ? (event: any).detail : null;
          const taskId = detail != null && detail.taskRunnerId && detail.type ? detail : null;
          this._actionCreators.runTask(taskId);
        },
      }),

      // Add a command for each task type. If there's more than one of the same type enabled, the
      // first is used.
      // TODO: Instead, prompt user for which to use and remember their choice.
      syncAtomCommands(
        states
          .debounceTime(500)
          .map(state => state.tasks)
          .distinctUntilChanged()
          .map(tasks => {
            const allTasks = Array.prototype.concat(...Array.from(tasks.values()));
            const tasksByType = new Map();
            allTasks.forEach(task => {
              if (task.type && task.enabled && !tasksByType.has(task.type)) {
                tasksByType.set(task.type, task);
              }
            });
            return new Set(tasksByType.values());
          }),
        task => ({
          'atom-workspace': {
            [`nuclide-task-runner:${task.type}`]: () => { this._actionCreators.runTask(task); },
          },
        }),
        task => `${task.taskRunnerId}:${task.type}`,
      ),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeCurrentWorkingDirectory(api: CwdApi): void {
    this._disposables.add(api.observeCwd(directory => {
      this._actionCreators.setProjectRoot(directory);
    }));
  }

  consumeToolBar(getToolBar: GetToolBar): IDisposable {
    const toolBar = getToolBar('nuclide-task-runner');
    const {element} = toolBar.addButton({
      callback: 'nuclide-task-runner:toggle-toolbar-visibility',
      tooltip: 'Toggle Task Runner Toolbar',
      iconset: 'ion',
      icon: 'play',
      priority: 499.5,
    });
    element.className += ' nuclide-task-runner-tool-bar-button';

    const buttonUpdatesDisposable = new DisposableSubscription(
      // $FlowFixMe: Update rx defs to accept ish with Symbol.observable
      Observable.from(this._store).subscribe(state => {
        if (state.taskRunners.size > 0) {
          element.removeAttribute('hidden');
        } else {
          element.setAttribute('hidden', 'hidden');
        }
      })
    );

    // Remove the button from the toolbar.
    const buttonPresenceDisposable = new Disposable(() => { toolBar.removeItems(); });

    // If this package is disabled, stop updating the button and remove it from the toolbar.
    this._disposables.add(
      buttonUpdatesDisposable,
      buttonPresenceDisposable,
    );

    // If tool-bar is disabled, stop updating the button state and remove tool-bar related cleanup
    // from this package's disposal actions.
    return new Disposable(() => {
      buttonUpdatesDisposable.dispose();
      this._disposables.remove(buttonUpdatesDisposable);
      this._disposables.remove(buttonPresenceDisposable);
    });
  }

  provideTaskRunnerServiceApi(): TaskRunnerServiceApi {
    let pkg = this; // eslint-disable-line consistent-this
    this._disposables.add(new Disposable(() => { pkg = null; }));
    return {
      register: (taskRunner: TaskRunner) => {
        invariant(pkg != null, 'Task runner service API used after deactivation');
        pkg._actionCreators.registerTaskRunner(taskRunner);
        return new Disposable(() => {
          if (pkg != null) {
            pkg._actionCreators.unregisterTaskRunner(taskRunner);
          }
        });
      },
    };
  }

  serialize(): SerializedAppState {
    const state = this._store.getState();
    return {
      previousSessionActiveTaskId: state.activeTaskId || state.previousSessionActiveTaskId,
      visible: state.visible,
    };
  }

  getDistractionFreeModeProvider(): DistractionFreeModeProvider {
    let pkg = this; // eslint-disable-line consistent-this
    this._disposables.add(new Disposable(() => { pkg = null; }));
    return {
      name: 'nuclide-task-runner',
      isVisible() {
        invariant(pkg != null);
        return pkg._store.getState().visible;
      },
      toggle() {
        invariant(pkg != null);
        pkg._actionCreators.toggleToolbarVisibility();
      },
    };
  }

  // Exported for testing :'(
  _getCommands() {
    return this._actionCreators;
  }

}

export default createPackage(Activation);

function trackTaskAction(
  type: string,
  action: TaskStartedAction | TaskStoppedAction | TaskCompletedAction | TaskErroredAction,
  state: AppState,
): void {
  const taskInfo = action.payload.taskInfo;
  const taskTrackingData = taskInfo != null && taskInfo.getTrackingData != null
    ? taskInfo.getTrackingData()
    : {};
  const error = action.type === Actions.TASK_ERRORED ? action.payload.error : null;
  trackEvent({
    type,
    data: {
      ...taskTrackingData,
      taskRunnerId: state.activeTaskId && state.activeTaskId.taskRunnerId,
      taskType: state.activeTaskId && state.activeTaskId.type,
      errorMessage: error != null ? error.message : null,
      stackTrace: error != null ? String(error.stack) : null,
    },
  });
}

const trackingMiddleware = store => next => action => {
  switch (action.type) {
    case Actions.TASK_STARTED:
      trackTaskAction('nuclide-task-runner:task-started', action, store.getState());
      break;
    case Actions.TASK_STOPPED:
      trackTaskAction('nuclide-task-runner:task-stopped', action, store.getState());
      break;
    case Actions.TASK_COMPLETED:
      trackTaskAction('nuclide-task-runner:task-completed', action, store.getState());
      break;
    case Actions.TASK_ERRORED:
      trackTaskAction('nuclide-task-runner:task-errored', action, store.getState());
      break;
  }
  return next(action);
};
