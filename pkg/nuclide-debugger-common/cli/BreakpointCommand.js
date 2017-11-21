'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

  // $TODO this will need more thorough help which will require extending the
  // help system to support subcommands
  constructor(con, debug) {
    this.name = 'breakpoint';
    this.helpText = 'Sets a breakpoint on the target.';

    this._console = con;
    this._debugger = debug;
    this._dispatcher = new (_CommandDispatcher || _load_CommandDispatcher()).default();

    this._dispatcher.registerCommand(new (_BreakpointDeleteCommand || _load_BreakpointDeleteCommand()).default(debug));
    this._dispatcher.registerCommand(new (_BreakpointDisableCommand || _load_BreakpointDisableCommand()).default(debug));
    this._dispatcher.registerCommand(new (_BreakpointEnableCommand || _load_BreakpointEnableCommand()).default(debug));
    this._dispatcher.registerCommand(new (_BreakpointListCommand || _load_BreakpointListCommand()).default(con, debug));
    this._dispatcher.registerCommand(new (_HelpCommand || _load_HelpCommand()).default(con, this._dispatcher));
  }

  execute(args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const breakpointSpec = args[0];
      if (breakpointSpec == null) {
        throw new Error("'breakpoint' requires a breakpoint specification.");
      }

      const sourceBreakPattern = /^(.+):(\d+)$/;
      const sourceMatch = breakpointSpec.match(sourceBreakPattern);
      if (sourceMatch != null) {
        const [, path, line] = sourceMatch;
        const result = yield _this._debugger.setSourceBreakpoint(path, parseInt(line, 10));
        _this._displayBreakpointResult(result);
        return;
      }

      // $TODO function breakpoints - not implementing yet because none of the
      // supported adapters support them

      yield _this._dispatcher.executeTokenizedLine(args);
    })();
  }

  _displayBreakpointResult(result) {
    this._console.outputLine(`Breakpoint ${result.index} set.`);
    if (result.message != null) {
      this._console.outputLine(result.message);
    }
  }
}
exports.default = BreakpointCommand; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */