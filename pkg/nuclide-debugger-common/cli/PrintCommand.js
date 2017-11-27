/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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

  _console: ConsoleIO;
  _debugger: DebuggerInterface;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    const expr: string = args.join(' ');
    try {
      const {body: {result}} = await this._debugger.evaluateExpression(expr);
      this._console.outputLine(result);
    } catch (err) {
      const failure: DebugProtocol.base$Response = JSON.parse(err.message);
      this._console.outputLine(failure.message);
    }
  }
}
