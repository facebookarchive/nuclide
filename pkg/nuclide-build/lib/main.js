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
import type {Commands as CommandsType} from './Commands';
import type {
  AppState,
  BuildSystem,
  BuildSystemRegistry,
  SerializedAppState,
  TaskStartedAction,
  TaskStoppedAction,
  TaskCompletedAction,
  TaskErroredAction,
} from './types';
import type {BehaviorSubject} from 'rxjs';
import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';
import type {TrackingEvent} from '../../nuclide-analytics';

import syncAtomCommands from '../../commons-atom/sync-atom-commands';
import createPackage from '../../commons-atom/createPackage';
import {compact, DisposableSubscription} from '../../commons-node/stream';
import {trackEvent} from '../../nuclide-analytics';
import * as ActionTypes from './ActionTypes';
import {applyActionMiddleware} from './applyActionMiddleware';
import {Commands} from './Commands';
import {createStateStream} from './createStateStream';
import {createEmptyAppState} from './createEmptyAppState';
import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import Rx from 'rxjs';

class Activation {
  _disposables: CompositeDisposable;
  _commands: CommandsType;
  _states: BehaviorSubject<AppState>;

  constructor(rawState: ?SerializedAppState): void {
    const initialState = {
      ...createEmptyAppState(),
      ...(rawState || {}),
    };

    const rawActions = new Rx.Subject();
    const actions = applyActionMiddleware(rawActions, () => this._states.getValue());
    this._states = createStateStream(actions, initialState);
    const dispatch = action => { rawActions.next(action); };
    this._commands = new Commands(dispatch, () => this._states.getValue());

    // Add the panel.
    this._commands.createPanel(this._states);

    this._disposables = new CompositeDisposable(
      new Disposable(() => { this._commands.destroyPanel(); }),
      atom.commands.add('atom-workspace', {
        'nuclide-build:toggle-toolbar-visibility': event => {
          const visible = event.detail == null ? undefined : event.detail.visible;
          if (typeof visible === 'boolean') {
            this._commands.setToolbarVisibility(visible);
          } else {
            this._commands.toggleToolbarVisibility();
          }
        },
      }),

      // Update the Atom palette commands to match our currently enabled tasks.
      syncAtomCommands(
        this._states
          .debounceTime(500)
          .map(state => state.tasks)
          .distinctUntilChanged()
          .map(tasks => new Set(tasks.filter(task => task.enabled).map(task => task.type))),
        taskType => ({
          'atom-workspace': {
            [`nuclide-build:${taskType}`]: () => { this._commands.runTask(taskType); },
          },
        }),
      ),

      // Add Atom palette commands for selecting the build system.
      syncAtomCommands(
        this._states
          .debounceTime(500)
          .map(state => state.buildSystems)
          .distinctUntilChanged()
          .map(buildSystems => new Set(buildSystems.values())),
        buildSystem => ({
          'atom-workspace': {
            [`nuclide-build:select-${buildSystem.name}-build-system`]: () => {
              this._commands.selectBuildSystem(buildSystem.id);
            },
          },
        }),
      ),

      // Track Build events.
      new DisposableSubscription(
        compact(
          actions.map(action => {
            switch (action.type) {
              case ActionTypes.TASK_STARTED:
                return createTrackingEvent(
                  'nuclide-build:task-started',
                  action,
                  this._states.getValue(),
                );
              case ActionTypes.TASK_STOPPED:
                return createTrackingEvent(
                  'nuclide-build:task-stopped',
                  action,
                  this._states.getValue(),
                );
              case ActionTypes.TASK_COMPLETED:
                return createTrackingEvent(
                  'nuclide-build:task-completed',
                  action,
                  this._states.getValue(),
                );
              case ActionTypes.TASK_ERRORED:
                return createTrackingEvent(
                  'nuclide-build:task-errored',
                  action,
                  this._states.getValue(),
                );
              default:
                return null;
            }
          })
        )
          .subscribe(event => { trackEvent(event); })
      ),

      // Update the actions whenever the build system changes. This is a little weird because state
      // changes are triggering commands that trigger state changes. Maybe there's a better place to
      // do this?
      new DisposableSubscription(
        this._states.map(state => state.activeBuildSystemId)
          .distinctUntilChanged()
          .subscribe(() => { this._commands.refreshTasks(); })
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
      this._states.subscribe(state => {
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
        pkg._commands.registerBuildSystem(buildSystem);
        return new Disposable(() => {
          if (pkg != null) {
            pkg._commands.unregisterBuildSystem(buildSystem);
          }
        });
      },
    };
  }

  serialize(): SerializedAppState {
    const state = this._states.getValue();
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
        return pkg._states.getValue().visible;
      },
      toggle() {
        invariant(pkg != null);
        pkg._commands.toggleToolbarVisibility();
      },
    };
  }

  // Exported for testing :'(
  _getCommands() {
    return this._commands;
  }

}

export default createPackage(Activation);

function createTrackingEvent(
  type: string,
  action: TaskStartedAction | TaskStoppedAction | TaskCompletedAction | TaskErroredAction,
  state: AppState,
): TrackingEvent {
  const taskInfo = action.payload.taskInfo;
  const taskTrackingData = taskInfo != null && taskInfo.getTrackingData != null
    ? taskInfo.getTrackingData()
    : {};
  const error = action.type === ActionTypes.TASK_ERRORED ? action.payload.error : null;
  return {
    type,
    data: {
      ...taskTrackingData,
      buildSystemId: state.activeBuildSystemId,
      taskType: state.activeTaskType,
      errorMessage: error != null ? error.message : null,
      stackTrace: error != null ? String(error.stack) : null,
    },
  };
}
