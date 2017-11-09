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
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class CommandLine {

  constructor(dispatcher) {
    this._inputStopped = false;
    this._shouldPrompt = false;

    this._dispatcher = dispatcher;
    this._cli = _readline.default.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this._cli.setPrompt('fbdb> ');
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
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return new Promise(function (resolve, reject) {
        _this._cli.prompt();
        _this._cli.on('line', _this._executeCommand.bind(_this)).on('close', resolve);
      });
    })();
  }

  close() {
    this._cli.close();
  }

  _executeCommand(line) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        yield _this2._dispatcher.execute(line);
      } catch (x) {
        _this2.outputLine(x.message);
      } finally {
        if (!_this2._inputStopped) {
          _this2._cli.prompt();
        } else {
          _this2._shouldPrompt = true;
        }
      }
    })();
  }
}
exports.default = CommandLine;