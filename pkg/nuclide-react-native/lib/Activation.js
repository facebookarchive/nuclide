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

var _debuggingDebuggingActivation = require('./debugging/DebuggingActivation');

var _packagerPackagerActivation = require('./packager/PackagerActivation');

var _shellShellActivation = require('./shell/ShellActivation');

var _atom = require('atom');

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable(this._debuggingActivation = new _debuggingDebuggingActivation.DebuggingActivation(), new _packagerPackagerActivation.PackagerActivation(), new _shellShellActivation.ShellActivation());
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'provideNuclideDebugger',
    value: function provideNuclideDebugger() {
      return this._debuggingActivation.provideNuclideDebugger();
    }
  }]);

  return Activation;
})();

exports.Activation = Activation;