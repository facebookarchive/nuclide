'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionFactory = exports.Connection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _net = _interopRequireDefault(require('net'));

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

class Connection {

  constructor(tunnelHost, remoteSocket) {
    trace('Connection: creating connection: ' + JSON.stringify(tunnelHost));
    this._remoteSocket = remoteSocket;

    this._socket = _net.default.createConnection({ port: tunnelHost.port, family: tunnelHost.family }, socket => {
      trace('Connection: connection created and ready to write data.');
    });

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._socket.end(), this._remoteSocket);

    this._socket.on('error', err => {
      // TODO: we should find a way to send the error back
      //       to the remote socket
      trace('Connection error: ' + JSON.stringify(err));
      this._socket.end();
    });

    this._socket.on('close', () => {
      this.dispose();
    });

    this._socket.on('data', data => {
      // There seems to be a situation where
      // this event is fired and data isn't a Buffer.
      // It causes the nuclide server to crash when
      // attempting to marshal the data
      if (data instanceof Buffer) {
        this._remoteSocket.write(data);
      }
    });
  }

  write(msg) {
    this._socket.write(msg);
  }

  dispose() {
    trace('Connection: disposing connection');
    this._disposables.dispose();
  }
}

exports.Connection = Connection;
class ConnectionFactory {
  constructor() {}

  createConnection(tunnelHost, socket) {
    return (0, _asyncToGenerator.default)(function* () {
      return new Connection(tunnelHost, socket);
    })();
  }

  dispose() {
    trace('disposing connection.');
  }
}

exports.ConnectionFactory = ConnectionFactory;
function trace(message) {
  (0, (_log4js || _load_log4js()).getLogger)('SocketService').trace(message);
}