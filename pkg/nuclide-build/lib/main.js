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
import {compact, DisposableSubscription} from '../../commons-node/stream';
import {trackEvent} from '../../nuclide-analytics';
import * as ActionTypes from './ActionTypes';
import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';

let disposables: ?CompositeDisposable = null;
let _commands: ?CommandsType = null;
let _states: ?BehaviorSubject<AppState> = null;

export function activate(rawState: ?SerializedAppState): void {
  invariant(disposables == null);
  invariant(_commands == null);

  const {applyActionMiddleware} = require('./applyActionMiddleware');
  const {Commands} = require('./Commands');
  const {createStateStream} = require('./createStateStream');
  const {createEmptyAppState} = require('./createEmptyAppState');
  const Rx = require('rxjs');

  const initialState = {
    ...createEmptyAppState(),
    ...(rawState || {}),
  };

  const rawActions = new Rx.Subject();
  const actions = applyActionMiddleware(rawActions, () => states.getValue());
  const states = _states = createStateStream(actions, initialState);
  const dispatch = action => { rawActions.next(action); };
  const commands = _commands = new Commands(dispatch, () => states.getValue());

  // Add the panel.
  commands.createPanel(states);

  disposables = new CompositeDisposable(
    new Disposable(() => { commands.destroyPanel(); }),
    new Disposable(() => {
      _commands = null;
      _states = null;
    }),
    atom.commands.add('atom-workspace', {
      'nuclide-build:toggle-toolbar-visibility': () => { commands.toggleToolbarVisibility(); },
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
          [`nuclide-build:${taskType}`]: () => { commands.runTask(taskType); },
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
            commands.selectBuildSystem(buildSystem.id);
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
              return createTrackingEvent('nuclide-build:task-started', action, states.getValue());
            case ActionTypes.TASK_STOPPED:
              return createTrackingEvent('nuclide-build:task-stopped', action, states.getValue());
            case ActionTypes.TASK_COMPLETED:
              return createTrackingEvent('nuclide-build:task-completed', action, states.getValue());
            case ActionTypes.TASK_ERRORED:
              return createTrackingEvent('nuclide-build:task-errored', action, states.getValue());
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
      states.map(state => state.activeBuildSystemId)
        .distinctUntilChanged()
        .subscribe(() => { commands.refreshTasks(); })
    ),
  );
}

export function deactivate(): void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}

export function consumeToolBar(getToolBar: GetToolBar): IDisposable {
  invariant(disposables != null);
  const toolBar = getToolBar('nuclide-build');
  const {element} = toolBar.addButton({
    callback: 'nuclide-build:toggle-toolbar-visibility',
    tooltip: 'Toggle Build Toolbar',
    iconset: 'ion',
    icon: 'hammer',
    priority: 499.5,
  });
  element.className += ' nuclide-build-tool-bar-button';

  invariant(_states != null);

  const buttonUpdatesDisposable = new DisposableSubscription(
    _states.subscribe(state => {
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
  disposables.add(
    buttonUpdatesDisposable,
    buttonPresenceDisposable,
  );

  // If tool-bar is disabled, stop updating the button state and remove tool-bar related cleanup
  // from this package's disposal actions.
  return new Disposable(() => {
    buttonUpdatesDisposable.dispose();
    if (disposables != null) {
      disposables.remove(buttonUpdatesDisposable);
      disposables.remove(buttonPresenceDisposable);
    }
  });
}

export function provideBuildSystemRegistry(): BuildSystemRegistry {
  return {
    register(buildSystem: BuildSystem): IDisposable {
      if (_commands != null) {
        _commands.registerBuildSystem(buildSystem);
      }
      return new Disposable(() => {
        if (_commands != null) {
          _commands.unregisterBuildSystem(buildSystem);
        }
      });
    },
  };
}

export function serialize(): SerializedAppState {
  invariant(_states != null);
  const state = _states.getValue();
  return {
    previousSessionActiveBuildSystemId:
      state.activeBuildSystemId || state.previousSessionActiveBuildSystemId,
    previousSessionActiveTaskType:
      state.activeTaskType || state.previousSessionActiveTaskType,
    visible: state.visible,
  };
}

export function getDistractionFreeModeProvider(): DistractionFreeModeProvider {
  return {
    name: 'nuclide-build',
    isVisible: () => (invariant(_states != null), _states.getValue().visible),
    toggle: () => {
      invariant(_commands != null);
      _commands.toggleToolbarVisibility();
    },
  };
}

// Exported for testing :'(
export const _getCommands = () => _commands;

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
