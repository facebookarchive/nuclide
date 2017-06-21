'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


/**
 * Bridge between Nuclide IPC and RPC debugger settings protocols.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class DebuggerSettingsManager {

  constructor(debuggerDispatcher) {
    this._debuggerDispatcher = debuggerDispatcher;
    this._settings = { singleThreadStepping: false };
  }

  setSingleThreadStepping(enable) {
    this._settings.singleThreadStepping = enable;
  }

  syncToEngine() {
    this._debuggerDispatcher.setDebuggerSettings(this._settings);
  }
}
exports.default = DebuggerSettingsManager;