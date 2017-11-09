'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class BackTraceCommand {

  constructor(con, debug) {
    this.name = 'backtrace';
    this.helpText = 'Displays the call stack of the active thread.';

    this._console = con;
    this._debugger = debug;
  }

  execute() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const activeThread = _this._debugger.getActiveThread();
      if (activeThread == null) {
        throw Error('There is no active thread.');
      }

      const frames = yield _this._debugger.getStackTrace(activeThread);

      frames.forEach(function (frame, index) {
        var _ref, _ref2;

        const path = ((_ref = frame) != null ? (_ref2 = _ref.source) != null ? _ref2.path : _ref2 : _ref) || null;
        const location = path != null ? `${path}:${frame.line + 1}` : '[no source]';
        _this._console.outputLine(`#${index} ${frame.name} ${location}`);
      });
    })();
  }
}
exports.default = BackTraceCommand;