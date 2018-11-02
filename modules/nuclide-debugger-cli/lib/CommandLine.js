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

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

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
const PROMPT = 'fbdbg> ';

class CommandLine {
  constructor(dispatcher, plain, logger) {
    this._inputStopped = false;
    this._keepPromptWhenStopped = false;
    this._shouldPrompt = false;
    this._lastLine = '';
    this._overridePrompt = null;
    this._subscriptions = [];
    this._dispatcher = dispatcher;
    let lineEditorArgs = {
      input: process.stdin,
      output: process.stdout
    };

    if (plain) {
      lineEditorArgs = Object.assign({}, lineEditorArgs, {
        tty: false
      });
    }

    this._cli = new (_LineEditor().default)(lineEditorArgs, logger);
    this.setPrompt();
    this._interrupts = new _rxjsCompatUmdMin.Subject();

    this._subscriptions.push(_rxjsCompatUmdMin.Observable.fromEvent(this._cli, 'SIGINT').subscribe(this._interrupts));

    this._lines = new _rxjsCompatUmdMin.Subject();

    this._subscriptions.push(_rxjsCompatUmdMin.Observable.fromEvent(this._cli, 'line').takeUntil(_rxjsCompatUmdMin.Observable.fromEvent(this._cli, 'close')).subscribe(this._lines));

    this._subscriptions.push(this._lines.filter(_ => !this._inputStopped).switchMap(_ => {
      this._lastLine = _.trim() === '' ? this._lastLine : _.trim();

      try {
        return this._dispatcher.execute(this._lastLine);
      } catch (err) {
        return err;
      }
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

    this._keys = new _rxjsCompatUmdMin.Subject();

    this._subscriptions.push(_rxjsCompatUmdMin.Observable.fromEvent(this._cli, 'key').takeUntil(_rxjsCompatUmdMin.Observable.fromEvent(this._cli, 'close')).subscribe(this._keys));

    this._subscriptions.push(_rxjsCompatUmdMin.Observable.fromEvent(this._cli, 'close').subscribe(() => process.exit(1)));

    this._shouldPrompt = true;
  }

  dispose() {
    this._subscriptions.forEach(_ => _.unsubscribe());
  }

  enterFullScreen() {
    this._cli.enterFullScreen();
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
    if (this._inputStopped && !this._keepPromptWhenStopped) {
      this._cli.setPrompt('');
    } else {
      this._cli.setPrompt(this._overridePrompt != null ? this._overridePrompt : PROMPT);
    }
  }

  output(text) {
    this._cli.write(text);
  }

  outputLine(line = '') {
    this._cli.write(`${line}\n`);
  }

  prompt() {
    this._cli.prompt();
  }

  stopInput(keepPromptWhenStopped) {
    this._keepPromptWhenStopped = keepPromptWhenStopped === true;
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

  close(error) {
    this._cli.close(error);
  }

}

exports.default = CommandLine;