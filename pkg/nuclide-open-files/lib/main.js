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

exports.reset = reset;
exports.getActivation = getActivation;
exports.getNotifierByConnection = getNotifierByConnection;

var getFileVersionOfBuffer = _asyncToGenerator(function* (buffer) {
  var filePath = buffer.getPath();
  var notifier = activation.notifiers.getForUri(filePath);
  if (notifier == null) {
    return null;
  }
  (0, (_assert || _load_assert()).default)(filePath != null);
  return {
    notifier: yield notifier,
    filePath: filePath,
    version: buffer.changeCount
  };
});

exports.getFileVersionOfBuffer = getFileVersionOfBuffer;
exports.getFileVersionOfEditor = getFileVersionOfEditor;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsAtomBuffer;

function _load_commonsAtomBuffer() {
  return _commonsAtomBuffer = require('../../commons-atom/buffer');
}

var _NotifiersByConnection;

function _load_NotifiersByConnection() {
  return _NotifiersByConnection = require('./NotifiersByConnection');
}

var _BufferSubscription;

function _load_BufferSubscription() {
  return _BufferSubscription = require('./BufferSubscription');
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();

    var notifiers = new (_NotifiersByConnection || _load_NotifiersByConnection()).NotifiersByConnection();
    this.notifiers = notifiers;
    this._disposables.add(notifiers);

    this._disposables.add((0, (_commonsAtomBuffer || _load_commonsAtomBuffer()).observeBufferOpen)().subscribe(function (buffer) {
      var subscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
      subscriptions.add(new (_BufferSubscription || _load_BufferSubscription()).BufferSubscription(notifiers, buffer));
      subscriptions.add((0, (_commonsAtomBuffer || _load_commonsAtomBuffer()).observeBufferCloseOrRename)(buffer).subscribe(function (closeEvent) {
        _this._disposables.remove(subscriptions);
        subscriptions.dispose();
      }));
      _this._disposables.add(subscriptions);
    }));
  }

  // Mutable for testing.

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

exports.Activation = Activation;
var activation = new Activation();

// exported for testing

function reset() {
  activation.dispose();
  activation = new Activation();
}

function getActivation() {
  return activation;
}

function getNotifierByConnection(connection) {
  return activation.notifiers.getForConnection(connection);
}

function getFileVersionOfEditor(editor) {
  return getFileVersionOfBuffer(editor.getBuffer());
}