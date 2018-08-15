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
class BackTraceCommand {
  constructor(con, debug) {
    this.name = 'where';
    this.helpText = 'Displays the call stack of the active thread.';
    this.detailedHelpText = `
where

Displays the call stack, showing the most recent stack frame first. For each
frame, the frame's index, the source code file (if available), and
line number are shown. An asterisk marks the currently selected frame.
`;
    this._console = con;
    this._debugger = debug;
  }

  async execute(args) {
    const activeThread = this._debugger.getActiveThread();

    const frames = await this._debugger.getStackTrace(activeThread.id(), BackTraceCommand._defaultFrames);
    const selectedFrame = activeThread.selectedStackFrame();
    frames.forEach((frame, index) => {
      var _ref;

      const selectedMarker = index === selectedFrame ? '*' : ' ';
      const path = ((_ref = frame) != null ? (_ref = _ref.source) != null ? _ref.path : _ref : _ref) || null;
      const location = path != null ? `${path}:${frame.line}` : '[no source]';

      this._console.outputLine(`${selectedMarker} #${index} ${frame.name} ${location}`);
    });
  }

}

exports.default = BackTraceCommand;
BackTraceCommand._defaultFrames = 100;