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

class HelpCommand {

  constructor(con, getCommands) {
    this.name = 'help';
    this.helpText = 'Give help about the debugger command set.';

    this._console = con;
    this._getCommands = getCommands;
  }

  execute() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._displayHelp();
    })();
  }

  _displayHelp() {
    const commands = this._getCommands();
    const commandDict = {};
    commands.forEach(x => commandDict[x.name] = x);

    const commandNames = commands.map(x => x.name).sort();

    commandNames.forEach(name => {
      this._console.outputLine(`${name}: ${commandDict[name].helpText}`);
    });
  }
}
exports.default = HelpCommand;