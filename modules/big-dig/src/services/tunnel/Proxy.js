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

function _ProxyConfigUtils() {
  const data = require("./ProxyConfigUtils");

  _ProxyConfigUtils = function () {
    return data;
  };

  return data;
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
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('tunnel-proxy');

class Proxy extends _events.default {
  constructor(tunnelId, tunnelConfig, transport) {
    super();
    this._tunnelId = tunnelId;
    this._tunnelConfig = tunnelConfig;
    this._transport = transport;
    this._server = null;
    this._socketByClientId = new Map();
  }

  static async createProxy(tunnelId, tunnelConfig, transport) {
    const proxy = new Proxy(tunnelId, tunnelConfig, transport);
    await proxy.startListening();
    return proxy;
  }

  async startListening() {
    return new Promise((resolve, reject) => {
      this._server = _net.default.createServer(socket => {
        const clientId = socket.remotePort;

        this._sendMessage({
          event: 'connection',
          clientId,
          tunnelId: this._tunnelId
        }); // forward events over the transport
        // NOTE: Needs to be explicit otherwise Flow will complain about the
        // type. We prefer this as opposed to using `any` types in such important infra code.


        socket.on('timeout', arg => {
          this._sendMessage({
            event: 'timeout',
            arg,
            clientId,
            tunnelId: this._tunnelId
          });
        });
        socket.on('end', arg => {
          this._sendMessage({
            event: 'end',
            arg,
            clientId,
            tunnelId: this._tunnelId
          });
        });
        socket.on('close', arg => {
          this._sendMessage({
            event: 'close',
            arg,
            clientId,
            tunnelId: this._tunnelId
          });
        });
        socket.on('data', arg => {
          this._sendMessage({
            event: 'data',
            arg,
            clientId,
            tunnelId: this._tunnelId
          });
        });
        socket.on('error', error => {
          logger.error('error on socket: ', error);

          this._sendMessage({
            event: 'error',
            error,
            tunnelId: this._tunnelId,
            clientId
          });

          socket.destroy(error);
        });
        socket.on('close', () => this._deleteSocket(clientId));

        this._socketByClientId.set(clientId, socket);
      });

      this._server.on('error', error => {
        logger.error(`error when listening on ${(0, _ProxyConfigUtils().getProxyConfigDescriptor)(this._tunnelConfig.local)}: `, error);

        this._sendMessage({
          event: 'proxyError',
          tunnelConfig: this._tunnelConfig,
          error,
          tunnelId: this._tunnelId
        });

        reject(error);
      });

      if (!this._server) {
        throw new Error("Invariant violation: \"this._server\"");
      }

      this._server.listen(this._tunnelConfig.local, () => {
        logger.info(`successfully started listening on ${(0, _ProxyConfigUtils().getProxyConfigDescriptor)(this._tunnelConfig.local)}`); // send a message to create the SocketManager

        this._sendMessage({
          event: 'proxyCreated',
          proxyConfig: this._tunnelConfig.remote,
          tunnelId: this._tunnelId
        });

        resolve();
      });
    });
  }

  getId() {
    return this._tunnelId;
  }

  receive(msg) {
    switch (msg.event) {
      case 'data':
        this._forwardData(msg.clientId, msg.arg);

        return;

      case 'close':
        this._ensureSocketClosed(msg.clientId);

        return;

      case 'error':
        this._destroySocket(msg.clientId, msg.error);

        return;

      case 'end':
        this._endSocket(msg.clientId);

        return;

      default:
        throw new Error(`Invalid tunnel message: ${msg.event}`);
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
    this._transport.send(_Encoder().default.encode(msg));
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
      event: 'proxyClosed',
      tunnelId: this._tunnelId
    });
  }

}

exports.Proxy = Proxy;