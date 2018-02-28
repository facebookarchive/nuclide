'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NuclideSocket = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _url = _interopRequireDefault(require('url'));

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _uuid;

function _load_uuid() {
  return _uuid = _interopRequireDefault(require('uuid'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _WebSocketTransport;

function _load_WebSocketTransport() {
  return _WebSocketTransport = require('./WebSocketTransport');
}

var _QueuedAckTransport;

function _load_QueuedAckTransport() {
  return _QueuedAckTransport = require('./QueuedAckTransport');
}

var _XhrConnectionHeartbeat;

function _load_XhrConnectionHeartbeat() {
  return _XhrConnectionHeartbeat = require('../client/XhrConnectionHeartbeat');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-socket');

const PING_SEND_INTERVAL = 5000;
const PING_WAIT_INTERVAL = 5000;

const INITIAL_RECONNECT_TIME_MS = 10;
const MAX_RECONNECT_TIME_MS = 5000;

// The Nuclide Socket class does several things:
//   - Provides a transport mechanism for sending/receiving JSON messages
//   - Provides a transport layer for xhr requests
//   - monitors connection with a heartbeat (over xhr) and automatically attempts to reconnect
//   - caches JSON messages when the connection is down and retries on reconnect
//
// Can be in one of the following states:
//   - Connected - everything healthy
//   - Disconnected - Was connected, but connection died. Will attempt to reconnect.
//   - Closed - No longer connected. May not send/receive messages. Cannot be resurected.
//
// Publishes the following events:
//   - status(boolean): on connect/disconnect
//   - connect: on first Connection
//   - reconnect: on reestablishing connection after a disconnect
//   - message(message: Object): on receipt fo JSON message
//   - heartbeat: On receipt of successful heartbeat
//   - heartbeat.error({code, originalCode, message}): On failure of heartbeat
class NuclideSocket {
  // ID from a setTimeout() call.
  constructor(serverUri, heartbeatChannel, options, protocolLogger) {
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();
    this._serverUri = serverUri;
    this._options = options;
    this._heartbeatChannel = heartbeatChannel;
    // TODO: ACK can be removed after the release of 0.282.
    this.id = 'ACK' + (_uuid || _load_uuid()).default.v4();
    this._pingTimer = null;
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    this._reconnectTimer = null;
    this._previouslyConnected = false;
    this._transport = new (_QueuedAckTransport || _load_QueuedAckTransport()).QueuedAckTransport(this.id, null, protocolLogger);

    this._transport.onDisconnect(() => {
      if (this.isDisconnected()) {
        this._emitter.emit('status', false);
        this._emitter.emit('disconnect');
        this._scheduleReconnect();
      }
    });

    const { protocol, host, path } = _url.default.parse(serverUri);

    if (!(host != null)) {
      throw new Error('Invariant violation: "host != null"');
    }

    const pathString = path != null ? path : '';
    this._websocketUri = `ws${protocol === 'https:' ? 's' : ''}://${host}${pathString}`;

    logger.info(`websocket uri: ${this._websocketUri}`);

    this._heartbeat = new (_XhrConnectionHeartbeat || _load_XhrConnectionHeartbeat()).XhrConnectionHeartbeat(serverUri, this._heartbeatChannel, options);
    this._heartbeat.onConnectionRestored(() => {
      if (this.isDisconnected()) {
        this._scheduleReconnect();
      }
    });

    this._reconnect();
  }

  getHeartbeat() {
    return this._heartbeat;
  }

  isConnected() {
    return this._transport != null && this._transport.getState() === 'open';
  }

  isDisconnected() {
    return this._transport != null && this._transport.getState() === 'disconnected';
  }

  waitForConnect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        return resolve();
      } else {
        this.onConnect(resolve);
        this.onReconnect(resolve);
      }
    });
  }

  _reconnect() {
    var _this = this;

    if (!this.isDisconnected()) {
      throw new Error('Invariant violation: "this.isDisconnected()"');
    }

    const websocket = new (_ws || _load_ws()).default(this._websocketUri, this._options);

    // Need to add this otherwise unhandled errors during startup will result
    // in uncaught exceptions. This is due to EventEmitter treating 'error'
    // events specially.
    const onSocketError = error => {
      logger.warn(`WebSocket Error while connecting... ${error.message}`);
      if (this.isDisconnected()) {
        logger.info('WebSocket reconnecting after error.');
        this._scheduleReconnect();
      }
    };
    websocket.on('error', onSocketError);

    const onSocketOpen = (() => {
      var _ref = (0, _asyncToGenerator.default)(function* () {
        logger.info(`sending the id: ${_this.id}`);
        const sendIdResult = yield sendOneMessage(websocket, _this.id);
        switch (sendIdResult.kind) {
          case 'close':
            websocket.close();
            logger.info('WebSocket closed before sending id handshake');
            if (_this.isDisconnected()) {
              logger.info('WebSocket reconnecting after closed.');
              _this._scheduleReconnect();
            }
            break;
          case 'error':
            websocket.close();
            logger.error('WebSocket Error before sending id handshake', sendIdResult.message);
            if (_this.isDisconnected()) {
              logger.info('WebSocket reconnecting after error.');
              _this._scheduleReconnect();
            }
            break;
          case 'success':
            if (_this.isDisconnected()) {
              const ws = new (_WebSocketTransport || _load_WebSocketTransport()).WebSocketTransport(_this.id, websocket);
              const pingId = (_uuid || _load_uuid()).default.v4();
              ws.onClose(function () {
                _this._clearPingTimer();
              });
              ws.onError(function (error) {
                ws.close();
              });
              ws.onPong(function (data) {
                if (pingId === data) {
                  _this._schedulePing(pingId, ws);
                } else {
                  logger.error('pingId mismatch');
                }
              });
              ws.onMessage().subscribe(function () {
                _this._schedulePing(pingId, ws);
              });
              _this._schedulePing(pingId, ws);

              if (!(_this._transport != null)) {
                throw new Error('Invariant violation: "this._transport != null"');
              }

              _this._transport.reconnect(ws);
              websocket.removeListener('error', onSocketError);
              _this._emitter.emit('status', true);
              if (_this._previouslyConnected) {
                logger.info('WebSocket reconnected');
                _this._emitter.emit('reconnect');
              } else {
                logger.info('WebSocket connected');
                _this._emitter.emit('connect');
              }
              _this._previouslyConnected = true;
              _this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
            }
            break;
        }
      });

      return function onSocketOpen() {
        return _ref.apply(this, arguments);
      };
    })();
    websocket.on('open', onSocketOpen);
  }

  _schedulePing(data, ws) {
    this._clearPingTimer();
    this._pingTimer = setTimeout(() => {
      ws.ping(data);
      this._pingTimer = setTimeout(() => {
        logger.warn('Failed to receive pong in response to ping');
        ws.close();
      }, PING_WAIT_INTERVAL);
    }, PING_SEND_INTERVAL);
  }

  _clearPingTimer() {
    if (this._pingTimer != null) {
      clearTimeout(this._pingTimer);
      this._pingTimer = null;
    }
  }

  _scheduleReconnect() {
    if (this._reconnectTimer) {
      return;
    }
    // Exponential reconnect time trials.
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this.isDisconnected()) {
        this._reconnect();
      }
    }, this._reconnectTime);
    this._reconnectTime = this._reconnectTime * 2;
    if (this._reconnectTime > MAX_RECONNECT_TIME_MS) {
      this._reconnectTime = MAX_RECONNECT_TIME_MS;
    }
  }

  _clearReconnectTimer() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  send(message) {
    if (!(this._transport != null)) {
      throw new Error('Invariant violation: "this._transport != null"');
    }

    this._transport.send(message);
  }

  // Resolves if the connection looks healthy.
  // Will reject quickly if the connection looks unhealthy.
  testConnection() {
    return this._heartbeat.sendHeartBeat();
  }

  getAddress() {
    return this._serverUri;
  }

  getServerUri() {
    return this._serverUri;
  }

  getServerPort() {
    const { port } = _url.default.parse(this.getServerUri());
    if (port == null) {
      return null;
    }
    return Number(port);
  }

  close() {
    const transport = this._transport;
    if (transport != null) {
      this._transport = null;
      transport.close();
    }
    this._clearReconnectTimer();
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    this._heartbeat.close();
  }

  isClosed() {
    return this._transport == null;
  }

  onMessage() {
    if (!(this._transport != null)) {
      throw new Error('Invariant violation: "this._transport != null"');
    }

    return this._transport.onMessage();
  }

  onStatus(callback) {
    return this._emitter.on('status', callback);
  }

  onConnect(callback) {
    return this._emitter.on('connect', callback);
  }

  onReconnect(callback) {
    return this._emitter.on('reconnect', callback);
  }

  onDisconnect(callback) {
    return this._emitter.on('disconnect', callback);
  }
}

exports.NuclideSocket = NuclideSocket;


function sendOneMessage(socket, message) {
  return new Promise((resolve, reject) => {
    function finish(result) {
      onError.dispose();
      onClose.dispose();
      resolve(result);
    }
    const onError = (0, (_event || _load_event()).attachEvent)(socket, 'event', err => finish({ kind: 'error', message: err }));
    const onClose = (0, (_event || _load_event()).attachEvent)(socket, 'close', () => finish({ kind: 'close' }));
    socket.send(message, error => {
      if (error == null) {
        finish({ kind: 'success' });
      } else {
        finish({ kind: 'error', message: error.toString() });
      }
    });
  });
}