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
  BuildSystem,
  BuildSystemRegistry,
  SerializedAppState,
  Store,
  TaskStartedAction,
  TaskStoppedAction,
  TaskCompletedAction,
  TaskErroredAction,
} from './types';
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
        'nuclide-build:toggle-toolbar-visibility': event => {
          const visible = event.detail == null ? undefined : event.detail.visible;
          if (typeof visible === 'boolean') {
            this._actionCreators.setToolbarVisibility(visible);
          } else {
            this._actionCreators.toggleToolbarVisibility();
          }
        },
      }),

      // Update the Atom palette commands to match our currently enabled tasks.
      syncAtomCommands(
        states
          .debounceTime(500)
          .map(state => state.tasks)
          .distinctUntilChanged()
          .map(tasks => new Set(tasks.filter(task => task.enabled).map(task => task.type))),
        taskType => ({
          'atom-workspace': {
            [`nuclide-build:${taskType}`]: () => { this._actionCreators.runTask(taskType); },
          },
        }),
      ),

      // Add Atom palette commands for selecting the build system.
      syncAtomCommands(
        states
          .debounceTime(500)
          .map(state => state.buildSystems)
          .distinctUntilChanged()
          .map(buildSystems => new Set(buildSystems.values())),
        buildSystem => ({
          'atom-workspace': {
            [`nuclide-build:select-${buildSystem.name}-build-system`]: () => {
              this._actionCreators.selectBuildSystem(buildSystem.id);
            },
          },
        }),
      ),

      // Update the tasks whenever the build system changes. This is a little weird because state
      // changes are triggering commands that trigger state changes. Maybe there's a better place to
      // do this?
      new DisposableSubscription(
        states.map(state => state.activeBuildSystemId)
          .distinctUntilChanged()
          .subscribe(() => { this._actionCreators.refreshTasks(); })
      ),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeToolBar(getToolBar: GetToolBar): IDisposable {
    const toolBar = getToolBar('nuclide-build');
    const {element} = toolBar.addButton({
      callback: 'nuclide-build:toggle-toolbar-visibility',
      tooltip: 'Toggle Build Toolbar',
      iconset: 'ion',
      icon: 'hammer',
      priority: 499.5,
    });
    element.className += ' nuclide-build-tool-bar-button';

    const buttonUpdatesDisposable = new DisposableSubscription(
      // $FlowFixMe: Update rx defs to accept ish with Symbol.observable
      Observable.from(this._store).subscribe(state => {
        if (state.buildSystems.size > 0) {
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

  provideBuildSystemRegistry(): BuildSystemRegistry {
    let pkg = this; // eslint-disable-line consistent-this
    this._disposables.add(new Disposable(() => { pkg = null; }));
    return {
      register: (buildSystem: BuildSystem) => {
        invariant(pkg != null, 'Build system registry used after deactivation');
        pkg._actionCreators.registerBuildSystem(buildSystem);
        return new Disposable(() => {
          if (pkg != null) {
            pkg._actionCreators.unregisterBuildSystem(buildSystem);
          }
        });
      },
    };
  }

  serialize(): SerializedAppState {
    const state = this._store.getState();
    return {
      previousSessionActiveBuildSystemId:
        state.activeBuildSystemId || state.previousSessionActiveBuildSystemId,
      previousSessionActiveTaskType:
        state.activeTaskType || state.previousSessionActiveTaskType,
      visible: state.visible,
    };
  }

  getDistractionFreeModeProvider(): DistractionFreeModeProvider {
    let pkg = this; // eslint-disable-line consistent-this
    this._disposables.add(new Disposable(() => { pkg = null; }));
    return {
      name: 'nuclide-build',
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

function trackBuildAction(
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
      buildSystemId: state.activeBuildSystemId,
      taskType: state.activeTaskType,
      errorMessage: error != null ? error.message : null,
      stackTrace: error != null ? String(error.stack) : null,
    },
  });
}

const trackingMiddleware = store => next => action => {
  switch (action.type) {
    case Actions.TASK_STARTED:
      trackBuildAction('nuclide-build:task-started', action, store.getState());
      break;
    case Actions.TASK_STOPPED:
      trackBuildAction('nuclide-build:task-stopped', action, store.getState());
      break;
    case Actions.TASK_COMPLETED:
      trackBuildAction('nuclide-build:task-completed', action, store.getState());
      break;
    case Actions.TASK_ERRORED:
      trackBuildAction('nuclide-build:task-errored', action, store.getState());
      break;
  }
  return next(action);
};
