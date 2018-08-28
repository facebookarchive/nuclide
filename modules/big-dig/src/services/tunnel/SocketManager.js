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

    if (msg.event === 'connection') {
      this._createConnection(clientId);
    } else if (msg.event === 'data') {
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

  _createConnection(clientId) {
    const connectOptions = {
      port: this._port,
      family: this._useIPv4 ? 4 : 6
    };
    logger.info(`creating socket with ${JSON.stringify(connectOptions)}`);

    const socket = _net.default.createConnection(connectOptions); // forward events over the transport


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
    socket.on('close', () => {
      this._deleteSocket(clientId);
    });

    this._socketByClientId.set(clientId, socket);
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
    this._socketByClientId.forEach(socket => {
      socket.end();
    });
  }

}

exports.SocketManager = SocketManager;