'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebSocketTransport = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _https = _interopRequireDefault(require('https'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)();

// An unreliable transport for sending JSON formatted messages
// over a WebSocket
//
// onClose handlers are guaranteed to be called exactly once.
// onMessage handlers are guaranteed to not be called after onClose has been called.
// send(data) yields false if the message failed to send, true on success.
// onClose handlers will be called before close() returns.
class WebSocketTransport {

  constructor(clientId, agent, socket) {
    this.id = clientId;
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();
    this._agent = agent;
    this._socket = socket;
    this._messages = new _rxjsBundlesRxMinJs.Subject();

    logger.info('Client #%s connecting with a new socket!', this.id);
    socket.on('message', (data, flags) => {
      this._onSocketMessage(data);
    });

    socket.on('close', () => {
      if (this._socket != null) {
        if (!(this._socket === socket)) {
          throw new Error('Invariant violation: "this._socket === socket"');
        }

        logger.info('Client #%s socket close recieved on open socket!', this.id);
        this._setClosed();
      } else {
        logger.info('Client #%s recieved socket close on already closed socket!', this.id);
      }
    });

    socket.on('error', e => {
      if (this._socket != null) {
        logger.error(`Client #${this.id} error: ${e.message}`);
        this._emitter.emit('error', e);
      } else {
        logger.error(`Client #${this.id} error after close: ${e.message}`);
      }
    });

    socket.on('pong', (data, flags) => {
      if (this._socket != null) {
        // data may be a Uint8Array
        this._emitter.emit('pong', data != null ? String(data) : data);
      } else {
        logger.error('Received socket pong after connection closed');
      }
    });
  }

  /** @return `wss://hostname:port`. */
  getAddress() {
    const socket = this._socket;

    if (!socket) {
      throw new Error('Invariant violation: "socket"');
    }

    return socket.url;
  }

  // TODO(mbolin): Remove this once we have BigDigClient working. Until then,
  // this demonstrates how to make a secure request to the HTTPS server.
  testAgent() {
    const { hostname, port } = require('url').parse(this.getAddress());
    // eslint-disable-next-line no-console
    console.log(`will connect to ${String(hostname)} ${String(port)}`);
    const request = _https.default.request({
      hostname,
      port,
      path: '/test',
      method: 'GET',
      agent: this._agent
    }, response => {
      // eslint-disable-next-line no-console
      console.log(`received response in testAgent: ${response.statusCode}`);
    });
    request.on('error', e => {
      // eslint-disable-next-line no-console
      console.error(`problem with request: ${e.message}`);
    });
    request.end();
  }

  _onSocketMessage(message) {
    if (this._socket == null) {
      logger.error('Received socket message after connection closed');
      return;
    }
    this._messages.next(message);
  }

  onMessage() {
    return this._messages;
  }

  onClose(callback) {
    return this._emitter.on('close', callback);
  }

  onError(callback) {
    return this._emitter.on('error', callback);
  }

  send(message) {
    const socket = this._socket;
    if (socket == null) {
      logger.error('Attempt to send socket message after connection closed', new Error());
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      const data = message;
      socket.send(data, err => {
        if (err != null) {
          logger.warn('Failed sending socket message to client:', this.id, message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  // The WS socket automatically responds to pings with pongs.
  ping(data) {
    if (this._socket != null) {
      this._socket.ping(data);
    } else {
      logger.error('Attempted to send socket ping after connection closed');
    }
  }

  onPong(callback) {
    return this._emitter.on('pong', callback);
  }

  close() {
    if (this._socket != null) {
      // The call to socket.close may or may not cause our handler to be called
      this._socket.close();
      this._setClosed();
    }
  }

  isClosed() {
    return this._socket == null;
  }

  _setClosed() {
    if (this._socket != null) {
      // In certain (Error) conditions socket.close may not emit the on close
      // event synchronously.
      this._socket = null;
      this._emitter.emit('close');
    }
  }
}
exports.WebSocketTransport = WebSocketTransport;