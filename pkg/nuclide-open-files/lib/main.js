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
  (0, (_assert2 || _assert()).default)(filePath != null);
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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

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
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    var notifiers = new (_NotifiersByConnection2 || _NotifiersByConnection()).NotifiersByConnection();
    this.notifiers = notifiers;
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