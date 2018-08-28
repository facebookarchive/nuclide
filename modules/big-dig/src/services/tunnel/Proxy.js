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

        this._sendMessage({
          event: 'connection',
          clientId
        }); // forward events over the transport


        ['timeout', 'end', 'close', 'data'].forEach(event => {
          socket.on(event, arg => {
            this._sendMessage({
              event,
              arg,
              clientId
            });
          });
        });
        socket.on('error', error => {
          logger.error('error on socket: ', error);

          this._sendMessage({
            event: 'error',
            error,
            clientId
          });

          socket.destroy(error);
        });
        socket.on('close', () => this._deleteSocket(clientId));

        this._socketByClientId.set(clientId, socket);
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
    const {
      clientId
    } = msg;

    if (!(clientId != null)) {
      throw new Error("Invariant violation: \"clientId != null\"");
    }

    if (msg.event === 'data') {
      if (!(msg.arg != null)) {
        throw new Error("Invariant violation: \"msg.arg != null\"");
      }

      this._forwardData(clientId, msg.arg);
    } else if (msg.event === 'close') {
      this._ensureSocketClosed(clientId);
    } else if (msg.event === 'error') {
      if (!(clientId != null)) {
        throw new Error("Invariant violation: \"clientId != null\"");
      }

      if (!(msg.error != null)) {
        throw new Error("Invariant violation: \"msg.error != null\"");
      }

      this._destroySocket(clientId, msg.error);
    } else if (msg.event === 'end') {
      this._endSocket(clientId);
    }
  }

  _forwardData(id, data) {
    const socket = this._socketByClientId.get(id);

    if (socket != null) {
      socket.write(data);
    } else {
      logger.error(`data loss - socket already closed or nonexistent: ${id}`);
    }
  }

  _deleteSocket(id) {
    logger.info(`socket ${id} closed`);

    const socket = this._socketByClientId.get(id);

    if (!socket) {
      throw new Error("Invariant violation: \"socket\"");
    }

    socket.removeAllListeners();

    this._socketByClientId.delete(id);
  }

  _destroySocket(id, error) {
    const socket = this._socketByClientId.get(id);

    if (socket != null) {
      socket.destroy(error);
    } else {
      logger.info(`no socket ${id} found for ${error.message}, this is expected if it was closed recently`);
    }
  }

  _endSocket(id) {
    const socket = this._socketByClientId.get(id);

    if (socket != null) {
      socket.end();
    } else {
      logger.info(`no socket ${id} found to be ended, this is expected if it was closed recently`);
    }
  }

  _ensureSocketClosed(id) {
    const socket = this._socketByClientId.get(id);

    if (socket != null) {
      logger.info(`socket ${id} wasn't closed in time, force closing it`);
      socket.destroy();
    }
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