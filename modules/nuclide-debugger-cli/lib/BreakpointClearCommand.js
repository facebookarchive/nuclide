"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _BreakpointCommandUtils() {
  const data = require("./BreakpointCommandUtils");

  _BreakpointCommandUtils = function () {
    return data;
  };

  return data;
}

function _TokenizedLine() {
  const data = _interopRequireDefault(require("./TokenizedLine"));

  _TokenizedLine = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class BreakpointClearCommand {
  constructor(con, debug) {
    this.name = 'clear';
    this.helpText = "[index | 'all']: permanently deletes a breakpoint, or all breakpoints. With no arguments, deletes the current breakpoint.";
    this._console = con;
    this._debugger = debug;
  }

  async execute(line) {
    const args = line.stringTokens().slice(1);
    const bpt = (0, _BreakpointCommandUtils().breakpointFromArgList)(this._debugger, args, this.name);

    if (bpt == null) {
      await this._debugger.deleteAllBreakpoints();

      this._console.outputLine('All breakpoins cleared.');

      return;
    }

    await this._debugger.deleteBreakpoint(bpt);

    this._console.outputLine(`Breakpoint #${bpt.index} cleared.`);
  }

}

exports.default = BreakpointClearCommand;