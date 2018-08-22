"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocketManager = void 0;

var _net = _interopRequireDefault(require("net"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _Encoder() {
  const data = _interopRequireDefault(require("./Encoder"));

  _Encoder = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

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
const logger = (0, _log4js().getLogger)('tunnel-socket-manager');

class SocketManager extends _events.default {
  constructor(tunnelId, port, useIPv4, transport) {
    super();
    this._tunnelId = tunnelId;
    this._port = port;
    this._transport = transport;
    this._useIPv4 = useIPv4;
    this._socketByClientId = new Map();
  }

  receive(message) {
    this._handleMessage(message);
  }

  getId() {
    return this._tunnelId;
  }

  _handleMessage(message) {
    if (message.event === 'connection') {
      this._createConnection(message);
    } else if (message.event === 'data') {
      this._forwardData(message);
    } else if (message.event === 'error') {
      this._handleError(message);
    }
  }

  _createConnection(message) {
    const connectOptions = {
      port: this._port,
      family: this._useIPv4 ? 4 : 6
    };
    logger.info(`creating socket with ${JSON.stringify(connectOptions)}`);

    const socket = _net.default.createConnection(connectOptions);

    socket.on('error', error => {
      logger.error(error);

      this._sendMessage({
        event: 'error',
        error,
        clientId: message.clientId,
        tunnelId: this._tunnelId
      });

      socket.end();
    });
    socket.on('data', data => {
      this._sendMessage({
        event: 'data',
        arg: data,
        clientId: message.clientId,
        tunnelId: this._tunnelId
      });
    });
    socket.on('close', () => {
      logger.info(`received close event on socket ${message.clientId} in socketManager`);

      this._sendMessage({
        event: 'close',
        clientId: message.clientId,
        tunnelId: this._tunnelId
      });

      this._socketByClientId.delete(message.clientId);
    });

    this._socketByClientId.set(message.clientId, socket);
  }

  _forwardData(message) {
    const socket = this._socketByClientId.get(message.clientId);

    if (socket != null) {
      socket.write(message.arg);
    } else {
      logger.error('no socket found for this data: ', message);
    }
  }

  _handleError(message) {
    this.emit('error', message.arg);
  }

  _sendMessage(msg) {
    this._transport.send(_Encoder().default.encode(msg));
  }

  close() {
    this._socketByClientId.forEach(socket => {
      socket.end();
    });
  }

}

exports.SocketManager = SocketManager;