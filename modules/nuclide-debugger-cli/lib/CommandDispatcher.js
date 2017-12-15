'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class CommandDispatcher {
  constructor() {
    this.commands = [];
  }

  registerCommand(command) {
    this.commands.push(command);
  }

  getCommands() {
    return this.commands;
  }

  getCommandsMatching(prefix) {
    const re = new RegExp(`^${prefix}`);
    return this.commands.filter(x => x.name.match(re));
  }

  commandListToString(commands) {
    const names = commands.map(_ => _.name);
    return `"${names.join('", "')}"`;
  }

  execute(line) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      let tail = line;
      const tokens = [];

      // Here we're looking for quoted arguments.
      // \1 is the contents of a single-quoted arg that may contain spaces
      // \2 is a space-delimited arg if there are no quotes
      // \3 is the rest of the command line
      const tokenizer = /^\s*(?:('([^']*)')|(\S+))\s*(.*)$/;

      while (tail.length > 0) {
        const match = tail.match(tokenizer);
        if (match == null) {
          break;
        }

        const [,, quoted, unquoted, rest] = match;
        tokens.push(quoted != null ? quoted : unquoted);
        tail = rest;
      }

      return _this.executeTokenizedLine(tokens);
    })();
  }

  executeTokenizedLine(tokens) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (tokens.length === 0 || !tokens[0]) {
        return;
      }

      // Get all commands of which the given command is a prefix
      const cmd = tokens[0];
      const matches = _this2.getCommandsMatching(cmd);

      if (matches.length === 0) {
        throw new Error(`No command matches "${cmd}".`);
      }

      if (matches.length > 1) {
        const list = _this2.commandListToString(matches);
        throw new Error(`Multiple commands match "${cmd}": ${list}`);
      }

      return matches[0].execute(tokens.slice(1));
    })();
  }
}
exports.default = CommandDispatcher;