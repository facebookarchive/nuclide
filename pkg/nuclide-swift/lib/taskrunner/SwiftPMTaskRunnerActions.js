'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {keyMirror} from '../../../commons-node/collection';
import {Dispatcher} from 'flux';

export default class SwiftPMTaskRunnerActions {
  _dispatcher: Dispatcher;

  static ActionType = Object.freeze(keyMirror({
    UPDATE_CHDIR: null,
    UPDATE_BUILD_SETTINGS: null,
    UPDATE_TEST_SETTINGS: null,
    UPDATE_COMPILE_COMMANDS: null,
  }));

  constructor(dispatcher: Dispatcher) {
    this._dispatcher = dispatcher;
  }

  updateChdir(chdir: string): void {
    this._dispatcher.dispatch({
      actionType: SwiftPMTaskRunnerActions.ActionType.UPDATE_CHDIR,
      chdir,
    });
  }

  updateBuildSettings(
    configuration: string,
    Xcc: string,
    Xlinker: string,
    Xswiftc: string,
    buildPath: string,
  ): void {
    this._dispatcher.dispatch({
      actionType: SwiftPMTaskRunnerActions.ActionType.UPDATE_BUILD_SETTINGS,
      configuration,
      Xcc,
      Xlinker,
      Xswiftc,
      buildPath,
    });
  }

  updateTestSettings(buildPath: string): void {
    this._dispatcher.dispatch({
      actionType: SwiftPMTaskRunnerActions.ActionType.UPDATE_TEST_SETTINGS,
      buildPath,
    });
  }
}
