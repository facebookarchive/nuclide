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

var _debuggingDebuggingActivation;

function _load_debuggingDebuggingActivation() {
  return _debuggingDebuggingActivation = require('./debugging/DebuggingActivation');
}

var _packagerPackagerActivation;

function _load_packagerPackagerActivation() {
  return _packagerPackagerActivation = require('./packager/PackagerActivation');
}

var _shellShellActivation;

function _load_shellShellActivation() {
  return _shellShellActivation = require('./shell/ShellActivation');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom || _load_atom()).CompositeDisposable(this._debuggingActivation = new (_debuggingDebuggingActivation || _load_debuggingDebuggingActivation()).DebuggingActivation(), this._packagerActivation = new (_packagerPackagerActivation || _load_packagerPackagerActivation()).PackagerActivation(), new (_shellShellActivation || _load_shellShellActivation()).ShellActivation());
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeOutputService',
    value: function consumeOutputService(api) {
      return this._packagerActivation.consumeOutputService(api);
    }
  }, {
    key: 'consumeCwdApi',
    value: function consumeCwdApi(api) {
      return this._packagerActivation.consumeCwdApi(api);
    }
  }]);

  return Activation;
})();

exports.default = Activation;
module.exports = exports.default;