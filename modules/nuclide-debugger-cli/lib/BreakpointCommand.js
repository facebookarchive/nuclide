"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _BreakpointClearCommand() {
  const data = _interopRequireDefault(require("./BreakpointClearCommand"));

  _BreakpointClearCommand = function () {
    return data;
  };

  return data;
}

function _BreakpointCommandParser() {
  const data = _interopRequireDefault(require("./BreakpointCommandParser"));

  _BreakpointCommandParser = function () {
    return data;
  };

  return data;
}

function _BreakpointDisableCommand() {
  const data = _interopRequireDefault(require("./BreakpointDisableCommand"));

  _BreakpointDisableCommand = function () {
    return data;
  };

  return data;
}

function _BreakpointEnableCommand() {
  const data = _interopRequireDefault(require("./BreakpointEnableCommand"));

  _BreakpointEnableCommand = function () {
    return data;
  };

  return data;
}

function _BreakpointListCommand() {
  const data = _interopRequireDefault(require("./BreakpointListCommand"));

  _BreakpointListCommand = function () {
    return data;
  };

  return data;
}

function _BreakpointToggleCommand() {
  const data = _interopRequireDefault(require("./BreakpointToggleCommand"));

  _BreakpointToggleCommand = function () {
    return data;
  };

  return data;
}

function _CommandDispatcher() {
  const data = _interopRequireDefault(require("./CommandDispatcher"));

  _CommandDispatcher = function () {
    return data;
  };

  return data;
}

function _HelpCommand() {
  const data = _interopRequireDefault(require("./HelpCommand"));

  _HelpCommand = function () {
    return data;
  };

  return data;
}

function _TokenizedLine() {
  const data = _interopRequireDefault(require("./TokenizedLine"));

  _TokenizedLine = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class BreakpointCommand {
  // $TODO this will need more thorough help which will require extending the
  // help system to support subcommands
  constructor(con, debug) {
    this.name = 'breakpoint';
    this.helpText = 'Sets a breakpoint on the target.';
    this.detailedHelpText = `
breakpoint [subcommand | [[o]nce] [source-file:]line] | [[o]nce] function-name()

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

* 'clear' will delete an existing breakpoint
* 'disable' will temporarily disable an existing breakpoint
* 'enable' will re-enable an existing breakpoint
* 'help' will give detailed information about the subcommands
* 'list' will list all existing breakpoints
* 'toggle' will toggle the enabled state of an existing breakpoint
  `;
    this._console = con;
    this._debugger = debug;
    this._dispatcher = new (_CommandDispatcher().default)(new Map());

    this._dispatcher.registerCommand(new (_BreakpointClearCommand().default)(con, debug));

    this._dispatcher.registerCommand(new (_BreakpointDisableCommand().default)(con, debug));

    this._dispatcher.registerCommand(new (_BreakpointEnableCommand().default)(con, debug));

    this._dispatcher.registerCommand(new (_BreakpointListCommand().default)(con, debug));

    this._dispatcher.registerCommand(new (_BreakpointToggleCommand().default)(con, debug));

    this._dispatcher.registerCommand(new (_HelpCommand().default)(con, this._dispatcher));
  }

  async execute(line) {
    const result = await this._trySettingBreakpoint(line);

    if (result != null) {
      this._displayBreakpointResult(result);

      return;
    }

    const subcommand = new (_TokenizedLine().default)(line.rest(1));
    const error = await this._dispatcher.executeTokenizedLine(subcommand);

    if (error != null) {
      throw error;
    }
  }

  async _trySettingBreakpoint(line) {
    const parser = new (_BreakpointCommandParser().default)(line);

    if (!parser.parse()) {
      return null;
    }

    if (parser.sourceFile() == null && parser.functionName() == null) {
      return this._setBreakpointHere(parser.sourceLine(), parser.once(), parser.condition());
    }

    if (parser.sourceFile() != null) {
      return this._debugger.setSourceBreakpoint((0, _nullthrows().default)(parser.sourceFile()), (0, _nullthrows().default)(parser.sourceLine()), parser.once(), parser.condition());
    }

    const functionName = parser.functionName();

    if (!(functionName != null)) {
      throw new Error("Invariant violation: \"functionName != null\"");
    }

    return this._debugger.setFunctionBreakpoint(functionName, parser.once(), parser.condition());
  }

  _displayBreakpointResult(result) {
    this._console.outputLine(`Breakpoint ${result.index} set.`);

    if (result.message != null) {
      this._console.outputLine(result.message);
    }
  }

  async _setBreakpointHere(line, once, condition) {
    const frame = await this._debugger.getCurrentStackFrame();

    if (frame == null) {
      throw new Error('Cannot set breakpoint here, no current stack frame.');
    }

    if (frame.source == null || frame.source.path == null) {
      throw new Error('Cannot set breakpoint here, current stack frame has no source.');
    }

    const result = await this._debugger.setSourceBreakpoint(frame.source.path, line == null ? frame.line : line, once, condition);
    return result;
  }

}

exports.default = BreakpointCommand;