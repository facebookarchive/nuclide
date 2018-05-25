'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Proxy = undefined;

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

const logger = (0, (_log4js || _load_log4js()).getLogger)('tunnel-proxy');

class Proxy {

  constructor(port, remotePort, transport) {
    this._port = port;
    this._remotePort = remotePort;
    this._transport = transport;
    this._server = null;
    this._subscription = null;
    this._idToSocket = new Map();
  }

  static async createProxy(port, remotePort, transport) {
    const proxy = new Proxy(port, remotePort, transport);
    await proxy.startListening();

    return proxy;
  }

  async startListening() {
    return new Promise((resolve, reject) => {
      this._server = _net.default.createServer(socket => {
        const clientId = socket.remotePort;
        this._idToSocket.set(clientId, socket);
        this._sendMessage({
          event: 'connection',
          clientId
        });

        this._subscription = this._transport.onMessage().map(msg => {
          return JSON.parse(msg);
        }).filter(msg => {
          return msg.clientId === clientId;
        }).subscribe(msg => {
          if (msg.event === 'data') {
            socket.write(Buffer.from(msg.arg, 'base64'));
          }
        });

        socket.on('data', arg => {
          logger.trace('socket data: ', arg);
          this._sendMessage({
            event: 'data',
            arg: arg.toString('base64'),
            clientId
          });
        });

        // forward events over the transport
        ['timeout', 'error', 'end', 'close'].forEach(event => {
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

      this._server.listen({ port: this._port }, () => {
        // send a message to create the connection manager
        this._sendMessage({
          event: 'proxyCreated',
          port: this._port,
          remotePort: this._remotePort
        });
        resolve();
      });
    });
  }

  _sendMessage(msg) {
    this._transport.send(JSON.stringify(msg));
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
    this._idToSocket.forEach(socket => {
      socket.end();
    });
  }
}
exports.Proxy = Proxy;