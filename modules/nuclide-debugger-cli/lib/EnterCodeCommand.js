'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DebuggerInterface;

function _load_DebuggerInterface() {
  return _DebuggerInterface = require('./DebuggerInterface');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EnterCode {

  constructor(console, debug) {
    this.name = 'code';
    this.helpText = 'Enter a multi-line code fragment for evaluation.';
    this._pendingText = '';
    this._subscription = null;

    this._debugger = debug;
    this._console = console;
  }

  async execute() {
    this._console.output("Enter code, end with a single dot '.'. Use ctrl+c to abort.\n");
    this._pendingText = '';
    this._console.stopInput();
    this._console.setPrompt('... ');

    this._console.prompt();
    this._subscription = _rxjsBundlesRxMinJs.Observable.merge(this._console.observeInterrupts().switchMap(_ => _rxjsBundlesRxMinJs.Observable.from([{ type: 'interrupt' }])), this._console.observeLines().switchMap(line => _rxjsBundlesRxMinJs.Observable.from([{ type: 'line', line }]))).switchMap(event => {
      switch (event.type) {
        case 'interrupt':
          this._console.outputLine('Code entry aborted.');
          this._closeNestedInput();
          break;

        case 'line':
          if (event.line === '.') {
            return this._eval();
          }
          this._pendingText = `${this._pendingText}\n${event.line}`;
          this._console.prompt();
      }
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).subscribe(_ => this._closeNestedInput(), _ => this._closeNestedInput());
  }

  _closeNestedInput() {
    (0, (_nullthrows || _load_nullthrows()).default)(this._subscription).unsubscribe();
    this._subscription = null;
    this._console.setPrompt();
    this._console.startInput();
  }

  async _eval() {
    try {
      const {
        body: { result }
      } = await this._debugger.evaluateExpression(this._pendingText);
      this._console.outputLine(result);
    } catch (err) {
      this._console.outputLine(err.message);
    }
  }
}
exports.default = EnterCode; /**
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