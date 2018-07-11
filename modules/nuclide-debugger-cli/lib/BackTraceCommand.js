"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

function _Thread() {
  const data = _interopRequireDefault(require("./Thread"));

  _Thread = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
    this.name = 'backtrace';
    this.helpText = '[frame] Displays the call stack of the active thread. With optional frame index, sets the current frame for variable display.';
    this.detailedHelpText = `
backtrace [frame]

With no arguments, displays the call stack, showing the most recent stack frame
first. For each frame, the frame's index, the source code file (if available), and
line number are shown. An asterisk marks the currently selected frame.

If the frame argument is specified, then it must be the index of a frame in the
range displayed by 'backtrace'. Selecting a stack frame tells the debugger to consider
the state of the program as if execution had stopped in that frame. Other commands
which query program state will use the selected frame for context; for example:

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

  async execute(args) {
    const activeThread = this._debugger.getActiveThread();

    if (args.length > 1) {
      throw new Error("'backtrace' takes at most one argument -- the index of the frame to select");
    }

    const frameArg = args[0];

    if (frameArg != null) {
      await this._setSelectedStackFrame(activeThread, frameArg);
      return;
    }

    const frames = await this._debugger.getStackTrace(activeThread.id(), BackTraceCommand._defaultFrames);

    this._printFrames(frames, activeThread.selectedStackFrame());
  }

  async _setSelectedStackFrame(thread, frameArg) {
    if (frameArg.match(/^\d+$/) == null) {
      throw new Error('Argument must be a numeric frame index.');
    }

    const newSelectedFrame = parseInt(frameArg, 10);
    await this._debugger.setSelectedStackFrame(thread, newSelectedFrame);
  }

  _printFrames(frames, selectedFrame) {
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