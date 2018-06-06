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

var _Encoder;

function _load_Encoder() {
  return _Encoder = _interopRequireDefault(require('./Encoder'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('tunnel-socket-manager'); /**
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

class SocketManager {

  constructor(tunnelId, port, useIPv4, transport) {
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
    }
  }

  _createConnection(message) {
    const connectOptions = {
      port: this._port,
      family: this._useIPv4 ? 4 : 6
    };

    logger.info(`creating socket with ${JSON.stringify(connectOptions)}`);
    const socket = _net.default.createConnection(connectOptions);

    socket.on('error', err => {
      logger.error(err);
    });

    socket.on('data', data => {
      this._sendMessage({
        event: 'data',
        arg: data,
        clientId: message.clientId,
        tunnelId: this._tunnelId
      });
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

  _sendMessage(msg) {
    this._transport.send((_Encoder || _load_Encoder()).default.encode(msg));
  }

  close() {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }
    this._socketByClientId.forEach(socket => {
      socket.end();
    });
  }
}
exports.SocketManager = SocketManager;