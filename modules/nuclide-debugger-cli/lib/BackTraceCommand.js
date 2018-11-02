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
class BackTraceCommand {
  constructor(con, debug) {
    this.name = 'where [num-frames]';
    this.helpText = 'Displays the call stack of the active thread.';
    this.detailedHelpText = `
where [num-frames]

Displays the call stack, showing the most recent stack frame first. For each
frame, the frame's index, the source code file (if available), and
line number are shown. An asterisk marks the currently selected frame.

If num-frames is specified, at most that many frames will be displayed. The
default number of frames to display is 100.
`;
    this._console = con;
    this._debugger = debug;
  }

  async execute(line) {
    const args = line.stringTokens().slice(1);

    const activeThread = this._debugger.getActiveThread();

    const frameCount = args.length < 1 ? BackTraceCommand._defaultFrames : parseInt(args[0], 10);

    if (isNaN(frameCount) || frameCount <= 0) {
      this._console.outputLine('The number of frames must be a positive integer.');

      return;
    }

    const frames = await this._debugger.getStackTrace(activeThread.id(), frameCount);
    const selectedFrame = activeThread.selectedStackFrame();

    this._console.outputLine(frames.map((frame, index) => {
      var _ref;

      const selectedMarker = index === selectedFrame ? '*' : ' ';
      const path = ((_ref = frame) != null ? (_ref = _ref.source) != null ? _ref.path : _ref : _ref) || null;
      const location = path != null ? `${path}:${frame.line}` : '[no source]';
      return `${selectedMarker} #${index} ${frame.name} ${location}`;
    }).join('\n'));
  }

}

exports.default = BackTraceCommand;
BackTraceCommand._defaultFrames = 100;