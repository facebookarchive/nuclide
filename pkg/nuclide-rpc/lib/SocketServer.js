'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocketServer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _net = _interopRequireDefault(require('net'));

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _RpcConnection;

function _load_RpcConnection() {
  return _RpcConnection = require('./RpcConnection');
}

var _SocketTransport;

function _load_SocketTransport() {
  return _SocketTransport = require('./SocketTransport');
}

var _ServiceRegistry;

function _load_ServiceRegistry() {
  return _ServiceRegistry = require('./ServiceRegistry');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// An RPC server which listens for connections on a localhost socket.
// TODO: Consider extending with more socket listening options.
class SocketServer {

  constructor(serviceRegistry) {
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();
    this._connections = new Set();
    this._serviceRegistry = serviceRegistry;
    this._listening = new (_promise || _load_promise()).Deferred();
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
    const transport = new (_SocketTransport || _load_SocketTransport()).SocketTransport(socket);
    const connection = (_RpcConnection || _load_RpcConnection()).RpcConnection.createServer(this._serviceRegistry, transport);
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

  getAddress() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this.untilListening();
      return _this._server.address();
    })();
  }

  // Close all open connections and shutdown the server.
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
exports.SocketServer = SocketServer; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */