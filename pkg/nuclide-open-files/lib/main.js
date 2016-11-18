'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileVersionOfBuffer = exports.Activation = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getFileVersionOfBuffer = exports.getFileVersionOfBuffer = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (buffer) {
    const filePath = buffer.getPath();
    const notifier = activation.notifiers.getForUri(filePath);
    if (notifier == null) {
      return null;
    }

    if (!(filePath != null)) {
      throw new Error('Invariant violation: "filePath != null"');
    }

    return {
      notifier: yield notifier,
      filePath: filePath,
      version: buffer.changeCount
    };
  });

  return function getFileVersionOfBuffer(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.reset = reset;
exports.getActivation = getActivation;
exports.getNotifierByConnection = getNotifierByConnection;
exports.getFileVersionOfEditor = getFileVersionOfEditor;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _buffer;

function _load_buffer() {
  return _buffer = require('../../commons-atom/buffer');
}

var _NotifiersByConnection;

function _load_NotifiersByConnection() {
  return _NotifiersByConnection = require('./NotifiersByConnection');
}

var _BufferSubscription;

function _load_BufferSubscription() {
  return _BufferSubscription = require('./BufferSubscription');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Activation = exports.Activation = class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const notifiers = new (_NotifiersByConnection || _load_NotifiersByConnection()).NotifiersByConnection();
    this.notifiers = notifiers;
    this._disposables.add(notifiers);

    this._disposables.add((0, (_buffer || _load_buffer()).observeBufferOpen)().subscribe(buffer => {
      const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      subscriptions.add(new (_BufferSubscription || _load_BufferSubscription()).BufferSubscription(notifiers, buffer));
      subscriptions.add((0, (_buffer || _load_buffer()).observeBufferCloseOrRename)(buffer).subscribe(closeEvent => {
        this._disposables.remove(subscriptions);
        subscriptions.dispose();
      }));
      this._disposables.add(subscriptions);
    }));
  }

  dispose() {
    this._disposables.dispose();
  }
};

// Mutable for testing.

let activation = new Activation();

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