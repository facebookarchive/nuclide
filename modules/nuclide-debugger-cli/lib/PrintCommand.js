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

function _DebuggerInterface() {
  const data = require("./DebuggerInterface");

  _DebuggerInterface = function () {
    return data;
  };

  return data;
}

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
class PrintCommand {
  constructor(con, debug) {
    this.name = 'print';
    this.helpText = 'expr: Prints the result of an expression in the context of the current stack frame.';
    this.detailedHelpText = `
print expression

Displays the value of an expression. The expression will be evaluated in the syntax
of the program's language.

The expression will be evaluated in the context of the selected stack frame. See
'backtrace' for how to set the selected frame.

The expression may have side effects, in which case program state will be modified.
For example,

print x = 5

is a convenient way to set the value of 'x' to 5. Also, since a function call is
an expression, any in-scope function may be called, which may modify program state
in complex ways.
  `;
    this._console = con;
    this._debugger = debug;
  }

  async execute(args) {
    const expr = args.join(' ');

    try {
      const {
        body: {
          result,
          variablesReference,
          namedVariables,
          indexedVariables
        }
      } = await this._debugger.evaluateExpression(expr);

      if (variablesReference > 0) {
        this._console.more((await this.formatVariable({
          name: '',
          value: result,
          variablesReference,
          namedVariables: namedVariables == null ? 0 : namedVariables,
          indexedVariables: indexedVariables == null ? 0 : indexedVariables
        }, 0)));
      }
    } catch (err) {
      this._console.outputLine(err.message);
    }
  }

  async formatVariable(v, depth) {
    if (depth > 4) {
      return '...';
    }

    if (v.variablesReference != null && v.variablesReference !== 0) {
      if ((v.indexedVariables === 0 || v.indexedVariables == null) && (v.namedVariables === 0 || v.namedVariables == null)) {
        return '[]';
      }

      const children = await this._debugger.getVariablesByReference(v.variablesReference);
      const childValues = await Promise.all(children.map(child => this.formatVariable(child, depth + 1)));
      let formatted = '';
      formatted += `${' '.repeat(depth)}[\n`;

      for (let index = 0; index < children.length; index++) {
        formatted += `${' '.repeat(depth + 1)}${children[index].name} => ${childValues[index]},\n`;
      }

      formatted += `${' '.repeat(depth)}]`;
      return formatted;
    }

    return v.value;
  }

}

exports.default = PrintCommand;