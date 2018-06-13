'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

class BreakpointDeleteCommand {

  constructor(debug) {
    this.name = 'delete';
    this.helpText = '[index]: permanently deletes a breakpoint.';

    this._debugger = debug;
  }

  async execute(args) {
    let index = -1;

    if (args.length !== 1 || isNaN(index = parseInt(args[0], 10))) {
      throw new Error("Format is 'breakpoint delete index'");
    }

    await this._debugger.deleteBreakpoint(index);
  }
}
exports.default = BreakpointDeleteCommand;