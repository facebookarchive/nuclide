"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
class DownCommand {
  constructor(con, debug) {
    this.name = 'down';
    this.helpText = 'Move to the next lower stack frame.';
    this.detailedHelpText = `
down

Moves to the next lower (towards from the current break location) stack frame.
Selecting a stack frame tells the debugger to consider the state of the program
as if execution had stopped in that frame. Other commands which query program state
will use the selected frame for context; for example:

* The 'list' command, with no specified source file, will use the source file of
  the selected frame.
* The 'variables' command will display variables from the scope of the selected
  frame.
* The 'print' command will evaluate expression in terms of the variables that are
  in scope in the selected frame.
  `;
    this._console = con;
    this._debugger = debug;
  }

  async execute(line) {
    const activeThread = this._debugger.getActiveThread();

    if (activeThread.selectedStackFrame() === 0) {
      throw new Error('Already at the lowest stack frame.');
    }

    await this._debugger.setSelectedStackFrame(activeThread, activeThread.selectedStackFrame() - 1);
  }

}

exports.default = DownCommand;