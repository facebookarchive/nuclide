var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _config = require('./config');

var url = require('url');

var _require = require('./utils');

var asyncRequest = _require.asyncRequest;

var WebSocket = require('ws');
var uuid = require('uuid');

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var logger = require('../../nuclide-logging').getLogger();

var INITIAL_RECONNECT_TIME_MS = 10;
var MAX_RECONNECT_TIME_MS = 5000;
var HEARTBEAT_INTERVAL_MS = 5000;
var MAX_HEARTBEAT_AWAY_RECONNECT_MS = 60000;

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

var NuclideSocket = (function (_EventEmitter) {
  _inherits(NuclideSocket, _EventEmitter);

  function NuclideSocket(serverUri) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, NuclideSocket);

    _get(Object.getPrototypeOf(NuclideSocket.prototype), 'constructor', this).call(this);
    this._serverUri = serverUri;
    this._options = options;
    this.id = uuid.v4();
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    this._reconnectTimer = null;
    this._connected = false;
    this._closed = false;
    this._previouslyConnected = false;
    this._cachedMessages = [];

    var _url$parse = url.parse(serverUri);

    var protocol = _url$parse.protocol;
    var host = _url$parse.host;

    this._websocketUri = 'ws' + (protocol === 'https:' ? 's' : '') + '://' + host;

    this._heartbeatConnectedOnce = false;
    this._lastHeartbeat = null;
    this._lastHeartbeatTime = null;
    this._monitorServerHeartbeat();

    this._reconnect();
  }

  _createClass(NuclideSocket, [{
    key: 'waitForConnect',
    value: function waitForConnect() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (_this._connected) {
          return resolve();
        } else {
          _this.on('connect', resolve);
          _this.on('reconnect', resolve);
        }
      });
    }
  }, {
    key: '_reconnect',
    value: function _reconnect() {
      var _this2 = this;

      var _options = this._options;
      var certificateAuthorityCertificate = _options.certificateAuthorityCertificate;
      var clientKey = _options.clientKey;
      var clientCertificate = _options.clientCertificate;

      var websocket = new WebSocket(this._websocketUri, {
        cert: clientCertificate,
        key: clientKey,
        ca: certificateAuthorityCertificate
      });

      var onSocketOpen = function onSocketOpen() {
        _this2._websocket = websocket;
        _this2._reconnectTime = INITIAL_RECONNECT_TIME_MS;
        // Handshake the server with my client id to manage my re-connect attemp, if it is.
        websocket.send(_this2.id, function () {
          _this2._connected = true;
          _this2.emit('status', _this2._connected);
          if (_this2._previouslyConnected) {
            logger.info('WebSocket reconnected');
            _this2.emit('reconnect');
          } else {
            logger.info('WebSocket connected');
            _this2.emit('connect');
          }
          _this2._previouslyConnected = true;
          _this2._cachedMessages.splice(0).forEach(function (message) {
            return _this2.send(message.data);
          });
        });
      };
      websocket.on('open', onSocketOpen);

      var onSocketClose = function onSocketClose() {
        if (_this2._websocket !== websocket) {
          return;
        }
        logger.info('WebSocket closed.');
        _this2._websocket = null;
        _this2._disconnect();
        if (!_this2._closed) {
          logger.info('WebSocket reconnecting after closed.');
          _this2._scheduleReconnect();
        }
      };
      websocket.on('close', onSocketClose);

      var onSocketError = function onSocketError(error) {
        if (_this2._websocket !== websocket) {
          return;
        }
        logger.error('WebSocket Error - reconnecting...', error);
        _this2._cleanWebSocket();
        _this2._scheduleReconnect();
      };
      websocket.on('error', onSocketError);

      var onSocketMessage = function onSocketMessage(data, flags) {
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        var json = JSON.parse(data);
        _this2.emit('message', json);
      };

      websocket.on('message', onSocketMessage);
      // WebSocket inherits from EventEmitter, and doesn't dispose the listeners on close.
      // Here, I added an expando property function to allow disposing those listeners on the created
      // instance.
      websocket.dispose = function () {
        websocket.removeListener('open', onSocketOpen);
        websocket.removeListener('close', onSocketClose);
        websocket.removeListener('error', onSocketError);
        websocket.removeListener('message', onSocketMessage);
      };
    }
  }, {
    key: '_disconnect',
    value: function _disconnect() {
      this._connected = false;
      this.emit('status', this._connected);
      this.emit('disconnect');
    }
  }, {
    key: '_cleanWebSocket',
    value: function _cleanWebSocket() {
      var websocket = this._websocket;
      if (websocket != null) {
        websocket.dispose();
        websocket.close();
        this._websocket = null;
      }
    }
  }, {
    key: '_scheduleReconnect',
    value: function _scheduleReconnect() {
      var _this3 = this;

      if (this._reconnectTimer) {
        return;
      }
      // Exponential reconnect time trials.
      this._reconnectTimer = setTimeout(function () {
        _this3._reconnectTimer = null;
        _this3._reconnect();
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
    value: function send(data) {
      var _this4 = this;

      // Wrap the data in an object, because if `data` is a primitive data type,
      // finding it in an array would return the first matching item, not necessarily the same
      // inserted item.
      var message = { data: data };
      this._cachedMessages.push(message);
      if (!this._connected) {
        return;
      }

      var websocket = this._websocket;
      if (websocket == null) {
        return;
      }
      websocket.send(JSON.stringify(data), function (err) {
        if (err) {
          logger.warn('WebSocket error, but caching the message:', err);
        } else {
          var messageIndex = _this4._cachedMessages.indexOf(message);
          if (messageIndex !== -1) {
            _this4._cachedMessages.splice(messageIndex, 1);
          }
        }
      });
    }
  }, {
    key: 'xhrRequest',
    value: _asyncToGenerator(function* (options) {
      var _options2 = this._options;
      var certificateAuthorityCertificate = _options2.certificateAuthorityCertificate;
      var clientKey = _options2.clientKey;
      var clientCertificate = _options2.clientCertificate;

      if (certificateAuthorityCertificate && clientKey && clientCertificate) {
        options.agentOptions = {
          ca: certificateAuthorityCertificate,
          key: clientKey,
          cert: clientCertificate
        };
      }

      options.uri = this._serverUri + '/' + options.uri;

      var _ref = yield asyncRequest(options);

      var body = _ref.body;

      return body;
    })
  }, {
    key: '_monitorServerHeartbeat',
    value: function _monitorServerHeartbeat() {
      var _this5 = this;

      this._heartbeat();
      this._heartbeatInterval = setInterval(function () {
        return _this5._heartbeat();
      }, HEARTBEAT_INTERVAL_MS);
    }

    // Resolves if the connection looks healthy.
    // Will reject quickly if the connection looks unhealthy.
  }, {
    key: 'testConnection',
    value: function testConnection() {
      return this._sendHeartBeat();
    }
  }, {
    key: '_sendHeartBeat',
    value: _asyncToGenerator(function* () {
      yield this.xhrRequest({
        uri: _config.HEARTBEAT_CHANNEL,
        method: 'POST'
      });
    })
  }, {
    key: '_heartbeat',
    value: _asyncToGenerator(function* () {
      try {
        yield this._sendHeartBeat();
        this._heartbeatConnectedOnce = true;
        var now = Date.now();
        this._lastHeartbeatTime = this._lastHeartbeatTime || now;
        if (this._lastHeartbeat === 'away' || now - this._lastHeartbeatTime > MAX_HEARTBEAT_AWAY_RECONNECT_MS) {
          // Trigger a websocket reconnect.
          this._cleanWebSocket();
          this._scheduleReconnect();
        }
        this._lastHeartbeat = 'here';
        this._lastHeartbeatTime = now;
        this.emit('heartbeat');
      } catch (err) {
        this._disconnect();
        this._lastHeartbeat = 'away';
        // Error code could could be one of:
        // ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT']
        // A heuristic mapping is done between the xhr error code to the state of server connection.
        var originalCode = err.code;
        var message = err.message;

        var code = null;
        switch (originalCode) {
          case 'ENOTFOUND':
          // A socket operation failed because the network was down.
          case 'ENETDOWN':
          // The range of the temporary ports for connection are all taken,
          // This is temporal with many http requests, but should be counted as a network away event.
          case 'EADDRNOTAVAIL':
          // The host server is unreachable, could be in a VPN.
          case 'EHOSTUNREACH':
          // A request timeout is considered a network away event.
          case 'ETIMEDOUT':
            code = 'NETWORK_AWAY';
            break;
          case 'ECONNREFUSED':
            // Server shut down or port no longer accessible.
            if (this._heartbeatConnectedOnce) {
              code = 'SERVER_CRASHED';
            } else {
              code = 'PORT_NOT_ACCESSIBLE';
            }
            break;
          case 'ECONNRESET':
            code = 'INVALID_CERTIFICATE';
            break;
          default:
            code = originalCode;
            break;
        }
        this.emit('heartbeat.error', { code: code, originalCode: originalCode, message: message });
      }
    })
  }, {
    key: 'getServerUri',
    value: function getServerUri() {
      return this._serverUri;
    }
  }, {
    key: 'close',
    value: function close() {
      this._closed = true;
      if (this._connected) {
        this._disconnect();
      }
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
      }
      this._cleanWebSocket();
      this._cachedMessages = [];
      this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
      if (this._heartbeatInterval != null) {
        clearInterval(this._heartbeatInterval);
      }
    }
  }, {
    key: 'isConnected',
    value: function isConnected() {
      return this._connected;
    }
  }]);

  return NuclideSocket;
})(EventEmitter);

