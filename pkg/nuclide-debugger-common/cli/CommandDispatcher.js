'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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

  execute(line) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const tokens = line.split(/\s+/);
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
      const re = new RegExp(`^${cmd}`);
      const matches = _this2.commands.filter(function (x) {
        return x.name.match(re);
      });

      if (matches.length === 0) {
        throw new Error(`No command matches "${cmd}".`);
      }

      if (matches.length > 1) {
        throw new Error(`Multiple commands match "${cmd}": "${matches.map(function (x) {
          return x.name;
        }).join('", "')}".`);
      }

      return matches[0].execute(tokens.slice(1));
    })();
  }
}
exports.default = CommandDispatcher;