'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocketManager = undefined;

var _net = _interopRequireDefault(require('net'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const logger = (0, (_log4js || _load_log4js()).getLogger)('tunnel-socket-manager');

class SocketManager {

  constructor(port, transport) {
    this._port = port;
    this._transport = transport;
    this._idToSocket = new Map();
  }

  send(message) {
    this._handleMessage(message);
  }

  _handleMessage(message) {
    logger.trace(`handling this message: ${JSON.stringify(message)}`);
    if (message.event === 'connection') {
      this._createConnection(message);
    } else if (message.event === 'data') {
      this._forwardData(message);
    }
  }

  _createConnection(message) {
    const socket = _net.default.createConnection({ port: this._port });

    socket.on('error', err => {
      logger.error(err);
    });

    socket.on('data', data => {
      this._sendMessage({
        event: 'data',
        arg: data.toString('base64'),
        clientId: message.clientId
      });
    });

    this._idToSocket.set(message.clientId, socket);
  }

  _forwardData(message) {
    const socket = this._idToSocket.get(message.clientId);
    if (socket != null) {
      socket.write(Buffer.from(message.arg, 'base64'));
    } else {
      logger.error('no socket found for this data: ', message);
    }
  }

  _sendMessage(msg) {
    this._transport.send(JSON.stringify(msg));
  }

  close() {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }
    this._idToSocket.forEach(socket => {
      socket.end();
    });
  }
}
exports.SocketManager = SocketManager;