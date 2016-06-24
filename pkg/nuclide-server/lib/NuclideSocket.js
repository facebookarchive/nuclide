Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var _uuid2;

function _uuid() {
  return _uuid2 = _interopRequireDefault(require('uuid'));
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _WebSocketTransport2;

function _WebSocketTransport() {
  return _WebSocketTransport2 = require('./WebSocketTransport');
}

var _QueuedTransport2;

function _QueuedTransport() {
  return _QueuedTransport2 = require('./QueuedTransport');
}

var _XhrConnectionHeartbeat2;

function _XhrConnectionHeartbeat() {
  return _XhrConnectionHeartbeat2 = require('./XhrConnectionHeartbeat');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var logger = require('../../nuclide-logging').getLogger();

var INITIAL_RECONNECT_TIME_MS = 10;
var MAX_RECONNECT_TIME_MS = 5000;

// The Nuclide Socket class does several things:
//   - Provides a transport mechanism for sending/receiving JSON messages
//   - Provides a transport layer for xhr requests
//   - monitors connection with a heartbeat (over xhr) and automatically attempts to reconnect
//   - caches JSON messages when the connection is down and retries on reconnect
//
// Can be in one of the following states:
//   - Connected - everything healthy
//   - Disconnected - Was connected, but connection died. Will attempt to reconnect.
//   - Closed - No longer connected. May not send/recieve messages. Cannot be resurected.
//
// Publishes the following events:
//   - status(boolean): on connect/disconnect
//   - connect: on first Connection
//   - reconnect: on reestablishing connection after a disconnect
//   - message(message: Object): on receipt fo JSON message
//   - heartbeat: On receipt of successful heartbeat
//   - heartbeat.error({code, originalCode, message}): On failure of heartbeat

var NuclideSocket = (function () {
  function NuclideSocket(serverUri, options) {
    var _this = this;

    _classCallCheck(this, NuclideSocket);

    this._emitter = new (_events2 || _events()).EventEmitter();
    this._serverUri = serverUri;
    this._options = options;
    this.id = (_uuid2 || _uuid()).default.v4();
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    this._reconnectTimer = null;
    this._previouslyConnected = false;
    var transport = new (_QueuedTransport2 || _QueuedTransport()).QueuedTransport(this.id);
    this._transport = transport;
    transport.onDisconnect(function () {
      if (_this.isDisconnected()) {
        _this._emitter.emit('status', false);
        _this._emitter.emit('disconnect');
        _this._scheduleReconnect();
      }
    });

    var _default$parse = (_url2 || _url()).default.parse(serverUri);

    var protocol = _default$parse.protocol;
    var host = _default$parse.host;

    this._websocketUri = 'ws' + (protocol === 'https:' ? 's' : '') + '://' + host;

    this._heartbeat = new (_XhrConnectionHeartbeat2 || _XhrConnectionHeartbeat()).XhrConnectionHeartbeat(serverUri, options);
    this._heartbeat.onConnectionRestored(function () {
      _this._scheduleReconnect();
    });

    this._reconnect();
  }

  _createClass(NuclideSocket, [{
    key: 'isConnected',
    value: function isConnected() {
      return this._transport != null && this._transport.getState() === 'open';
    }
  }, {
    key: 'isDisconnected',
    value: function isDisconnected() {
      return this._transport != null && this._transport.getState() === 'disconnected';
    }
  }, {
    key: 'waitForConnect',
    value: function waitForConnect() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (_this2.isConnected()) {
          return resolve();
        } else {
          _this2.onConnect(resolve);
          _this2.onReconnect(resolve);
        }
      });
    }
  }, {
    key: '_reconnect',
    value: function _reconnect() {
      var _this3 = this;

      (0, (_assert2 || _assert()).default)(this.isDisconnected());

      var websocket = new (_ws2 || _ws()).default(this._websocketUri, this._options);

      // Need to add this otherwise unhandled errors during startup will result
      // in uncaught exceptions. This is due to EventEmitter treating 'error'
      // events specially.
      var onSocketError = function onSocketError(error) {
        logger.error('WebSocket Error - attempting connection... ' + error.message);
      };
      websocket.on('error', onSocketError);

      var onSocketOpen = _asyncToGenerator(function* () {
        var sendIdResult = yield sendOneMessage(websocket, _this3.id);
        switch (sendIdResult.kind) {
          case 'close':
            websocket.close();
            logger.info('WebSocket closed before sending id handshake');
            if (_this3.isDisconnected()) {
              logger.info('WebSocket reconnecting after closed.');
              _this3._scheduleReconnect();
            }
            break;
          case 'error':
            websocket.close();
            logger.error('WebSocket Error before sending id handshake', sendIdResult.message);
            if (_this3.isDisconnected()) {
              logger.info('WebSocket reconnecting after error.');
              _this3._scheduleReconnect();
            }
            break;
          case 'success':
            if (_this3.isDisconnected()) {
              (function () {
                var ws = new (_WebSocketTransport2 || _WebSocketTransport()).WebSocketTransport(_this3.id, websocket);
                ws.onError(function (error) {
                  ws.close();
                });
                (0, (_assert2 || _assert()).default)(_this3._transport != null);
                _this3._transport.reconnect(ws);
                websocket.removeListener('error', onSocketError);
                _this3._emitter.emit('status', true);
                if (_this3._previouslyConnected) {
                  logger.info('WebSocket reconnected');
                  _this3._emitter.emit('reconnect');
                } else {
                  logger.info('WebSocket connected');
                  _this3._emitter.emit('connect');
                }
                _this3._previouslyConnected = true;
                _this3._reconnectTime = INITIAL_RECONNECT_TIME_MS;
              })();
            }
            break;
        }
      });
      websocket.on('open', onSocketOpen);
    }
  }, {
    key: '_scheduleReconnect',
    value: function _scheduleReconnect() {
      var _this4 = this;

      if (this._reconnectTimer) {
        return;
      }
      // Exponential reconnect time trials.
      this._reconnectTimer = setTimeout(function () {
        _this4._reconnectTimer = null;
        if (_this4.isDisconnected()) {
          _this4._reconnect();
        }
      }, this._reconnectTime);
      this._reconnectTime = this._reconnectTime * 2;
      if (this._reconnectTime > MAX_RECONNECT_TIME_MS) {
        this._reconnectTime = MAX_RECONNECT_TIME_MS;
      }
    }
  }, {
    key: '_clearReconnectTimer',
    value: function _clearReconnectTimer() {
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = null;
      }
    }
  }, {
    key: 'send',
    value: function send(message) {
      (0, (_assert2 || _assert()).default)(this._transport != null);
      this._transport.send(message);
    }

    // Resolves if the connection looks healthy.
    // Will reject quickly if the connection looks unhealthy.
  }, {
    key: 'testConnection',
    value: function testConnection() {
      return this._heartbeat.sendHeartBeat();
    }
  }, {
    key: 'getServerUri',
    value: function getServerUri() {
      return this._serverUri;
    }
  }, {
    key: 'getServerPort',
    value: function getServerPort() {
      var _default$parse2 = (_url2 || _url()).default.parse(this.getServerUri());

      var port = _default$parse2.port;

      if (port == null) {
        return null;
      }
      return Number(port);
    }
  }, {
    key: 'close',
    value: function close() {
      var transport = this._transport;
      if (transport != null) {
        this._transport = null;
        transport.close();
      }
      this._clearReconnectTimer();
      this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
      this._heartbeat.close();
    }
  }, {
    key: 'onHeartbeat',
    value: function onHeartbeat(callback) {
      return this._heartbeat.onHeartbeat(callback);
    }
  }, {
    key: 'onHeartbeatError',
    value: function onHeartbeatError(callback) {
      return this._heartbeat.onHeartbeatError(callback);
    }
  }, {
    key: 'onMessage',
    value: function onMessage() {
      (0, (_assert2 || _assert()).default)(this._transport != null);
      return this._transport.onMessage();
    }
  }, {
    key: 'onStatus',
    value: function onStatus(callback) {
      return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(this._emitter, 'status', callback);
    }
  }, {
    key: 'onConnect',
    value: function onConnect(callback) {
      return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(this._emitter, 'connect', callback);
    }
  }, {
    key: 'onReconnect',
    value: function onReconnect(callback) {
      return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(this._emitter, 'reconnect', callback);
    }
  }, {
    key: 'onDisconnect',
    value: function onDisconnect(callback) {
      return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(this._emitter, 'disconnect', callback);
    }
  }]);

  return NuclideSocket;
})();

exports.NuclideSocket = NuclideSocket;

function sendOneMessage(socket, message) {
  return new Promise(function (resolve, reject) {
    function finish(result) {
      onError.dispose();
      onClose.dispose();
      resolve(result);
    }
    var onError = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(socket, 'event', function (err) {
      return finish({ kind: 'error', message: err });
    });
    var onClose = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).attachEvent)(socket, 'close', function () {
      return finish({ kind: 'close' });
    });
    socket.send(message, function (error) {
      if (error == null) {
        finish({ kind: 'success' });
      } else {
        finish({ kind: 'error', message: error.toString() });
      }
    });
  });
}
// ID from a setTimeout() call.