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
class BreakpointDisableCommand {
  constructor(con, debug) {
    this.name = 'disable';
    this.helpText = "[index | 'all']: temporarily disables a breakpoint, or all breakpoints. With no arguments, disables the current breakpoint.";
    this._console = con;
    this._debugger = debug;
  }

  async execute(args) {
    const bpt = (0, _BreakpointCommandUtils().breakpointFromArgList)(this._debugger, args, this.name);

    if (bpt == null) {
      await this._debugger.setAllBreakpointsEnabled(false);

      this._console.outputLine('All breakpoins disabled.');

      return;
    }

    await this._debugger.setBreakpointEnabled(bpt, false);

    this._console.outputLine(`Breakpoint #${bpt.index} disabled.`);
  }

}

exports.default = BreakpointDisableCommand;