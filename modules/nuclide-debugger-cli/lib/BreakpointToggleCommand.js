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
class BreakpointToggleCommand {
  constructor(con, debug) {
    this.name = 'toggle';
    this.helpText = "[index | 'all']: toggles a breakpoint, or all breakpoints. With no arguments, toggles the current breakpoint.";
    this.detailedHelpText = `
    [index | 'all']: toggles a breakpoint, or all breakpoints. With no arguments,
    toggles the current breakpoint.

    The effect of this command depends on the debug adapter in use. If the adapter
    does not support one-shot breakpoints, then toggle will toggle the breakpoint
    state between disabled and enabled.

    If the adapter DOES support one-shot breakpoints, then there is a third
    state called 'once' which means the breakpoint will fire exactly once and
    then be automatically disabled. toggle will move breakpoints through the
    cycle

      enabled => once => disabled

    You can also set a one-shot breakpoint by specifying the keyword 'once'
    before the breakpoint specification in the breakpoint command; i.e.

    breakpoint once main()
  `;
    this._console = con;
    this._debugger = debug;
  }

  async execute(line) {
    const args = line.stringTokens().slice(1);
    const bpt = (0, _BreakpointCommandUtils().breakpointFromArgList)(this._debugger, args, this.name);

    if (bpt == null) {
      await this._debugger.toggleAllBreakpoints();

      this._console.outputLine('All breakpoins toggled.');

      return;
    }

    await this._debugger.toggleBreakpoint(bpt);

    this._console.outputLine(`Breakpoint #${bpt.index} toggled.`);
  }

}

exports.default = BreakpointToggleCommand;