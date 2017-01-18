'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileVersionOfBuffer = exports.Activation = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getFileVersionOfBuffer = exports.getFileVersionOfBuffer = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (buffer) {
    const filePath = buffer.getPath();
    const notifier = getActivation().notifiers.getForUri(filePath);
    if (notifier == null) {
      return null;
    }

    if (!(filePath != null)) {
      throw new Error('Invariant violation: "filePath != null"');
    }

    return {
      notifier: yield notifier,
      filePath,
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

var _textBuffer;

function _load_textBuffer() {
  return _textBuffer = require('../../commons-atom/text-buffer');
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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const notifiers = new (_NotifiersByConnection || _load_NotifiersByConnection()).NotifiersByConnection();
    this.notifiers = notifiers;
    this._disposables.add(notifiers);

    this._disposables.add((0, (_textBuffer || _load_textBuffer()).observeBufferOpen)().subscribe(buffer => {
      const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      subscriptions.add(new (_BufferSubscription || _load_BufferSubscription()).BufferSubscription(notifiers, buffer));
      subscriptions.add((0, (_textBuffer || _load_textBuffer()).observeBufferCloseOrRename)(buffer).subscribe(closeEvent => {
        this._disposables.remove(subscriptions);
        subscriptions.dispose();
      }));
      this._disposables.add(subscriptions);
    }));
  }

  dispose() {
    this._disposables.dispose();
  }
}

exports.Activation = Activation; // Mutable for testing.

let activation = new Activation();

// exported for testing
function reset() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
function getActivation() {
  if (activation == null) {
    activation = new Activation();
  }
  return activation;
}

function getNotifierByConnection(connection) {
  return getActivation().notifiers.getForConnection(connection);
}

function getFileVersionOfEditor(editor) {
  return getFileVersionOfBuffer(editor.getBuffer());
}