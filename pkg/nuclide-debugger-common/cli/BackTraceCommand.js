'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _Thread;

function _load_Thread() {
  return _Thread = _interopRequireDefault(require('./Thread'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BackTraceCommand {

  constructor(con, debug) {
    this.name = 'backtrace';
    this.helpText = '[frame] Displays the call stack of the active thread. With optional frame index, sets the current frame for variable display.';

    this._console = con;
    this._debugger = debug;
  }

  execute(args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const activeThread = _this._debugger.getActiveThread();

      if (args.length > 1) {
        throw Error("'backtrace' takes at most one argument -- the index of the frame to select");
      }

      const frameArg = args[0];
      if (frameArg != null) {
        yield _this._setSelectedStackFrame(activeThread, frameArg);
        return;
      }

      const frames = yield _this._debugger.getStackTrace(activeThread.id(), BackTraceCommand._defaultFrames);
      _this._printFrames(frames, activeThread.selectedStackFrame());
    })();
  }

  _setSelectedStackFrame(thread, frameArg) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (frameArg.match(/^\d+$/) == null) {
        throw Error('Argument must be a numeric frame index.');
      }

      const newSelectedFrame = parseInt(frameArg, 10);
      yield _this2._debugger.setSelectedStackFrame(thread, newSelectedFrame);
    })();
  }

  _printFrames(frames, selectedFrame) {
    frames.forEach((frame, index) => {
      var _ref, _ref2;

      const selectedMarker = index === selectedFrame ? '*' : ' ';
      const path = ((_ref = frame) != null ? (_ref2 = _ref.source) != null ? _ref2.path : _ref2 : _ref) || null;
      const location = path != null ? `${path}:${frame.line}` : '[no source]';
      this._console.outputLine(`${selectedMarker} #${index} ${frame.name} ${location}`);
    });
  }
}
exports.default = BackTraceCommand; /**
                                     * Copyright (c) 2015-present, Facebook, Inc.
                                     * All rights reserved.
                                     *
                                     * This source code is licensed under the license found in the LICENSE file in
                                     * the root directory of this source tree.
                                     *
                                     * 
                                     * @format
                                     */

BackTraceCommand._defaultFrames = 100;