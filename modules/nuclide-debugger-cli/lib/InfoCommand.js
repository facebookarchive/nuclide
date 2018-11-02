"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _DebuggerInterface() {
  const data = require("./DebuggerInterface");

  _DebuggerInterface = function () {
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
class InfoCommand {
  constructor(con, debug) {
    this.name = 'info';
    this.helpText = '[object] Displays type information about an object';
    this._console = con;
    this._debugger = debug;
  }

  async execute(line) {
    const args = line.stringTokens().slice(1);

    if (args.length > 1) {
      throw new Error("'info' takes at most one object parameter");
    }

    const response = await this._debugger.info(args[0]);

    this._console.outputLine(response.body.info);
  }

}

exports.default = InfoCommand;