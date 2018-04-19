/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import * as DebugProtocol from 'vscode-debugprotocol';

import type {Command} from './Command';
import type {ConsoleIO} from './ConsoleIO';

import {DebuggerInterface} from './DebuggerInterface';

export default class PrintCommand implements Command {
  name = 'print';
  helpText = 'expr: Prints the result of an expression in the context of the current stack frame.';
  detailedHelpText = `
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

  _console: ConsoleIO;
  _debugger: DebuggerInterface;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    const expr: string = args.join(' ');
    try {
      const {
        body: {result},
      } = await this._debugger.evaluateExpression(expr);
      this._console.outputLine(result);
    } catch (err) {
      const failure: DebugProtocol.base$Response = JSON.parse(err.message);
      this._console.outputLine(failure.message);
    }
  }
}
