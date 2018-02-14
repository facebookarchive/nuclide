'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _readline = _interopRequireDefault(require('readline'));

var _CommandDispatcher;

function _load_CommandDispatcher() {
  return _CommandDispatcher = _interopRequireDefault(require('./CommandDispatcher'));
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
 * 
 * @format
 */

class CommandLine {

  constructor(dispatcher) {
    this._inputStopped = false;
    this._shouldPrompt = false;
    this._lastLine = '';

    this._dispatcher = dispatcher;
    this._cli = _readline.default.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this._cli.setPrompt('fbdbg> ');
  }

  // $TODO handle
  // (1) async output that happens while the user is typing at the prompt
  // (2) paging long output (more) if termcap allows us to know the screen height
  output(text) {
    process.stdout.write(text);
  }

  outputLine(line = '') {
    process.stdout.write(`${line}\n`);
  }

  stopInput() {
    this._inputStopped = true;
  }

  startInput() {
    this._inputStopped = false;
    if (this._shouldPrompt) {
      this._cli.prompt();
      this._shouldPrompt = false;
    }
  }

  run() {
    return new Promise((resolve, reject) => {
      if (!this._inputStopped) {
        this._cli.prompt();
      } else {
        this._shouldPrompt = true;
      }
      this._cli.on('line', this._executeCommand.bind(this)).on('close', resolve);
    });
  }

  close() {
    this._cli.close();
  }

  _executeCommand(line) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (line !== '') {
        _this._lastLine = line;
      }
      try {
        yield _this._dispatcher.execute(_this._lastLine);
      } catch (x) {
        _this.outputLine(x.message);
      } finally {
        if (!_this._inputStopped) {
          _this._cli.prompt();
        } else {
          _this._shouldPrompt = true;
        }
      }
    })();
  }
}
exports.default = CommandLine;