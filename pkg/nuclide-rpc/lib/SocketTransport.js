"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocketTransport = void 0;

function _StreamTransport() {
  const data = require("./StreamTransport");

  _StreamTransport = function () {
    return data;
  };

  return data;
}

function _eventKit() {
  const data = require("event-kit");

  _eventKit = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class SocketTransport extends _StreamTransport().StreamTransport {
  constructor(socket, messageLogger = (direction, message) => {
    return;
  }) {
    super(socket, socket, messageLogger);
    this._socket = socket;
    this._emitter = new (_eventKit().Emitter)();
    socket.on('close', () => {
      if (!this.isClosed()) {
        this.close();
      }

      this._emitter.emit('close');
    });
    const connectionDeferred = new (_promise().Deferred)();
    socket.on('connect', connectionDeferred.resolve);
    socket.on('error', error => connectionDeferred.reject(error));
    this._onConnect = connectionDeferred;
  } // Returns a promise which resolves on connection or rejects if connection fails.


  onConnected() {
    return this._onConnect.promise;
  }

  onClose(callback) {
    return this._emitter.on('close', callback);
  }

  close() {
    super.close(); // Send the FIN packet ...

    this._socket.end(); // Then hammer it closed


    this._socket.destroy();

    this._emitter.dispose();
  }

}

exports.SocketTransport = SocketTransport;