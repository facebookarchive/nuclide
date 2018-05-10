/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {Command} from './Command';
import type {DebuggerInterface, BreakpointSetResult} from './DebuggerInterface';
import type {ConsoleIO} from './ConsoleIO';

import BreakpointDeleteCommand from './BreakpointDeleteCommand';
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

  detailedHelpText = `
breakpoint [subcommand | [source-file:]line] | function-name()

Sets a breakpoint, or operates on existing breakpoints.

With no arguments, attempts to set a breakpoint at the current location as determined
by the selected stack frame. With no source file, attempts to set a breakpoint at
the given line number in the source file at the current location.

Upon setting a breakpoint, the debugger may respond that the breakpoint was set
but not bound. There are several reasons this can happen:

* The line number specified has no executable code associated with it.
* The source file specified does not exist.
* The breakpoint is in a proper location in a good source file, but information
  about the source file has not yet been loaded. Not all languages know what source
  files will be loaded in the course of execution; for example, in node a source
  file will not be become available until some other module has called 'require'
  on it.

If the breakpoint is incorrectly specified, it will never be hit. However, in the
latter case, the breakpoint will become active when the runtime loads the specified
file.

The breakpoint command has several subcommands:

* 'delete' will delete an existing breakpoint
* 'disable' will temporarily disable an existing breakpoint
* 'enable' will re-enable an existing breakpoint
* 'help' will give detailed information about the subcommands
* 'list' will list all existing breakpoints
  `;

  _debugger: DebuggerInterface;
  _console: ConsoleIO;
  _dispatcher: CommandDispatcher;

  constructor(con: ConsoleIO, debug: DebuggerInterface) {
    this._console = con;
    this._debugger = debug;
    this._dispatcher = new CommandDispatcher(new Map());

    this._dispatcher.registerCommand(new BreakpointDeleteCommand(debug));
    this._dispatcher.registerCommand(new BreakpointDisableCommand(debug));
    this._dispatcher.registerCommand(new BreakpointEnableCommand(debug));
    this._dispatcher.registerCommand(new BreakpointListCommand(con, debug));
    this._dispatcher.registerCommand(new HelpCommand(con, this._dispatcher));
  }

  async execute(args: string[]): Promise<void> {
    const result = await this._trySettingBreakpoint(args);
    if (result != null) {
      this._displayBreakpointResult(result);
      return;
    }

    await this._dispatcher.executeTokenizedLine(args);
  }

  async _trySettingBreakpoint(
    args: Array<string>,
  ): Promise<?BreakpointSetResult> {
    const breakpointSpec = args[0];
    if (breakpointSpec == null) {
      return this._setBreakpointHere();
    }

    const linePattern = /^(\d+)$/;
    const lineMatch = breakpointSpec.match(linePattern);
    if (lineMatch != null) {
      return this._setBreakpointHere(parseInt(lineMatch[1], 10));
    }

    const sourceBreakPattern = /^(.+):(\d+)$/;
    const sourceMatch = breakpointSpec.match(sourceBreakPattern);
    if (sourceMatch != null) {
      const [, path, line] = sourceMatch;
      return this._debugger.setSourceBreakpoint(path, parseInt(line, 10));
    }

    const functionBreakpointPattern = /^(.+)\(\)/;
    const functionMatch = breakpointSpec.match(functionBreakpointPattern);
    if (functionMatch != null) {
      return this._debugger.setFunctionBreakpoint(functionMatch[1]);
    }

    return null;
  }

  _displayBreakpointResult(result: BreakpointSetResult): void {
    this._console.outputLine(`Breakpoint ${result.index} set.`);
    if (result.message != null) {
      this._console.outputLine(result.message);
    }
  }

  async _setBreakpointHere(line: ?number): Promise<BreakpointSetResult> {
    const frame = await this._debugger.getCurrentStackFrame();
    if (frame == null) {
      throw new Error('Cannot set breakpoint here, no current stack frame.');
    }

    if (frame.source == null || frame.source.path == null) {
      throw new Error(
        'Cannot set breakpoint here, current stack frame has no source.',
      );
    }

    const result = await this._debugger.setSourceBreakpoint(
      frame.source.path,
      line == null ? frame.line : line,
    );
    return result;
  }
}