module.exports = NuclideSocket;
// ID from a setTimeout() call.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVTb2NrZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWtCZ0MsVUFBVTs7QUFOMUMsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztlQUNKLE9BQU8sQ0FBQyxTQUFTLENBQUM7O0lBQWxDLFlBQVksWUFBWixZQUFZOztBQUNuQixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztnQkFDTixPQUFPLENBQUMsUUFBUSxDQUFDOztJQUFqQyxZQUFZLGFBQVosWUFBWTs7QUFDbkIsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBUzVELElBQU0seUJBQXlCLEdBQUcsRUFBRSxDQUFDO0FBQ3JDLElBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDO0FBQ25DLElBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDO0FBQ25DLElBQU0sK0JBQStCLEdBQUcsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFvQnhDLGFBQWE7WUFBYixhQUFhOztBQWtCTixXQWxCUCxhQUFhLENBa0JMLFNBQWlCLEVBQXNDO1FBQXBDLE9BQTZCLHlEQUFHLEVBQUU7OzBCQWxCN0QsYUFBYTs7QUFtQmYsK0JBbkJFLGFBQWEsNkNBbUJQO0FBQ1IsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7QUFDeEIsUUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDcEIsUUFBSSxDQUFDLGNBQWMsR0FBRyx5QkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztBQUM1QixRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztBQUN4QixRQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixRQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0FBQ2xDLFFBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDOztxQkFFRCxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQzs7UUFBdEMsUUFBUSxjQUFSLFFBQVE7UUFBRSxJQUFJLGNBQUosSUFBSTs7QUFDckIsUUFBSSxDQUFDLGFBQWEsV0FBUSxRQUFRLEtBQUssUUFBUSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUEsV0FBTSxJQUFJLEFBQUUsQ0FBQzs7QUFFdkUsUUFBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztBQUNyQyxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztBQUMzQixRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFFBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDOztBQUUvQixRQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7R0FDbkI7O2VBdkNHLGFBQWE7O1dBeUNILDBCQUFZOzs7QUFDeEIsYUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsWUFBSSxNQUFLLFVBQVUsRUFBRTtBQUNuQixpQkFBTyxPQUFPLEVBQUUsQ0FBQztTQUNsQixNQUFNO0FBQ0wsZ0JBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM1QixnQkFBSyxFQUFFLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQy9CO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVTLHNCQUFHOzs7cUJBQzZELElBQUksQ0FBQyxRQUFRO1VBQTlFLCtCQUErQixZQUEvQiwrQkFBK0I7VUFBRSxTQUFTLFlBQVQsU0FBUztVQUFFLGlCQUFpQixZQUFqQixpQkFBaUI7O0FBQ3BFLFVBQU0sU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDbEQsWUFBSSxFQUFFLGlCQUFpQjtBQUN2QixXQUFHLEVBQUUsU0FBUztBQUNkLFVBQUUsRUFBRSwrQkFBK0I7T0FDcEMsQ0FBQyxDQUFDOztBQUVILFVBQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxHQUFTO0FBQ3pCLGVBQUssVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixlQUFLLGNBQWMsR0FBRyx5QkFBeUIsQ0FBQzs7QUFFaEQsaUJBQVMsQ0FBQyxJQUFJLENBQUMsT0FBSyxFQUFFLEVBQUUsWUFBTTtBQUM1QixpQkFBSyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLGlCQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBSyxVQUFVLENBQUMsQ0FBQztBQUNyQyxjQUFJLE9BQUssb0JBQW9CLEVBQUU7QUFDN0Isa0JBQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNyQyxtQkFBSyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7V0FDeEIsTUFBTTtBQUNMLGtCQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbkMsbUJBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1dBQ3RCO0FBQ0QsaUJBQUssb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLGlCQUFLLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTzttQkFBSSxPQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1dBQUEsQ0FBQyxDQUFDO1NBQzVFLENBQUMsQ0FBQztPQUNKLENBQUM7QUFDRixlQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFbkMsVUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxHQUFTO0FBQzFCLFlBQUksT0FBSyxVQUFVLEtBQUssU0FBUyxFQUFFO0FBQ2pDLGlCQUFPO1NBQ1I7QUFDRCxjQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDakMsZUFBSyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLGVBQUssV0FBVyxFQUFFLENBQUM7QUFDbkIsWUFBSSxDQUFDLE9BQUssT0FBTyxFQUFFO0FBQ2pCLGdCQUFNLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDcEQsaUJBQUssa0JBQWtCLEVBQUUsQ0FBQztTQUMzQjtPQUNGLENBQUM7QUFDRixlQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzs7QUFFckMsVUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFHLEtBQUssRUFBSTtBQUM3QixZQUFJLE9BQUssVUFBVSxLQUFLLFNBQVMsRUFBRTtBQUNqQyxpQkFBTztTQUNSO0FBQ0QsY0FBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6RCxlQUFLLGVBQWUsRUFBRSxDQUFDO0FBQ3ZCLGVBQUssa0JBQWtCLEVBQUUsQ0FBQztPQUMzQixDQUFDO0FBQ0YsZUFBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRXJDLFVBQU0sZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBSSxJQUFJLEVBQUUsS0FBSyxFQUFLOzs7QUFHdkMsWUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5QixlQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDNUIsQ0FBQzs7QUFFRixlQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQzs7OztBQUl6QyxlQUFTLENBQUMsT0FBTyxHQUFHLFlBQU07QUFDeEIsaUJBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQy9DLGlCQUFTLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNqRCxpQkFBUyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDakQsaUJBQVMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO09BQ3RELENBQUM7S0FDSDs7O1dBRVUsdUJBQUc7QUFDWixVQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztBQUN4QixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsVUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUN6Qjs7O1dBRWMsMkJBQUc7QUFDaEIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxVQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFDckIsaUJBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNwQixpQkFBUyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO09BQ3hCO0tBQ0Y7OztXQUVpQiw4QkFBRzs7O0FBQ25CLFVBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN4QixlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUMsWUFBTTtBQUN0QyxlQUFLLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsZUFBSyxVQUFVLEVBQUUsQ0FBQztPQUNuQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN4QixVQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFVBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxxQkFBcUIsRUFBRTtBQUMvQyxZQUFJLENBQUMsY0FBYyxHQUFHLHFCQUFxQixDQUFDO09BQzdDO0tBQ0Y7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDeEIsb0JBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7T0FDN0I7S0FDRjs7O1dBRUcsY0FBQyxJQUFTLEVBQVE7Ozs7OztBQUlwQixVQUFNLE9BQU8sR0FBRyxFQUFDLElBQUksRUFBSixJQUFJLEVBQUMsQ0FBQztBQUN2QixVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuQyxVQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNwQixlQUFPO09BQ1I7O0FBRUQsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxVQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFDckIsZUFBTztPQUNSO0FBQ0QsZUFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQUEsR0FBRyxFQUFJO0FBQzFDLFlBQUksR0FBRyxFQUFFO0FBQ1AsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsMkNBQTJDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDL0QsTUFBTTtBQUNMLGNBQU0sWUFBWSxHQUFHLE9BQUssZUFBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzRCxjQUFJLFlBQVksS0FBSyxDQUFDLENBQUMsRUFBRTtBQUN2QixtQkFBSyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztXQUM5QztTQUNGO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7Ozs2QkFFZSxXQUFDLE9BQXVCLEVBQW1CO3NCQUNlLElBQUksQ0FBQyxRQUFRO1VBQTlFLCtCQUErQixhQUEvQiwrQkFBK0I7VUFBRSxTQUFTLGFBQVQsU0FBUztVQUFFLGlCQUFpQixhQUFqQixpQkFBaUI7O0FBQ3BFLFVBQUksK0JBQStCLElBQUksU0FBUyxJQUFJLGlCQUFpQixFQUFFO0FBQ3JFLGVBQU8sQ0FBQyxZQUFZLEdBQUc7QUFDckIsWUFBRSxFQUFFLCtCQUErQjtBQUNuQyxhQUFHLEVBQUUsU0FBUztBQUNkLGNBQUksRUFBRSxpQkFBaUI7U0FDeEIsQ0FBQztPQUNIOztBQUVELGFBQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQzs7aUJBQ25DLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQzs7VUFBbkMsSUFBSSxRQUFKLElBQUk7O0FBQ1gsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRXNCLG1DQUFTOzs7QUFDOUIsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxrQkFBa0IsR0FBRyxXQUFXLENBQUM7ZUFBTSxPQUFLLFVBQVUsRUFBRTtPQUFBLEVBQUUscUJBQXFCLENBQUMsQ0FBQztLQUN2Rjs7Ozs7O1dBSWEsMEJBQWtCO0FBQzlCLGFBQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQzlCOzs7NkJBRW1CLGFBQWtCO0FBQ3BDLFlBQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNwQixXQUFHLDJCQUFtQjtBQUN0QixjQUFNLEVBQUUsTUFBTTtPQUNmLENBQUMsQ0FBQztLQUNKOzs7NkJBRWUsYUFBa0I7QUFDaEMsVUFBSTtBQUNGLGNBQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzVCLFlBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7QUFDcEMsWUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLElBQUksR0FBRyxDQUFDO0FBQ3pELFlBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxNQUFNLElBQzFCLEFBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBSSwrQkFBK0IsQUFBQyxFQUFFOztBQUUxRSxjQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkIsY0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDM0I7QUFDRCxZQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztBQUM3QixZQUFJLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDO0FBQzlCLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDeEIsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNaLFlBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixZQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQzs7OztZQUloQixZQUFZLEdBQWEsR0FBRyxDQUFsQyxJQUFJO1lBQWdCLE9BQU8sR0FBSSxHQUFHLENBQWQsT0FBTzs7QUFDbEMsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLGdCQUFRLFlBQVk7QUFDbEIsZUFBSyxXQUFXLENBQUM7O0FBRWpCLGVBQUssVUFBVSxDQUFDOzs7QUFHaEIsZUFBSyxlQUFlLENBQUM7O0FBRXJCLGVBQUssY0FBYyxDQUFDOztBQUVwQixlQUFLLFdBQVc7QUFDZCxnQkFBSSxHQUFHLGNBQWMsQ0FBQztBQUN0QixrQkFBTTtBQUFBLEFBQ1IsZUFBSyxjQUFjOztBQUVqQixnQkFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7QUFDaEMsa0JBQUksR0FBRyxnQkFBZ0IsQ0FBQzthQUN6QixNQUFNO0FBQ0wsa0JBQUksR0FBRyxxQkFBcUIsQ0FBQzthQUM5QjtBQUNELGtCQUFNO0FBQUEsQUFDUixlQUFLLFlBQVk7QUFDZixnQkFBSSxHQUFHLHFCQUFxQixDQUFDO0FBQzdCLGtCQUFNO0FBQUEsQUFDUjtBQUNFLGdCQUFJLEdBQUcsWUFBWSxDQUFDO0FBQ3BCLGtCQUFNO0FBQUEsU0FDVDtBQUNELFlBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBQyxJQUFJLEVBQUosSUFBSSxFQUFFLFlBQVksRUFBWixZQUFZLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxDQUFDLENBQUM7T0FDN0Q7S0FDRjs7O1dBRVcsd0JBQVc7QUFDckIsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0tBQ3hCOzs7V0FFSSxpQkFBRztBQUNOLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFVBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNuQixZQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDcEI7QUFDRCxVQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDeEIsb0JBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7T0FDcEM7QUFDRCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkIsVUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDMUIsVUFBSSxDQUFDLGNBQWMsR0FBRyx5QkFBeUIsQ0FBQztBQUNoRCxVQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7QUFDbkMscUJBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztPQUN4QztLQUNGOzs7V0FFVSx1QkFBWTtBQUNyQixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDeEI7OztTQXhTRyxhQUFhO0dBQVMsWUFBWTs7QUEyU3hDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6Ik51Y2xpZGVTb2NrZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVxdWVzdE9wdGlvbnN9IGZyb20gJy4vdXRpbHMnO1xuY29uc3QgdXJsID0gcmVxdWlyZSgndXJsJyk7XG5jb25zdCB7YXN5bmNSZXF1ZXN0fSA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmNvbnN0IFdlYlNvY2tldCA9IHJlcXVpcmUoJ3dzJyk7XG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpO1xuY29uc3Qge0V2ZW50RW1pdHRlcn0gPSByZXF1aXJlKCdldmVudHMnKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuaW1wb3J0IHtIRUFSVEJFQVRfQ0hBTk5FTH0gZnJvbSAnLi9jb25maWcnO1xuXG50eXBlIE51Y2xpZGVTb2NrZXRPcHRpb25zID0ge1xuICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlPzogQnVmZmVyO1xuICBjbGllbnRDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjtcbiAgY2xpZW50S2V5PzogQnVmZmVyO1xufTtcblxuY29uc3QgSU5JVElBTF9SRUNPTk5FQ1RfVElNRV9NUyA9IDEwO1xuY29uc3QgTUFYX1JFQ09OTkVDVF9USU1FX01TID0gNTAwMDtcbmNvbnN0IEhFQVJUQkVBVF9JTlRFUlZBTF9NUyA9IDUwMDA7XG5jb25zdCBNQVhfSEVBUlRCRUFUX0FXQVlfUkVDT05ORUNUX01TID0gNjAwMDA7XG5cbi8vIFRoZSBOdWNsaWRlIFNvY2tldCBjbGFzcyBkb2VzIHNldmVyYWwgdGhpbmdzOlxuLy8gICAtIFByb3ZpZGVzIGEgdHJhbnNwb3J0IG1lY2hhbmlzbSBmb3Igc2VuZGluZy9yZWNlaXZpbmcgSlNPTiBtZXNzYWdlc1xuLy8gICAtIFByb3ZpZGVzIGEgdHJhbnNwb3J0IGxheWVyIGZvciB4aHIgcmVxdWVzdHNcbi8vICAgLSBtb25pdG9ycyBjb25uZWN0aW9uIHdpdGggYSBoZWFydGJlYXQgKG92ZXIgeGhyKSBhbmQgYXV0b21hdGljYWxseSBhdHRlbXB0cyB0byByZWNvbm5lY3Rcbi8vICAgLSBjYWNoZXMgSlNPTiBtZXNzYWdlcyB3aGVuIHRoZSBjb25uZWN0aW9uIGlzIGRvd24gYW5kIHJldHJpZXMgb24gcmVjb25uZWN0XG4vL1xuLy8gQ2FuIGJlIGluIG9uZSBvZiB0aGUgZm9sbG93aW5nIHN0YXRlczpcbi8vICAgLSBDb25uZWN0ZWQgLSBldmVyeXRoaW5nIGhlYWx0aHlcbi8vICAgLSBEaXNjb25uZWN0ZWQgLSBXYXMgY29ubmVjdGVkLCBidXQgY29ubmVjdGlvbiBkaWVkLiBXaWxsIGF0dGVtcHQgdG8gcmVjb25uZWN0LlxuLy8gICAtIENsb3NlZCAtIE5vIGxvbmdlciBjb25uZWN0ZWQuIE1heSBub3Qgc2VuZC9yZWNpZXZlIG1lc3NhZ2VzLiBDYW5ub3QgYmUgcmVzdXJlY3RlZC5cbi8vXG4vLyBQdWJsaXNoZXMgdGhlIGZvbGxvd2luZyBldmVudHM6XG4vLyAgIC0gc3RhdHVzKGJvb2xlYW4pOiBvbiBjb25uZWN0L2Rpc2Nvbm5lY3Rcbi8vICAgLSBjb25uZWN0OiBvbiBmaXJzdCBDb25uZWN0aW9uXG4vLyAgIC0gcmVjb25uZWN0OiBvbiByZWVzdGFibGlzaGluZyBjb25uZWN0aW9uIGFmdGVyIGEgZGlzY29ubmVjdFxuLy8gICAtIG1lc3NhZ2UobWVzc2FnZTogT2JqZWN0KTogb24gcmVjZWlwdCBmbyBKU09OIG1lc3NhZ2Vcbi8vICAgLSBoZWFydGJlYXQ6IE9uIHJlY2VpcHQgb2Ygc3VjY2Vzc2Z1bCBoZWFydGJlYXRcbi8vICAgLSBoZWFydGJlYXQuZXJyb3Ioe2NvZGUsIG9yaWdpbmFsQ29kZSwgbWVzc2FnZX0pOiBPbiBmYWlsdXJlIG9mIGhlYXJ0YmVhdFxuY2xhc3MgTnVjbGlkZVNvY2tldCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGlkOiBzdHJpbmc7XG5cbiAgX3NlcnZlclVyaTogc3RyaW5nO1xuICBfb3B0aW9uczogTnVjbGlkZVNvY2tldE9wdGlvbnM7XG4gIF9yZWNvbm5lY3RUaW1lOiBudW1iZXI7XG4gIF9yZWNvbm5lY3RUaW1lcjogP251bWJlcjsgLy8gSUQgZnJvbSBhIHNldFRpbWVvdXQoKSBjYWxsLlxuICBfY29ubmVjdGVkOiBib29sZWFuO1xuICBfY2xvc2VkOiBib29sZWFuO1xuICBfcHJldmlvdXNseUNvbm5lY3RlZDogYm9vbGVhbjtcbiAgX2NhY2hlZE1lc3NhZ2VzOiBBcnJheTx7ZGF0YTogYW55fT47XG4gIF93ZWJzb2NrZXRVcmk6IHN0cmluZztcbiAgX3dlYnNvY2tldDogP1dlYlNvY2tldDtcbiAgX2hlYXJ0YmVhdENvbm5lY3RlZE9uY2U6IGJvb2xlYW47XG4gIF9sYXN0SGVhcnRiZWF0OiA/KCdoZXJlJyB8ICdhd2F5Jyk7XG4gIF9sYXN0SGVhcnRiZWF0VGltZTogP251bWJlcjtcbiAgX2hlYXJ0YmVhdEludGVydmFsOiA/bnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHNlcnZlclVyaTogc3RyaW5nLCBvcHRpb25zOiBOdWNsaWRlU29ja2V0T3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zZXJ2ZXJVcmkgPSBzZXJ2ZXJVcmk7XG4gICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICB0aGlzLl9yZWNvbm5lY3RUaW1lID0gSU5JVElBTF9SRUNPTk5FQ1RfVElNRV9NUztcbiAgICB0aGlzLl9yZWNvbm5lY3RUaW1lciA9IG51bGw7XG4gICAgdGhpcy5fY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fY2xvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fcHJldmlvdXNseUNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2NhY2hlZE1lc3NhZ2VzID0gW107XG5cbiAgICBjb25zdCB7cHJvdG9jb2wsIGhvc3R9ID0gdXJsLnBhcnNlKHNlcnZlclVyaSk7XG4gICAgdGhpcy5fd2Vic29ja2V0VXJpID0gYHdzJHtwcm90b2NvbCA9PT0gJ2h0dHBzOicgPyAncycgOiAnJ306Ly8ke2hvc3R9YDtcblxuICAgIHRoaXMuX2hlYXJ0YmVhdENvbm5lY3RlZE9uY2UgPSBmYWxzZTtcbiAgICB0aGlzLl9sYXN0SGVhcnRiZWF0ID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0SGVhcnRiZWF0VGltZSA9IG51bGw7XG4gICAgdGhpcy5fbW9uaXRvclNlcnZlckhlYXJ0YmVhdCgpO1xuXG4gICAgdGhpcy5fcmVjb25uZWN0KCk7XG4gIH1cblxuICB3YWl0Rm9yQ29ubmVjdCgpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2Nvbm5lY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5vbignY29ubmVjdCcsIHJlc29sdmUpO1xuICAgICAgICB0aGlzLm9uKCdyZWNvbm5lY3QnLCByZXNvbHZlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9yZWNvbm5lY3QoKSB7XG4gICAgY29uc3Qge2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsIGNsaWVudEtleSwgY2xpZW50Q2VydGlmaWNhdGV9ID0gdGhpcy5fb3B0aW9ucztcbiAgICBjb25zdCB3ZWJzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHRoaXMuX3dlYnNvY2tldFVyaSwge1xuICAgICAgY2VydDogY2xpZW50Q2VydGlmaWNhdGUsXG4gICAgICBrZXk6IGNsaWVudEtleSxcbiAgICAgIGNhOiBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25Tb2NrZXRPcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5fd2Vic29ja2V0ID0gd2Vic29ja2V0O1xuICAgICAgdGhpcy5fcmVjb25uZWN0VGltZSA9IElOSVRJQUxfUkVDT05ORUNUX1RJTUVfTVM7XG4gICAgICAvLyBIYW5kc2hha2UgdGhlIHNlcnZlciB3aXRoIG15IGNsaWVudCBpZCB0byBtYW5hZ2UgbXkgcmUtY29ubmVjdCBhdHRlbXAsIGlmIGl0IGlzLlxuICAgICAgd2Vic29ja2V0LnNlbmQodGhpcy5pZCwgKCkgPT4ge1xuICAgICAgICB0aGlzLl9jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmVtaXQoJ3N0YXR1cycsIHRoaXMuX2Nvbm5lY3RlZCk7XG4gICAgICAgIGlmICh0aGlzLl9wcmV2aW91c2x5Q29ubmVjdGVkKSB7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oJ1dlYlNvY2tldCByZWNvbm5lY3RlZCcpO1xuICAgICAgICAgIHRoaXMuZW1pdCgncmVjb25uZWN0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oJ1dlYlNvY2tldCBjb25uZWN0ZWQnKTtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wcmV2aW91c2x5Q29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fY2FjaGVkTWVzc2FnZXMuc3BsaWNlKDApLmZvckVhY2gobWVzc2FnZSA9PiB0aGlzLnNlbmQobWVzc2FnZS5kYXRhKSk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHdlYnNvY2tldC5vbignb3BlbicsIG9uU29ja2V0T3Blbik7XG5cbiAgICBjb25zdCBvblNvY2tldENsb3NlID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3dlYnNvY2tldCAhPT0gd2Vic29ja2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dlci5pbmZvKCdXZWJTb2NrZXQgY2xvc2VkLicpO1xuICAgICAgdGhpcy5fd2Vic29ja2V0ID0gbnVsbDtcbiAgICAgIHRoaXMuX2Rpc2Nvbm5lY3QoKTtcbiAgICAgIGlmICghdGhpcy5fY2xvc2VkKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdXZWJTb2NrZXQgcmVjb25uZWN0aW5nIGFmdGVyIGNsb3NlZC4nKTtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVSZWNvbm5lY3QoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHdlYnNvY2tldC5vbignY2xvc2UnLCBvblNvY2tldENsb3NlKTtcblxuICAgIGNvbnN0IG9uU29ja2V0RXJyb3IgPSBlcnJvciA9PiB7XG4gICAgICBpZiAodGhpcy5fd2Vic29ja2V0ICE9PSB3ZWJzb2NrZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmVycm9yKCdXZWJTb2NrZXQgRXJyb3IgLSByZWNvbm5lY3RpbmcuLi4nLCBlcnJvcik7XG4gICAgICB0aGlzLl9jbGVhbldlYlNvY2tldCgpO1xuICAgICAgdGhpcy5fc2NoZWR1bGVSZWNvbm5lY3QoKTtcbiAgICB9O1xuICAgIHdlYnNvY2tldC5vbignZXJyb3InLCBvblNvY2tldEVycm9yKTtcblxuICAgIGNvbnN0IG9uU29ja2V0TWVzc2FnZSA9IChkYXRhLCBmbGFncykgPT4ge1xuICAgICAgLy8gZmxhZ3MuYmluYXJ5IHdpbGwgYmUgc2V0IGlmIGEgYmluYXJ5IGRhdGEgaXMgcmVjZWl2ZWQuXG4gICAgICAvLyBmbGFncy5tYXNrZWQgd2lsbCBiZSBzZXQgaWYgdGhlIGRhdGEgd2FzIG1hc2tlZC5cbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywganNvbik7XG4gICAgfTtcblxuICAgIHdlYnNvY2tldC5vbignbWVzc2FnZScsIG9uU29ja2V0TWVzc2FnZSk7XG4gICAgLy8gV2ViU29ja2V0IGluaGVyaXRzIGZyb20gRXZlbnRFbWl0dGVyLCBhbmQgZG9lc24ndCBkaXNwb3NlIHRoZSBsaXN0ZW5lcnMgb24gY2xvc2UuXG4gICAgLy8gSGVyZSwgSSBhZGRlZCBhbiBleHBhbmRvIHByb3BlcnR5IGZ1bmN0aW9uIHRvIGFsbG93IGRpc3Bvc2luZyB0aG9zZSBsaXN0ZW5lcnMgb24gdGhlIGNyZWF0ZWRcbiAgICAvLyBpbnN0YW5jZS5cbiAgICB3ZWJzb2NrZXQuZGlzcG9zZSA9ICgpID0+IHtcbiAgICAgIHdlYnNvY2tldC5yZW1vdmVMaXN0ZW5lcignb3BlbicsIG9uU29ja2V0T3Blbik7XG4gICAgICB3ZWJzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgb25Tb2NrZXRDbG9zZSk7XG4gICAgICB3ZWJzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25Tb2NrZXRFcnJvcik7XG4gICAgICB3ZWJzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ21lc3NhZ2UnLCBvblNvY2tldE1lc3NhZ2UpO1xuICAgIH07XG4gIH1cblxuICBfZGlzY29ubmVjdCgpIHtcbiAgICB0aGlzLl9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmVtaXQoJ3N0YXR1cycsIHRoaXMuX2Nvbm5lY3RlZCk7XG4gICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0Jyk7XG4gIH1cblxuICBfY2xlYW5XZWJTb2NrZXQoKSB7XG4gICAgY29uc3Qgd2Vic29ja2V0ID0gdGhpcy5fd2Vic29ja2V0O1xuICAgIGlmICh3ZWJzb2NrZXQgIT0gbnVsbCkge1xuICAgICAgd2Vic29ja2V0LmRpc3Bvc2UoKTtcbiAgICAgIHdlYnNvY2tldC5jbG9zZSgpO1xuICAgICAgdGhpcy5fd2Vic29ja2V0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfc2NoZWR1bGVSZWNvbm5lY3QoKSB7XG4gICAgaWYgKHRoaXMuX3JlY29ubmVjdFRpbWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIEV4cG9uZW50aWFsIHJlY29ubmVjdCB0aW1lIHRyaWFscy5cbiAgICB0aGlzLl9yZWNvbm5lY3RUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXIgPSBudWxsO1xuICAgICAgdGhpcy5fcmVjb25uZWN0KCk7XG4gICAgfSwgdGhpcy5fcmVjb25uZWN0VGltZSk7XG4gICAgdGhpcy5fcmVjb25uZWN0VGltZSA9IHRoaXMuX3JlY29ubmVjdFRpbWUgKiAyO1xuICAgIGlmICh0aGlzLl9yZWNvbm5lY3RUaW1lID4gTUFYX1JFQ09OTkVDVF9USU1FX01TKSB7XG4gICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lID0gTUFYX1JFQ09OTkVDVF9USU1FX01TO1xuICAgIH1cbiAgfVxuXG4gIF9jbGVhclJlY29ubmVjdFRpbWVyKCkge1xuICAgIGlmICh0aGlzLl9yZWNvbm5lY3RUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVyKTtcbiAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzZW5kKGRhdGE6IGFueSk6IHZvaWQge1xuICAgIC8vIFdyYXAgdGhlIGRhdGEgaW4gYW4gb2JqZWN0LCBiZWNhdXNlIGlmIGBkYXRhYCBpcyBhIHByaW1pdGl2ZSBkYXRhIHR5cGUsXG4gICAgLy8gZmluZGluZyBpdCBpbiBhbiBhcnJheSB3b3VsZCByZXR1cm4gdGhlIGZpcnN0IG1hdGNoaW5nIGl0ZW0sIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZVxuICAgIC8vIGluc2VydGVkIGl0ZW0uXG4gICAgY29uc3QgbWVzc2FnZSA9IHtkYXRhfTtcbiAgICB0aGlzLl9jYWNoZWRNZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgIGlmICghdGhpcy5fY29ubmVjdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgd2Vic29ja2V0ID0gdGhpcy5fd2Vic29ja2V0O1xuICAgIGlmICh3ZWJzb2NrZXQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3ZWJzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSwgZXJyID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ1dlYlNvY2tldCBlcnJvciwgYnV0IGNhY2hpbmcgdGhlIG1lc3NhZ2U6JywgZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VJbmRleCA9IHRoaXMuX2NhY2hlZE1lc3NhZ2VzLmluZGV4T2YobWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fY2FjaGVkTWVzc2FnZXMuc3BsaWNlKG1lc3NhZ2VJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHhoclJlcXVlc3Qob3B0aW9uczogUmVxdWVzdE9wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlLCBjbGllbnRLZXksIGNsaWVudENlcnRpZmljYXRlfSA9IHRoaXMuX29wdGlvbnM7XG4gICAgaWYgKGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgJiYgY2xpZW50S2V5ICYmIGNsaWVudENlcnRpZmljYXRlKSB7XG4gICAgICBvcHRpb25zLmFnZW50T3B0aW9ucyA9IHtcbiAgICAgICAgY2E6IGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgICAgIGtleTogY2xpZW50S2V5LFxuICAgICAgICBjZXJ0OiBjbGllbnRDZXJ0aWZpY2F0ZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgb3B0aW9ucy51cmkgPSB0aGlzLl9zZXJ2ZXJVcmkgKyAnLycgKyBvcHRpb25zLnVyaTtcbiAgICBjb25zdCB7Ym9keX0gPSBhd2FpdCBhc3luY1JlcXVlc3Qob3B0aW9ucyk7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cblxuICBfbW9uaXRvclNlcnZlckhlYXJ0YmVhdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9oZWFydGJlYXQoKTtcbiAgICB0aGlzLl9oZWFydGJlYXRJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHRoaXMuX2hlYXJ0YmVhdCgpLCBIRUFSVEJFQVRfSU5URVJWQUxfTVMpO1xuICB9XG5cbiAgLy8gUmVzb2x2ZXMgaWYgdGhlIGNvbm5lY3Rpb24gbG9va3MgaGVhbHRoeS5cbiAgLy8gV2lsbCByZWplY3QgcXVpY2tseSBpZiB0aGUgY29ubmVjdGlvbiBsb29rcyB1bmhlYWx0aHkuXG4gIHRlc3RDb25uZWN0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kSGVhcnRCZWF0KCk7XG4gIH1cblxuICBhc3luYyBfc2VuZEhlYXJ0QmVhdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnhoclJlcXVlc3Qoe1xuICAgICAgdXJpOiBIRUFSVEJFQVRfQ0hBTk5FTCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2hlYXJ0YmVhdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5fc2VuZEhlYXJ0QmVhdCgpO1xuICAgICAgdGhpcy5faGVhcnRiZWF0Q29ubmVjdGVkT25jZSA9IHRydWU7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgdGhpcy5fbGFzdEhlYXJ0YmVhdFRpbWUgPSB0aGlzLl9sYXN0SGVhcnRiZWF0VGltZSB8fCBub3c7XG4gICAgICBpZiAodGhpcy5fbGFzdEhlYXJ0YmVhdCA9PT0gJ2F3YXknXG4gICAgICAgICAgfHwgKChub3cgLSB0aGlzLl9sYXN0SGVhcnRiZWF0VGltZSkgPiBNQVhfSEVBUlRCRUFUX0FXQVlfUkVDT05ORUNUX01TKSkge1xuICAgICAgICAvLyBUcmlnZ2VyIGEgd2Vic29ja2V0IHJlY29ubmVjdC5cbiAgICAgICAgdGhpcy5fY2xlYW5XZWJTb2NrZXQoKTtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVSZWNvbm5lY3QoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXQgPSAnaGVyZSc7XG4gICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0VGltZSA9IG5vdztcbiAgICAgIHRoaXMuZW1pdCgnaGVhcnRiZWF0Jyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLl9kaXNjb25uZWN0KCk7XG4gICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0ID0gJ2F3YXknO1xuICAgICAgLy8gRXJyb3IgY29kZSBjb3VsZCBjb3VsZCBiZSBvbmUgb2Y6XG4gICAgICAvLyBbJ0VOT1RGT1VORCcsICdFQ09OTlJFRlVTRUQnLCAnRUNPTk5SRVNFVCcsICdFVElNRURPVVQnXVxuICAgICAgLy8gQSBoZXVyaXN0aWMgbWFwcGluZyBpcyBkb25lIGJldHdlZW4gdGhlIHhociBlcnJvciBjb2RlIHRvIHRoZSBzdGF0ZSBvZiBzZXJ2ZXIgY29ubmVjdGlvbi5cbiAgICAgIGNvbnN0IHtjb2RlOiBvcmlnaW5hbENvZGUsIG1lc3NhZ2V9ID0gZXJyO1xuICAgICAgbGV0IGNvZGUgPSBudWxsO1xuICAgICAgc3dpdGNoIChvcmlnaW5hbENvZGUpIHtcbiAgICAgICAgY2FzZSAnRU5PVEZPVU5EJzpcbiAgICAgICAgLy8gQSBzb2NrZXQgb3BlcmF0aW9uIGZhaWxlZCBiZWNhdXNlIHRoZSBuZXR3b3JrIHdhcyBkb3duLlxuICAgICAgICBjYXNlICdFTkVURE9XTic6XG4gICAgICAgIC8vIFRoZSByYW5nZSBvZiB0aGUgdGVtcG9yYXJ5IHBvcnRzIGZvciBjb25uZWN0aW9uIGFyZSBhbGwgdGFrZW4sXG4gICAgICAgIC8vIFRoaXMgaXMgdGVtcG9yYWwgd2l0aCBtYW55IGh0dHAgcmVxdWVzdHMsIGJ1dCBzaG91bGQgYmUgY291bnRlZCBhcyBhIG5ldHdvcmsgYXdheSBldmVudC5cbiAgICAgICAgY2FzZSAnRUFERFJOT1RBVkFJTCc6XG4gICAgICAgIC8vIFRoZSBob3N0IHNlcnZlciBpcyB1bnJlYWNoYWJsZSwgY291bGQgYmUgaW4gYSBWUE4uXG4gICAgICAgIGNhc2UgJ0VIT1NUVU5SRUFDSCc6XG4gICAgICAgIC8vIEEgcmVxdWVzdCB0aW1lb3V0IGlzIGNvbnNpZGVyZWQgYSBuZXR3b3JrIGF3YXkgZXZlbnQuXG4gICAgICAgIGNhc2UgJ0VUSU1FRE9VVCc6XG4gICAgICAgICAgY29kZSA9ICdORVRXT1JLX0FXQVknO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFQ09OTlJFRlVTRUQnOlxuICAgICAgICAgIC8vIFNlcnZlciBzaHV0IGRvd24gb3IgcG9ydCBubyBsb25nZXIgYWNjZXNzaWJsZS5cbiAgICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0Q29ubmVjdGVkT25jZSkge1xuICAgICAgICAgICAgY29kZSA9ICdTRVJWRVJfQ1JBU0hFRCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvZGUgPSAnUE9SVF9OT1RfQUNDRVNTSUJMRSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFQ09OTlJFU0VUJzpcbiAgICAgICAgICBjb2RlID0gJ0lOVkFMSURfQ0VSVElGSUNBVEUnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvZGUgPSBvcmlnaW5hbENvZGU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2hlYXJ0YmVhdC5lcnJvcicsIHtjb2RlLCBvcmlnaW5hbENvZGUsIG1lc3NhZ2V9KTtcbiAgICB9XG4gIH1cblxuICBnZXRTZXJ2ZXJVcmkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyVXJpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5fY2xvc2VkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5fY29ubmVjdGVkKSB7XG4gICAgICB0aGlzLl9kaXNjb25uZWN0KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9yZWNvbm5lY3RUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVyKTtcbiAgICB9XG4gICAgdGhpcy5fY2xlYW5XZWJTb2NrZXQoKTtcbiAgICB0aGlzLl9jYWNoZWRNZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMuX3JlY29ubmVjdFRpbWUgPSBJTklUSUFMX1JFQ09OTkVDVF9USU1FX01TO1xuICAgIGlmICh0aGlzLl9oZWFydGJlYXRJbnRlcnZhbCAhPSBudWxsKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuX2hlYXJ0YmVhdEludGVydmFsKTtcbiAgICB9XG4gIH1cblxuICBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGVkO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTnVjbGlkZVNvY2tldDtcbiJdfQ==