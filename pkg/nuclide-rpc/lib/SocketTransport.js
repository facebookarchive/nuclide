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
exports.SocketTransport = undefined;

var _StreamTransport;

function _load_StreamTransport() {
  return _StreamTransport = require('./StreamTransport');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

let SocketTransport = exports.SocketTransport = class SocketTransport extends (_StreamTransport || _load_StreamTransport()).StreamTransport {

  constructor(socket) {
    let messageLogger = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (direction, message) => {
      return;
    };

    // $FlowIssue: Sockets are a stream$Duplex, but flow doesn't handle this.
    super(socket, socket, messageLogger);
    this._socket = socket;
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();

    socket.on('close', () => {
      if (!this.isClosed()) {
        this.close();
      }
      this._emitter.emit('close');
    });

    const connectionDeferred = new (_promise || _load_promise()).Deferred();
    socket.on('connect', connectionDeferred.resolve);
    socket.on('error', error => connectionDeferred.reject(error));
    this._onConnect = connectionDeferred;
  }

  // Returns a promise which resolves on connection or rejects if connection fails.
  onConnected() {
    return this._onConnect.promise;
  }

  onClose(callback) {
    return this._emitter.on('close', callback);
  }

  close() {
    super.close();

    // Send the FIN packet ...
    this._socket.end();
    // Then hammer it closed
    this._socket.destroy();

    this._emitter.dispose();
  }
};