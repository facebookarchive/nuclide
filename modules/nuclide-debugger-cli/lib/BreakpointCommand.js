'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BreakpointDeleteCommand;

function _load_BreakpointDeleteCommand() {
  return _BreakpointDeleteCommand = _interopRequireDefault(require('./BreakpointDeleteCommand'));
}

var _BreakpointDisableCommand;

function _load_BreakpointDisableCommand() {
  return _BreakpointDisableCommand = _interopRequireDefault(require('./BreakpointDisableCommand'));
}

var _BreakpointEnableCommand;

function _load_BreakpointEnableCommand() {
  return _BreakpointEnableCommand = _interopRequireDefault(require('./BreakpointEnableCommand'));
}

var _BreakpointListCommand;

function _load_BreakpointListCommand() {
  return _BreakpointListCommand = _interopRequireDefault(require('./BreakpointListCommand'));
}

var _CommandDispatcher;

function _load_CommandDispatcher() {
  return _CommandDispatcher = _interopRequireDefault(require('./CommandDispatcher'));
}

var _HelpCommand;

function _load_HelpCommand() {
  return _HelpCommand = _interopRequireDefault(require('./HelpCommand'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BreakpointCommand {

  constructor(con, debug) {
    this.name = 'breakpoint';
    this.helpText = 'Sets a breakpoint on the target.';
    this.detailedHelpText = `
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

    this._console = con;
    this._debugger = debug;
    this._dispatcher = new (_CommandDispatcher || _load_CommandDispatcher()).default(new Map());

    this._dispatcher.registerCommand(new (_BreakpointDeleteCommand || _load_BreakpointDeleteCommand()).default(debug));
    this._dispatcher.registerCommand(new (_BreakpointDisableCommand || _load_BreakpointDisableCommand()).default(debug));
    this._dispatcher.registerCommand(new (_BreakpointEnableCommand || _load_BreakpointEnableCommand()).default(debug));
    this._dispatcher.registerCommand(new (_BreakpointListCommand || _load_BreakpointListCommand()).default(con, debug));
    this._dispatcher.registerCommand(new (_HelpCommand || _load_HelpCommand()).default(con, this._dispatcher));
  }

  // $TODO this will need more thorough help which will require extending the
  // help system to support subcommands


  async execute(args) {
    const result = await this._trySettingBreakpoint(args);
    if (result != null) {
      this._displayBreakpointResult(result);
      return;
    }

    await this._dispatcher.executeTokenizedLine(args);
  }

  async _trySettingBreakpoint(args) {
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

  _displayBreakpointResult(result) {
    this._console.outputLine(`Breakpoint ${result.index} set.`);
    if (result.message != null) {
      this._console.outputLine(result.message);
    }
  }

  async _setBreakpointHere(line) {
    const frame = await this._debugger.getCurrentStackFrame();
    if (frame == null) {
      throw new Error('Cannot set breakpoint here, no current stack frame.');
    }

    if (frame.source == null || frame.source.path == null) {
      throw new Error('Cannot set breakpoint here, current stack frame has no source.');
    }

    const result = await this._debugger.setSourceBreakpoint(frame.source.path, line == null ? frame.line : line);
    return result;
  }
}
exports.default = BreakpointCommand; /**
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