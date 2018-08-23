"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _DebuggerInterface() {
  const data = require("./DebuggerInterface");

  _DebuggerInterface = function () {
    return data;
  };

  return data;
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
class RunCommand {
  constructor(debug) {
    this.name = 'run';
    this.helpText = 'Start or restart execution of the target.';
    this.detailedHelpText = `
run

If the target has been loaded but not yet executed, begins execution.

If the target is already running, reloads the target to start executing from
the start of the program again, and stops at the debugger prompt to allow
breakpoints to be set.
  `;
    this._debugger = debug;
  }

  async execute() {
    return this._debugger.run();
  }

}

exports.default = RunCommand;