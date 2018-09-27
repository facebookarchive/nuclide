"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reset = reset;
exports.getNotifierByConnection = getNotifierByConnection;
exports.getFileVersionOfBuffer = getFileVersionOfBuffer;
exports.getFileVersionOfEditor = getFileVersionOfEditor;
exports.Activation = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _textBuffer() {
  const data = require("../../commons-atom/text-buffer");

  _textBuffer = function () {
    return data;
  };

  return data;
}

function _NotifiersByConnection() {
  const data = require("./NotifiersByConnection");

  _NotifiersByConnection = function () {
    return data;
  };

  return data;
}

function _BufferSubscription() {
  const data = require("./BufferSubscription");

  _BufferSubscription = function () {
    return data;
  };

  return data;
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
 * @format
 */
class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)();
    this._bufferSubscriptions = new Map();
    const notifiers = new (_NotifiersByConnection().NotifiersByConnection)();
    this.notifiers = notifiers;

    this._disposables.add(notifiers);

    this._disposables.add((0, _textBuffer().observeBufferOpen)().subscribe(buffer => {
      const path = buffer.getPath(); // Empty files don't need to be monitored.

      if (path == null || this._bufferSubscriptions.has(path)) {
        return;
      }

      this._createBufferSubscription(path, buffer);
    }));
  }

  _createBufferSubscription(path, buffer) {
    const bufferSubscription = new (_BufferSubscription().BufferSubscription)(this.notifiers, buffer);

    this._bufferSubscriptions.set(path, bufferSubscription);

    const subscriptions = new (_UniversalDisposable().default)(bufferSubscription);
    subscriptions.add((0, _textBuffer().observeBufferCloseOrRename)(buffer).subscribe(closeEvent => {
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
      throw new Error("Invariant violation: \"path != null\"");
    } // Guaranteed when called below.


    let bufferSubscription = this._bufferSubscriptions.get(path);

    if (bufferSubscription == null) {
      // In rare situations, the buffer subscription may not have been created
      // when initially opened above (e.g. exceptions).
      // It's fine to just create the subscription at this point.
      bufferSubscription = this._createBufferSubscription(path, buffer);
      (0, _log4js().getLogger)('nuclide-open-files').warn(`Did not register open event for buffer ${path}. Manually creating subscription`);
    }

    return bufferSubscription.getVersion();
  }

  dispose() {
    this._disposables.dispose();

    this._bufferSubscriptions.clear();
  }

} // Mutable for testing.


exports.Activation = Activation;
let activation = new Activation(); // exported for testing

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
    throw new Error("Invariant violation: \"filePath != null\"");
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