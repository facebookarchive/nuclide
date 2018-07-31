"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Proxy = void 0;

var _net = _interopRequireDefault(require("net"));

function _Encoder() {
  const data = _interopRequireDefault(require("./Encoder"));

  _Encoder = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('tunnel-proxy');

class Proxy extends _events.default {
  constructor(tunnelId, localPort, remotePort, useIPv4, transport) {
    super();
    this._tunnelId = tunnelId;
    this._localPort = localPort;
    this._remotePort = remotePort;
    this._transport = transport;
    this._useIPv4 = useIPv4;
    this._server = null;
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
        }); // forward events over the transport


        ['timeout', 'error', 'end', 'close', 'data'].forEach(event => {
          socket.on(event, arg => {
            this._sendMessage({
              event,
              arg,
              clientId
            });
          });
        });
        socket.once('error', error => {
          this._destroySocket(clientId, error);
        });
        socket.once('close', this._closeSocket.bind(this, clientId));
      });

      this._server.on('error', error => {
        this._sendMessage({
          event: 'proxyError',
          port: this._localPort,
          useIpv4: this._useIPv4,
          remotePort: this._remotePort,
          error
        });

        reject(error);
      });

      if (!this._server) {
        throw new Error("Invariant violation: \"this._server\"");
      }

      this._server.listen({
        port: this._localPort
      }, () => {
        logger.info(`successfully started listening on port ${this._localPort}`); // send a message to create the SocketManager

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
      throw new Error("Invariant violation: \"clientId != null\"");
    }

    const socket = this._socketByClientId.get(clientId);

    if (!socket) {
      throw new Error("Invariant violation: \"socket\"");
    }

    const arg = msg.arg;

    if (msg.event === 'data') {
      if (!(arg != null)) {
        throw new Error("Invariant violation: \"arg != null\"");
      }

      socket.write(arg);
    } else if (msg.event === 'close') {
      socket.end();
    } else if (msg.event === 'error') {
      if (!(clientId != null)) {
        throw new Error("Invariant violation: \"clientId != null\"");
      }

      if (!(msg.error != null)) {
        throw new Error("Invariant violation: \"msg.error != null\"");
      }

      this._destroySocket(clientId, msg.error);
    }
  }

  _closeSocket(id) {
    logger.info(`socket ${id} closed`);

    const socket = this._socketByClientId.get(id);

    if (!socket) {
      throw new Error("Invariant violation: \"socket\"");
    }

    socket.removeAllListeners();

    this._socketByClientId.delete(id);
  }

  _destroySocket(id, error) {
    logger.error('error on socket: ', error);

    const socket = this._socketByClientId.get(id);

    if (!socket) {
      throw new Error("Invariant violation: \"socket\"");
    }

    socket.destroy(error);

    this._closeSocket(id);
  }

  _sendMessage(msg) {
    this._transport.send(_Encoder().default.encode(Object.assign({
      tunnelId: this._tunnelId
    }, msg)));
  }

  close() {
    if (this._server != null) {
      this._server.close();

      this._server = null;
    }

    this._socketByClientId.forEach((socket, id) => {
      socket.end();
    });

    this.removeAllListeners();

    this._sendMessage({
      event: 'proxyClosed'
    });
  }

}

exports.Proxy = Proxy;