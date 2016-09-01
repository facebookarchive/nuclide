Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomBuffer2;

function _commonsAtomBuffer() {
  return _commonsAtomBuffer2 = require('../../commons-atom/buffer');
}

var _NotifiersByConnection2;

function _NotifiersByConnection() {
  return _NotifiersByConnection2 = require('./NotifiersByConnection');
}

var _BufferSubscription2;

function _BufferSubscription() {
  return _BufferSubscription2 = require('./BufferSubscription');
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      var notifiers = new (_NotifiersByConnection2 || _NotifiersByConnection()).NotifiersByConnection();
      this._disposables.add(notifiers);

      this._disposables.add((0, (_commonsAtomBuffer2 || _commonsAtomBuffer()).observeBuffers)(function (buffer) {
        var subscriptions = new (_atom2 || _atom()).CompositeDisposable();
        subscriptions.add(new (_BufferSubscription2 || _BufferSubscription()).BufferSubscription(notifiers, buffer));
        subscriptions.add(buffer.onDidDestroy(function () {
          _this._disposables.remove(subscriptions);
          subscriptions.dispose();
        }));
        _this._disposables.add(subscriptions);
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

exports.Activation = Activation;

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}