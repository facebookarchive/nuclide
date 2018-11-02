"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocketServer = void 0;

var _net = _interopRequireDefault(require("net"));

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _RpcConnection() {
  const data = require("./RpcConnection");

  _RpcConnection = function () {
    return data;
  };

  return data;
}

function _SocketTransport() {
  const data = require("./SocketTransport");

  _SocketTransport = function () {
    return data;
  };

  return data;
}

function _ServiceRegistry() {
  const data = require("./ServiceRegistry");

  _ServiceRegistry = function () {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// An RPC server which listens for connections on a localhost socket.
// TODO: Consider extending with more socket listening options.
class SocketServer {
  constructor(serviceRegistry) {
    this._emitter = new (_eventKit().Emitter)();
    this._connections = new Set();
    this._serviceRegistry = serviceRegistry;
    this._listening = new (_promise().Deferred)();
    this._server = _net.default.createServer();

    this._server.on('connection', socket => {
      this._onConnection(socket);
    });

    this._server.on('error', error => {
      this._onError(error);
    });

    this._server.listen(0, 'localhost', undefined, () => {
      this._listening.resolve();
    });
  }

  _onConnection(socket) {
    const transport = new (_SocketTransport().SocketTransport)(socket);

    const connection = _RpcConnection().RpcConnection.createServer(this._serviceRegistry, transport, // Track calls with a sampling rate of 1/10.
    {
      trackSampleRate: 10
    });

    transport.onClose(() => {
      this._connections.delete(connection);
    });

    this._connections.add(connection);
  }

  _onError(error) {
    this._emitter.emit('error', error);
  }

  onError(callback) {
    return this._emitter.on('error', callback);
  }

  untilListening() {
    return this._listening.promise;
  }

  async getAddress() {
    await this.untilListening();
    return this._server.address();
  } // Close all open connections and shutdown the server.


  dispose() {
    for (const connection of this._connections) {
      connection.getTransport().close();
    }

    this._connections.clear();

    this._listening.reject(new Error('Closing SocketServer'));

    this._server.close();

    this._emitter.dispose();
  }

}

exports.SocketServer = SocketServer;