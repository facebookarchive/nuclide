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
class ShowCapsCommand {
  constructor(console, debug) {
    this.name = 'adapter';
    this.helpText = 'Display inforrmation about the debug adapter.';
    this._console = console;
    this._debugger = debug;
  }

  async execute() {
    const caps = this._debugger.adapterCaps();

    Object.keys(caps).sort().forEach(cap => this._console.outputLine(`${cap} - ${JSON.stringify(caps[cap])}`));
  }

}

exports.default = ShowCapsCommand;