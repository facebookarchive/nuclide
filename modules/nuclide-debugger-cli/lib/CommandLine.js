"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _readline = _interopRequireDefault(require("readline"));

function _CommandDispatcher() {
  const data = _interopRequireDefault(require("./CommandDispatcher"));

  _CommandDispatcher = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
const PROMPT = 'fbdbg> ';

class CommandLine {
  constructor(dispatcher) {
    this._inputStopped = false;
    this._shouldPrompt = false;
    this._lastLine = '';
    this._overridePrompt = null;
    this._subscriptions = [];
    this._dispatcher = dispatcher;
    this._cli = _readline.default.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.setPrompt();
    this._interrupts = new _RxMin.Subject();

    this._subscriptions.push(_RxMin.Observable.fromEvent(this._cli, 'SIGINT').subscribe(this._interrupts));

    this._lines = new _RxMin.Subject();

    this._subscriptions.push(_RxMin.Observable.fromEvent(this._cli, 'line').takeUntil(_RxMin.Observable.fromEvent(this._cli, 'close')).subscribe(this._lines));

    this._subscriptions.push(this._lines.filter(_ => !this._inputStopped).switchMap(_ => {
      this._lastLine = _.trim() === '' ? this._lastLine : _.trim();
      return this._dispatcher.execute(this._lastLine);
    }).subscribe(_ => {
      if (_ != null) {
        this.outputLine(_.message);
      }

      if (!this._inputStopped) {
        this._cli.prompt();
      } else {
        this._shouldPrompt = true;
      }
    }));

    this._shouldPrompt = true;
  }

  dispose() {
    this._subscriptions.forEach(_ => _.unsubscribe());
  }

  observeInterrupts() {
    return this._interrupts;
  }

  observeLines() {
    return this._lines;
  }

  setPrompt(prompt) {
    this._overridePrompt = prompt;

    this._updatePrompt();
  }

  _updatePrompt() {
    if (this._inputStopped) {
      this._cli.setPrompt('');
    } else {
      this._cli.setPrompt(this._overridePrompt != null ? this._overridePrompt : PROMPT);
    }
  } // $TODO handle paging long output (more) if termcap allows us to know the screen height


  output(text) {
    if (!this._inputStopped) {
      if (!text.startsWith('\n')) {
        process.stdout.write('\n');
      }

      process.stdout.write(text);

      this._cli.prompt(true);

      return;
    }

    process.stdout.write(text);
  }

  outputLine(line = '') {
    process.stdout.write(`${line}\n`);
  }

  prompt() {
    this._cli.prompt();
  }

  stopInput() {
    this._inputStopped = true;
    this._shouldPrompt = true;

    this._updatePrompt();
  }

  startInput() {
    this._inputStopped = false;

    this._updatePrompt();

    if (this._shouldPrompt) {
      this._cli.prompt();

      this._shouldPrompt = false;
    }
  }

  close() {
    this._cli.close();
  }

}

exports.default = CommandLine;