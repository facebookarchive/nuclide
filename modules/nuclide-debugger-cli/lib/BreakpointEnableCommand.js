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
class BreakpointEnableCommand {
  constructor(con, debug) {
    this.name = 'enable';
    this.helpText = "[index | 'all']: enables a breakpoint, or all breakpoints. With no arguments, enables the current breakpoint.";
    this._debugger = debug;
  }

  async execute(line) {
    const bpt = (0, _BreakpointCommandUtils().breakpointFromArgList)(this._debugger, line.stringTokens().slice(1), this.name);

    if (bpt == null) {
      await this._debugger.setAllBreakpointsEnabled(true);

      this._console.outputLine('All breakpoins enabled.');

      return;
    }

    await this._debugger.setBreakpointEnabled(bpt, true);

    this._console.outputLine(`Breakpoint #${bpt.index} enabled.`);
  }

}

exports.default = BreakpointEnableCommand;