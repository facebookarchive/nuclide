"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _LineEditor() {
  const data = _interopRequireDefault(require("./console/LineEditor"));

  _LineEditor = function () {
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

function _More() {
  const data = _interopRequireDefault(require("./More"));

  _More = function () {
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
 *  strict-local
 * @format
 */
const PROMPT = '\x1b[32;1mfbdbg>\x1b[0m ';

class CommandLine {
  constructor(dispatcher) {
    this._inputStopped = false;
    this._shouldPrompt = false;
    this._lastLine = '';
    this._overridePrompt = null;
    this._subscriptions = [];
    this._dispatcher = dispatcher;
    this._cli = new (_LineEditor().default)({
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

    this._keys = new _RxMin.Subject();

    this._subscriptions.push(_RxMin.Observable.fromEvent(this._cli, 'key').takeUntil(_RxMin.Observable.fromEvent(this._cli, 'close')).subscribe(this._keys));

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

  observeKeys() {
    return this._keys;
  }

  isTTY() {
    return this._cli.isTTY();
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
  }

  output(text) {
    if (!this._inputStopped && this._more == null) {
      if (!text.startsWith('\n')) {
        this._cli.write('\n');
      }

      this._cli.write(text);

      this._cli.prompt();

      return;
    }

    this._cli.write(text);
  }

  outputLine(line = '') {
    if (this._more == null) {
      this._cli.write(`${line}\n`);
    }
  }

  write(data) {
    this._cli.write(data);
  }

  more(text) {
    if (!(this._more == null)) {
      throw new Error("Invariant violation: \"this._more == null\"");
    }

    const cursorControl = this._cli.borrowTTY();

    if (cursorControl == null) {
      this.output(text);
      return;
    }

    const more = new (_More().default)(text, this, cursorControl, () => {
      this._cli.returnTTY();

      this._more = null;
    });
    this._more = more;

    this._more.display();
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