'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Activation = undefined;
exports.reset = reset;
exports.getNotifierByConnection = getNotifierByConnection;
exports.getFileVersionOfBuffer = getFileVersionOfBuffer;
exports.getFileVersionOfEditor = getFileVersionOfEditor;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
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

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._bufferSubscriptions = new Map();

    const notifiers = new (_NotifiersByConnection || _load_NotifiersByConnection()).NotifiersByConnection();
    this.notifiers = notifiers;
    this._disposables.add(notifiers);

    this._disposables.add((0, (_textBuffer || _load_textBuffer()).observeBufferOpen)().subscribe(buffer => {
      const path = buffer.getPath();
      // Empty files don't need to be monitored.
      if (path == null || this._bufferSubscriptions.has(path)) {
        return;
      }
      this._createBufferSubscription(path, buffer);
    }));
  }

  _createBufferSubscription(path, buffer) {
    const bufferSubscription = new (_BufferSubscription || _load_BufferSubscription()).BufferSubscription(this.notifiers, buffer);
    this._bufferSubscriptions.set(path, bufferSubscription);
    const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(bufferSubscription);
    subscriptions.add((0, (_textBuffer || _load_textBuffer()).observeBufferCloseOrRename)(buffer).subscribe(closeEvent => {
      this._bufferSubscriptions.delete(path);
      this._disposables.remove(subscriptions);
      subscriptions.dispose();
    }));
    this._disposables.add(subscriptions);
    return bufferSubscription;
  }

  getVersion(buffer) {
    const path = buffer.getPath();

    if (!(path != null)) {
      throw new Error('Invariant violation: "path != null"');
    } // Guaranteed when called below.


    let bufferSubscription = this._bufferSubscriptions.get(path);
    if (bufferSubscription == null) {
      // In rare situations, the buffer subscription may not have been created
      // when initially opened above (e.g. exceptions).
      // It's fine to just create the subscription at this point.
      bufferSubscription = this._createBufferSubscription(path, buffer);
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-open-files').warn(`Did not register open event for buffer ${path}. Manually creating subscription`);
    }
    return bufferSubscription.getVersion();
  }

  dispose() {
    this._disposables.dispose();
    this._bufferSubscriptions.clear();
  }
}

exports.Activation = Activation; // Mutable for testing.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let activation = new Activation();

// exported for testing
function reset() {
  if (activation != null) {
    activation.dispose();
  }
  activation = null;
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

async function getFileVersionOfBuffer(buffer) {
  const filePath = buffer.getPath();
  const notifier = await getActivation().notifiers.getForUri(filePath);
  if (notifier == null || buffer.isDestroyed()) {
    return null;
  }

  if (!(filePath != null)) {
    throw new Error('Invariant violation: "filePath != null"');
  }

  return {
    notifier,
    filePath,
    version: getActivation().getVersion(buffer)
  };
}

function getFileVersionOfEditor(editor) {
  return getFileVersionOfBuffer(editor.getBuffer());
}