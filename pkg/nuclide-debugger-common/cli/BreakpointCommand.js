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
import type {DebuggerInterface, BreakpointSetResult} from './DebuggerInterface';
import type {ConsoleIO} from './ConsoleIO';

import BreakpointDisableCommand from './BreakpointDisableCommand';
import BreakpointEnableCommand from './BreakpointEnableCommand';
import BreakpointListCommand from './BreakpointListCommand';
import CommandDispatcher from './CommandDispatcher';
import HelpCommand from './HelpCommand';

export default class BreakpointCommand implements Command {
  name = 'breakpoint';

  // $TODO this will need more thorough help which will require extending the
  // help system to support subcommands
  helpText = 'Sets a breakpoint on the target.';

  _debugger: DebuggerInterface;
  _console: ConsoleIO;
  _dispatcher: CommandDispatcher;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
    this._dispatcher = new CommandDispatcher();

    this._dispatcher.registerCommand(new BreakpointDisableCommand(debug));
    this._dispatcher.registerCommand(new BreakpointEnableCommand(debug));
    this._dispatcher.registerCommand(new BreakpointListCommand(con, debug));
    this._dispatcher.registerCommand(new HelpCommand(con, this._dispatcher));
  }

  async execute(args: string[]): Promise<void> {
    const breakpointSpec = args[0];
    if (breakpointSpec == null) {
      throw new Error("'breakpoint' requires a breakpoint specification.");
    }

    const sourceBreakPattern = /^(.+):(\d+)$/;
    const sourceMatch = breakpointSpec.match(sourceBreakPattern);
    if (sourceMatch != null) {
      const [, path, line] = sourceMatch;
      const result = await this._debugger.setSourceBreakpoint(
        path,
        parseInt(line, 10),
      );
      this._displayBreakpointResult(result);
      return;
    }

    // $TODO function breakpoints - not implementing yet because none of the
    // supported adapters support them

    await this._dispatcher.executeTokenizedLine(args);
  }

  _displayBreakpointResult(result: BreakpointSetResult): void {
    this._console.outputLine(`Breakpoint ${result.index} set.`);
    if (result.message != null) {
      this._console.outputLine(result.message);
    }
  }
}
