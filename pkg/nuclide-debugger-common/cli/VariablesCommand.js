'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _DebuggerInterface;

function _load_DebuggerInterface() {
  return _DebuggerInterface = require('./DebuggerInterface');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class VariablesCommand {

  constructor(con, debug) {
    this.name = 'variables';
    this.helpText = '[scope] Display variables of the current stack frame, optionally for a single scope.';

    this._console = con;
    this._debugger = debug;
  }

  execute(args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (args.length > 1) {
        throw new Error("'variables' takes at most one scope parameter");
      }

      const variables = yield _this._debugger.getVariables(args[0]);
      for (const scope of variables) {
        const vars = scope.variables;
        if (scope.expensive && vars == null) {
          _this._console.outputLine();
          _this._console.outputLine(`Variables in scope '${scope.scopeName}' have been elided as they are expensive`);

          _this._console.outputLine(`to evaluate. Use 'variables ${scope.scopeName}' to see them.`);
          return;
        }

        if (vars != null) {
          _this._console.outputLine();
          _this._console.outputLine(`Variables in scope '${scope.scopeName}':`);
          vars.forEach(function (v) {
            return _this._console.outputLine(`${v.name} => ${v.value}`);
          });
        }
      }
    })();
  }
}
exports.default = VariablesCommand; /**
                                     * Copyright (c) 2015-present, Facebook, Inc.
                                     * All rights reserved.
                                     *
                                     * This source code is licensed under the license found in the LICENSE file in
                                     * the root directory of this source tree.
                                     *
                                     * 
                                     * @format
                                     */