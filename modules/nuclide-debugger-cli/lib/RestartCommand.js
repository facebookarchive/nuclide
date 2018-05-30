'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DebuggerInterface;

function _load_DebuggerInterface() {
  return _DebuggerInterface = require('./DebuggerInterface');
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

class RestartCommand {

  constructor(debug) {
    this.name = 'restart';
    this.helpText = 'Restart the current target.';

    this._debugger = debug;
  }

  async execute() {
    return this._debugger.relaunch();
  }
}
exports.default = RestartCommand;