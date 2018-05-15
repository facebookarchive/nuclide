'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _DebuggerInterface;














function _load_DebuggerInterface() {return _DebuggerInterface = require('./DebuggerInterface');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}












class EnterCode {








  constructor(console, debug) {this.name = 'code';this.helpText = 'Enter a multi-line code fragment for evaluation.';this._pendingText = '';this._subscription = null;
    this._debugger = debug;
    this._console = console;
  }

  execute() {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      _this._console.output(
      "Enter code, end with a single dot '.'. Use ctrl+c to abort.\n");

      _this._pendingText = '';
      _this._console.stopInput();
      _this._console.setPrompt('... ');

      _this._console.prompt();
      _this._subscription = _rxjsBundlesRxMinJs.Observable.merge(
      _this._console.
      observeInterrupts().
      switchMap(function (_) {return _rxjsBundlesRxMinJs.Observable.from([{ type: 'interrupt' }]);}),
      _this._console.
      observeLines().
      switchMap(function (line) {return _rxjsBundlesRxMinJs.Observable.from([{ type: 'line', line }]);})).

      switchMap(function (event) {
        switch (event.type) {
          case 'interrupt':
            _this._console.outputLine('Code entry aborted.');
            _this._closeNestedInput();
            break;

          case 'line':
            if (event.line === '.') {
              return _this._eval();
            }
            _this._pendingText = `${_this._pendingText}\n${event.line}`;
            _this._console.prompt();}

        return _rxjsBundlesRxMinJs.Observable.empty();
      }).
      subscribe(function (_) {return _this._closeNestedInput();}, function (_) {return _this._closeNestedInput();});})();
  }

  _closeNestedInput() {
    (0, (_nullthrows || _load_nullthrows()).default)(this._subscription).unsubscribe();
    this._subscription = null;
    this._console.setPrompt();
    this._console.startInput();
  }

  _eval() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      try {
        const {
          body: { result } } =
        yield _this2._debugger.evaluateExpression(_this2._pendingText);
        _this2._console.outputLine(result);
      } catch (err) {
        _this2._console.outputLine(err.message);
      }})();
  }}exports.default = EnterCode; /**
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