"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
  constructor(debug) {
    this.name = 'toggle';
    this.helpText = "index | 'all': toggles a breakpoint, or all breakpoints.";
    this._debugger = debug;
  }

  async execute(args) {
    let index = NaN;

    if (args.length !== 1 || !'all'.startsWith(args[0]) && isNaN(index = parseInt(args[0], 10))) {
      throw new Error("Format is 'breakpoint toggle index | 'all''");
    }

    if (isNaN(index)) {
      await this._debugger.toggleAllBreakpoints();
      return;
    }

    await this._debugger.toggleBreakpoint(index);
  }

}

exports.default = BreakpointToggleCommand;