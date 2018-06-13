'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Proxy = undefined;

var _net = _interopRequireDefault(require('net'));

var _Encoder;

function _load_Encoder() {
  return _Encoder = _interopRequireDefault(require('./Encoder'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('tunnel-proxy'); /**
                                                                            * Copyright (c) 2017-present, Facebook, Inc.
                                                                            * All rights reserved.
                                                                            *
                                                                            * This source code is licensed under the BSD-style license found in the
                                                                            * LICENSE file in the root directory of this source tree. An additional grant
                                                                            * of patent rights can be found in the PATENTS file in the same directory.
                                                                            *
                                                                            *  strict-local
                                                                            * @format
                                                                            */

class Proxy {

  constructor(tunnelId, localPort, remotePort, useIPv4, transport) {
    this._tunnelId = tunnelId;
    this._localPort = localPort;
    this._remotePort = remotePort;
    this._transport = transport;
    this._useIPv4 = useIPv4;
    this._server = null;
    this._subscription = null;
    this._socketByClientId = new Map();
  }

  static async createProxy(tunnelId, localPort, remotePort, useIPv4, transport) {
    const proxy = new Proxy(tunnelId, localPort, remotePort, useIPv4, transport);
    await proxy.startListening();

    return proxy;
  }

  async startListening() {
    return new Promise((resolve, reject) => {
      this._server = _net.default.createServer(socket => {
        const clientId = socket.remotePort;
        this._socketByClientId.set(clientId, socket);
        this._sendMessage({
          event: 'connection',
          clientId
        });

        // forward events over the transport
        ['timeout', 'error', 'end', 'close', 'data'].forEach(event => {
          socket.on(event, arg => {
            logger.trace(`socket ${event}: `, arg);
            this._sendMessage({
              event,
              arg,
              clientId
            });
          });
        });
      });

      this._server.listen({ port: this._localPort }, () => {
        // send a message to create the SocketManager
        this._sendMessage({
          event: 'proxyCreated',
          port: this._localPort,
          useIPv4: this._useIPv4,
          remotePort: this._remotePort
        });
        resolve();
      });
    });
  }

  getId() {
    return this._tunnelId;
  }

  receive(msg) {
    const clientId = msg.clientId;

    if (!(clientId != null)) {
      throw new Error('Invariant violation: "clientId != null"');
    }

    const socket = this._socketByClientId.get(clientId);

    if (!socket) {
      throw new Error('Invariant violation: "socket"');
    }

    const arg = msg.arg;

    if (!(arg != null)) {
      throw new Error('Invariant violation: "arg != null"');
    }

    if (msg.event === 'data') {
      socket.write(arg);
    }
  }

  _sendMessage(msg) {
    this._transport.send((_Encoder || _load_Encoder()).default.encode(Object.assign({ tunnelId: this._tunnelId }, msg)));
  }

  close() {
    if (this._server != null) {
      this._server.close();
      this._server = null;
    }
    if (this._subscription != null) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
    this._socketByClientId.forEach(socket => {
      socket.end();
    });

    this._sendMessage({ event: 'proxyClosed' });
  }
}
exports.Proxy = Proxy;