Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

/**
 * DebuggerCommander is used to take debugger commands from the user and stream them to a debugger.
 * The debugger can consume the commands by calling `commander.asObservable().subscribe()`.
 *
 * Exposing the DebuggerCommander as an Observable makes it easier to use with Nuclide's RPC
 * framework.
 */

var DebuggerCommander = (function () {
  function DebuggerCommander() {
    _classCallCheck(this, DebuggerCommander);

    this._subject = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
  }

  // Ideally, we would just expose subscribe(), but this is easier with our RPC framework.

  _createClass(DebuggerCommander, [{
    key: 'asObservable',
    value: function asObservable() {
      return this._subject.asObservable();
    }
  }, {
    key: 'addBreakpoint',
    value: function addBreakpoint(breakpoint) {
      this._subject.next({ method: 'add_breakpoint', breakpoint: breakpoint });
    }
  }, {
    key: 'clearBreakpoint',
    value: function clearBreakpoint(breakpoint) {
      this._subject.next({ method: 'clear_breakpoint', breakpoint: breakpoint });
    }
  }, {
    key: 'continue',
    value: function _continue() {
      this._subject.next({ method: 'continue' });
    }
  }, {
    key: 'jump',
    value: function jump(line) {
      this._subject.next({ method: 'jump', line: line });
    }
  }, {
    key: 'next',
    value: function next() {
      this._subject.next({ method: 'next' });
    }
  }, {
    key: 'quit',
    value: function quit() {
      this._subject.next({ method: 'quit' });
    }
  }, {
    key: 'return',
    value: function _return() {
      this._subject.next({ method: 'return' });
    }
  }, {
    key: 'step',
    value: function step() {
      this._subject.next({ method: 'step' });
    }
  }]);

  return DebuggerCommander;
})();

exports.DebuggerCommander = DebuggerCommander;