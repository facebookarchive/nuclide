'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Dispatcher} = require('flux');

class BuckToolbarActions {

  _dispatcher: Dispatcher;

  static ActionType: {[key:string]: string};

  constructor(dispatcher: Dispatcher) {
    this._dispatcher = dispatcher;
  }

  togglePanelVisibility(): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.TOGGLE_PANEL_VISIBILITY,
    });
  }

  updateIsPanelVisible(isPanelVisible: boolean): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_PANEL_VISIBILITY,
      isPanelVisible,
    });
  }

  updateProjectFor(editor: TextEditor): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_PROJECT,
      editor,
    });
  }

  updateBuildTarget(buildTarget: string): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_BUILD_TARGET,
      buildTarget,
    });
  }

  updateSimulator(simulator: string): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_SIMULATOR,
      simulator,
    });
  }

  updateReactNativeServerMode(serverMode: boolean): void {
    this._dispatcher.dispatch({
      actionType: BuckToolbarActions.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE,
      serverMode,
    });
  }

  build(): void {
    this._dispatcher.dispatch({actionType: BuckToolbarActions.ActionType.BUILD});
  }

  run(): void {
    this._dispatcher.dispatch({actionType: BuckToolbarActions.ActionType.RUN});
  }

  debug(): void {
    this._dispatcher.dispatch({actionType: BuckToolbarActions.ActionType.DEBUG});
  }
}

BuckToolbarActions.ActionType = {
  BUILD: 'BUILD',
  DEBUG: 'DEBUG',
  RUN: 'RUN',
  TOGGLE_PANEL_VISIBILITY: 'TOGGLE_PANEL_VISIBILITY',
  UPDATE_BUILD_TARGET: 'UPDATE_BUILD_TARGET',
  UPDATE_PANEL_VISIBILITY: 'UPDATE_PANEL_VISIBILITY',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  UPDATE_REACT_NATIVE_SERVER_MODE: 'UPDATE_REACT_NATIVE_SERVER_MODE',
  UPDATE_SIMULATOR: 'UPDATE_SIMULATOR',
};

module.exports = BuckToolbarActions;
