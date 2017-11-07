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

import type {Command} from './Command';
import type {ConsoleIO} from './ConsoleIO';
import {DebuggerInterface} from './DebuggerInterface';

export default class VariablesCommand implements Command {
  name = 'variables';
  helpText = '[scope] Display variables of the current stack frame, optionally for a single scope.';

  _console: ConsoleIO;
  _debugger: DebuggerInterface;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    if (args.length > 1) {
      throw new Error("'variables' takes at most one scope parameter");
    }

    const variables = await this._debugger.getVariables(args[0]);
    for (const scope of variables) {
      const vars = scope.variables;
      if (scope.expensive && vars == null) {
        this._console.outputLine();
        this._console.outputLine(
          `Variables in scope '${scope.scopeName}' have been elided as they are expensive`,
        );

        // $TODO in the next diff - make this work by allowing a scope argument
        this._console.outputLine(
          `to evaluate. Use 'variables ${scope.scopeName}' to see them.`,
        );
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
