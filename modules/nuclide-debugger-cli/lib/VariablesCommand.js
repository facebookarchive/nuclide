'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DebuggerInterface;

function _load_DebuggerInterface() {
  return _DebuggerInterface = require('./DebuggerInterface');
}

class VariablesCommand {

  constructor(con, debug) {
    this.name = 'variables';
    this.helpText = '[scope] Display variables of the current stack frame, optionally for a single scope.';
    this.detailedHelpText = `
variables [scope]

Each stack frame in a program may have its own local variables, and there there
may also be variables accessible at other scopes (such as global or in closures.)
The variables command queries the target for all scopes at the select stack frame,
and displays values for all variables in scopes deemed inexpensive to evaluate.
Optionally, you can specify a scope argument to just display the variables from
that scope, and the variables will be shown even if they are slow to evaluate.

The exact grouping of variables into scopes is dependent upon the source language
of the program being  debugged and the implemention of the debug adapter for that
type.

You can use the 'backtrace' command to set the selected stack frame. By default,
when the program stops the most recent frame will be selected.
  `;

    this._console = con;
    this._debugger = debug;
  }

  async execute(args) {
    if (args.length > 1) {
      throw new Error("'variables' takes at most one scope parameter");
    }

    const variables = await this._debugger.getVariables(args[0]);
    for (const scope of variables) {
      const vars = scope.variables;
      if (scope.expensive && vars == null) {
        this._console.outputLine();
        this._console.outputLine(`Variables in scope '${scope.scopeName}' have been elided as they are expensive`);

        this._console.outputLine(`to evaluate. Use 'variables ${scope.scopeName}' to see them.`);
        return;
      }

      if (vars != null) {
        this._console.outputLine();
        this._console.outputLine(`Variables in scope '${scope.scopeName}':`);
        vars.forEach(v => this._console.outputLine(`${v.name} => ${v.value}`));
      }
    }
  }
}
exports.default = VariablesCommand; /**
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