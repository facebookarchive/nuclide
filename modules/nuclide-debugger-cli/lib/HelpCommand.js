"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
 *  strict
 * @format
 */
class HelpCommand {
  constructor(con, dispatcher) {
    this.name = 'help';
    this.helpText = 'Give help about the debugger command set.';
    this._console = con;
    this._dispatcher = dispatcher;
  }

  async execute(line) {
    const args = line.stringTokens().slice(1);
    const [command] = args;

    if (command != null) {
      this._displayDetailedHelp(command);

      return;
    }

    this._displayHelp();
  }

  _displayHelp() {
    const commands = this._dispatcher.getCommands();

    const commandDict = {};
    commands.forEach(x => commandDict[x.name] = x);
    const commandNames = commands.map(x => x.name).sort();
    commandNames.forEach(name => {
      this._console.outputLine(`${this._markShortestAlias(name, commandNames)}: ${commandDict[name].helpText}`);
    });
  }

  _markShortestAlias(command, commands) {
    for (let i = 1; i <= command.length; i++) {
      const prefix = command.substr(0, i);

      if (commands.filter(x => x.startsWith(prefix)).length === 1) {
        return `[${prefix}]${command.substr(i)}`;
      }
    }

    return command;
  }

  _displayDetailedHelp(cmd) {
    const commands = this._dispatcher.getCommandsMatching(cmd);

    if (commands.length === 0) {
      throw new Error(`There is no command "${cmd}"`);
    }

    if (commands.length > 1) {
      const list = this._dispatcher.commandListToString(commands);

      throw new Error(`Multiple commands match "${cmd}": ${list}`);
    }

    const command = commands[0];

    if (command.detailedHelpText != null) {
      this._console.outputLine(command.detailedHelpText);

      return;
    }

    this._console.outputLine(command.helpText);
  }

}

exports.default = HelpCommand;