'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _DebuggerInterface;

function _load_DebuggerInterface() {
  return _DebuggerInterface = require('./DebuggerInterface');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class PrintCommand {

  constructor(con, debug) {
    this.name = 'print';
    this.helpText = 'expr: Prints the result of an expression in the context of the current stack frame.';

    this._console = con;
    this._debugger = debug;
  }

  execute(args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const expr = args.join(' ');
      try {
        const { body: { result } } = yield _this._debugger.evaluateExpression(expr);
        _this._console.outputLine(result);
      } catch (err) {
        const failure = JSON.parse(err.message);
        _this._console.outputLine(failure.message);
      }
    })();
  }
}
exports.default = PrintCommand;