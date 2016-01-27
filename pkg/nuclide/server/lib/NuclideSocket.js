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

var logger = require('../../logging').getLogger();

var INITIAL_RECONNECT_TIME_MS = 10;
var MAX_RECONNECT_TIME_MS = 5000;
var HEARTBEAT_INTERVAL_MS = 5000;
var MAX_HEARTBEAT_AWAY_RECONNECT_MS = 60000;

// TODO(most): Rename class to reflect its new responsibilities (not just WebSocket connection).

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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsZUFBZSxFQUFFO0FBQ3hCLG9CQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ3BDO0FBQ0QsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBQzFCLFVBQUksQ0FBQyxjQUFjLEdBQUcseUJBQXlCLENBQUM7QUFDaEQsVUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxFQUFFO0FBQ25DLHFCQUFhLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7T0FDeEM7S0FDRjs7O1dBRVUsdUJBQVk7QUFDckIsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0tBQ3hCOzs7U0F4U0csYUFBYTtHQUFTLFlBQVk7O0FBMlN4QyxNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJOdWNsaWRlU29ja2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JlcXVlc3RPcHRpb25zfSBmcm9tICcuL3V0aWxzJztcbmNvbnN0IHVybCA9IHJlcXVpcmUoJ3VybCcpO1xuY29uc3Qge2FzeW5jUmVxdWVzdH0gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5jb25zdCBXZWJTb2NrZXQgPSByZXF1aXJlKCd3cycpO1xuY29uc3QgdXVpZCA9IHJlcXVpcmUoJ3V1aWQnKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5pbXBvcnQge0hFQVJUQkVBVF9DSEFOTkVMfSBmcm9tICcuL2NvbmZpZyc7XG5cbnR5cGUgTnVjbGlkZVNvY2tldE9wdGlvbnMgPSB7XG4gIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU/OiBCdWZmZXI7XG4gIGNsaWVudENlcnRpZmljYXRlPzogQnVmZmVyO1xuICBjbGllbnRLZXk/OiBCdWZmZXI7XG59O1xuXG5jb25zdCBJTklUSUFMX1JFQ09OTkVDVF9USU1FX01TID0gMTA7XG5jb25zdCBNQVhfUkVDT05ORUNUX1RJTUVfTVMgPSA1MDAwO1xuY29uc3QgSEVBUlRCRUFUX0lOVEVSVkFMX01TID0gNTAwMDtcbmNvbnN0IE1BWF9IRUFSVEJFQVRfQVdBWV9SRUNPTk5FQ1RfTVMgPSA2MDAwMDtcblxuLy8gVE9ETyhtb3N0KTogUmVuYW1lIGNsYXNzIHRvIHJlZmxlY3QgaXRzIG5ldyByZXNwb25zaWJpbGl0aWVzIChub3QganVzdCBXZWJTb2NrZXQgY29ubmVjdGlvbikuXG5jbGFzcyBOdWNsaWRlU29ja2V0IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgaWQ6IHN0cmluZztcblxuICBfc2VydmVyVXJpOiBzdHJpbmc7XG4gIF9vcHRpb25zOiBOdWNsaWRlU29ja2V0T3B0aW9ucztcbiAgX3JlY29ubmVjdFRpbWU6IG51bWJlcjtcbiAgX3JlY29ubmVjdFRpbWVyOiA/bnVtYmVyOyAvLyBJRCBmcm9tIGEgc2V0VGltZW91dCgpIGNhbGwuXG4gIF9jb25uZWN0ZWQ6IGJvb2xlYW47XG4gIF9jbG9zZWQ6IGJvb2xlYW47XG4gIF9wcmV2aW91c2x5Q29ubmVjdGVkOiBib29sZWFuO1xuICBfY2FjaGVkTWVzc2FnZXM6IEFycmF5PHtkYXRhOiBhbnl9PjtcbiAgX3dlYnNvY2tldFVyaTogc3RyaW5nO1xuICBfd2Vic29ja2V0OiA/V2ViU29ja2V0O1xuICBfaGVhcnRiZWF0Q29ubmVjdGVkT25jZTogYm9vbGVhbjtcbiAgX2xhc3RIZWFydGJlYXQ6ID8oJ2hlcmUnIHwgJ2F3YXknKTtcbiAgX2xhc3RIZWFydGJlYXRUaW1lOiA/bnVtYmVyO1xuICBfaGVhcnRiZWF0SW50ZXJ2YWw6ID9udW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc2VydmVyVXJpOiBzdHJpbmcsIG9wdGlvbnM6IE51Y2xpZGVTb2NrZXRPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NlcnZlclVyaSA9IHNlcnZlclVyaTtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgIHRoaXMuX3JlY29ubmVjdFRpbWUgPSBJTklUSUFMX1JFQ09OTkVDVF9USU1FX01TO1xuICAgIHRoaXMuX3JlY29ubmVjdFRpbWVyID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9jbG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9wcmV2aW91c2x5Q29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fY2FjaGVkTWVzc2FnZXMgPSBbXTtcblxuICAgIGNvbnN0IHtwcm90b2NvbCwgaG9zdH0gPSB1cmwucGFyc2Uoc2VydmVyVXJpKTtcbiAgICB0aGlzLl93ZWJzb2NrZXRVcmkgPSBgd3Mke3Byb3RvY29sID09PSAnaHR0cHM6JyA/ICdzJyA6ICcnfTovLyR7aG9zdH1gO1xuXG4gICAgdGhpcy5faGVhcnRiZWF0Q29ubmVjdGVkT25jZSA9IGZhbHNlO1xuICAgIHRoaXMuX2xhc3RIZWFydGJlYXQgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RIZWFydGJlYXRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9tb25pdG9yU2VydmVySGVhcnRiZWF0KCk7XG5cbiAgICB0aGlzLl9yZWNvbm5lY3QoKTtcbiAgfVxuXG4gIHdhaXRGb3JDb25uZWN0KCk6IFByb21pc2Uge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAodGhpcy5fY29ubmVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9uKCdjb25uZWN0JywgcmVzb2x2ZSk7XG4gICAgICAgIHRoaXMub24oJ3JlY29ubmVjdCcsIHJlc29sdmUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3JlY29ubmVjdCgpIHtcbiAgICBjb25zdCB7Y2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSwgY2xpZW50S2V5LCBjbGllbnRDZXJ0aWZpY2F0ZX0gPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IHdlYnNvY2tldCA9IG5ldyBXZWJTb2NrZXQodGhpcy5fd2Vic29ja2V0VXJpLCB7XG4gICAgICBjZXJ0OiBjbGllbnRDZXJ0aWZpY2F0ZSxcbiAgICAgIGtleTogY2xpZW50S2V5LFxuICAgICAgY2E6IGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBvblNvY2tldE9wZW4gPSAoKSA9PiB7XG4gICAgICB0aGlzLl93ZWJzb2NrZXQgPSB3ZWJzb2NrZXQ7XG4gICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lID0gSU5JVElBTF9SRUNPTk5FQ1RfVElNRV9NUztcbiAgICAgIC8vIEhhbmRzaGFrZSB0aGUgc2VydmVyIHdpdGggbXkgY2xpZW50IGlkIHRvIG1hbmFnZSBteSByZS1jb25uZWN0IGF0dGVtcCwgaWYgaXQgaXMuXG4gICAgICB3ZWJzb2NrZXQuc2VuZCh0aGlzLmlkLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZW1pdCgnc3RhdHVzJywgdGhpcy5fY29ubmVjdGVkKTtcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZpb3VzbHlDb25uZWN0ZWQpIHtcbiAgICAgICAgICBsb2dnZXIuaW5mbygnV2ViU29ja2V0IHJlY29ubmVjdGVkJyk7XG4gICAgICAgICAgdGhpcy5lbWl0KCdyZWNvbm5lY3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2dnZXIuaW5mbygnV2ViU29ja2V0IGNvbm5lY3RlZCcpO1xuICAgICAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3ByZXZpb3VzbHlDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9jYWNoZWRNZXNzYWdlcy5zcGxpY2UoMCkuZm9yRWFjaChtZXNzYWdlID0+IHRoaXMuc2VuZChtZXNzYWdlLmRhdGEpKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgd2Vic29ja2V0Lm9uKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcblxuICAgIGNvbnN0IG9uU29ja2V0Q2xvc2UgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fd2Vic29ja2V0ICE9PSB3ZWJzb2NrZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmluZm8oJ1dlYlNvY2tldCBjbG9zZWQuJyk7XG4gICAgICB0aGlzLl93ZWJzb2NrZXQgPSBudWxsO1xuICAgICAgdGhpcy5fZGlzY29ubmVjdCgpO1xuICAgICAgaWYgKCF0aGlzLl9jbG9zZWQpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1dlYlNvY2tldCByZWNvbm5lY3RpbmcgYWZ0ZXIgY2xvc2VkLicpO1xuICAgICAgICB0aGlzLl9zY2hlZHVsZVJlY29ubmVjdCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgd2Vic29ja2V0Lm9uKCdjbG9zZScsIG9uU29ja2V0Q2xvc2UpO1xuXG4gICAgY29uc3Qgb25Tb2NrZXRFcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgaWYgKHRoaXMuX3dlYnNvY2tldCAhPT0gd2Vic29ja2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dlci5lcnJvcignV2ViU29ja2V0IEVycm9yIC0gcmVjb25uZWN0aW5nLi4uJywgZXJyb3IpO1xuICAgICAgdGhpcy5fY2xlYW5XZWJTb2NrZXQoKTtcbiAgICAgIHRoaXMuX3NjaGVkdWxlUmVjb25uZWN0KCk7XG4gICAgfTtcbiAgICB3ZWJzb2NrZXQub24oJ2Vycm9yJywgb25Tb2NrZXRFcnJvcik7XG5cbiAgICBjb25zdCBvblNvY2tldE1lc3NhZ2UgPSAoZGF0YSwgZmxhZ3MpID0+IHtcbiAgICAgIC8vIGZsYWdzLmJpbmFyeSB3aWxsIGJlIHNldCBpZiBhIGJpbmFyeSBkYXRhIGlzIHJlY2VpdmVkLlxuICAgICAgLy8gZmxhZ3MubWFza2VkIHdpbGwgYmUgc2V0IGlmIHRoZSBkYXRhIHdhcyBtYXNrZWQuXG4gICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIGpzb24pO1xuICAgIH07XG5cbiAgICB3ZWJzb2NrZXQub24oJ21lc3NhZ2UnLCBvblNvY2tldE1lc3NhZ2UpO1xuICAgIC8vIFdlYlNvY2tldCBpbmhlcml0cyBmcm9tIEV2ZW50RW1pdHRlciwgYW5kIGRvZXNuJ3QgZGlzcG9zZSB0aGUgbGlzdGVuZXJzIG9uIGNsb3NlLlxuICAgIC8vIEhlcmUsIEkgYWRkZWQgYW4gZXhwYW5kbyBwcm9wZXJ0eSBmdW5jdGlvbiB0byBhbGxvdyBkaXNwb3NpbmcgdGhvc2UgbGlzdGVuZXJzIG9uIHRoZSBjcmVhdGVkXG4gICAgLy8gaW5zdGFuY2UuXG4gICAgd2Vic29ja2V0LmRpc3Bvc2UgPSAoKSA9PiB7XG4gICAgICB3ZWJzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ29wZW4nLCBvblNvY2tldE9wZW4pO1xuICAgICAgd2Vic29ja2V0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uU29ja2V0Q2xvc2UpO1xuICAgICAgd2Vic29ja2V0LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uU29ja2V0RXJyb3IpO1xuICAgICAgd2Vic29ja2V0LnJlbW92ZUxpc3RlbmVyKCdtZXNzYWdlJywgb25Tb2NrZXRNZXNzYWdlKTtcbiAgICB9O1xuICB9XG5cbiAgX2Rpc2Nvbm5lY3QoKSB7XG4gICAgdGhpcy5fY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5lbWl0KCdzdGF0dXMnLCB0aGlzLl9jb25uZWN0ZWQpO1xuICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdCcpO1xuICB9XG5cbiAgX2NsZWFuV2ViU29ja2V0KCkge1xuICAgIGNvbnN0IHdlYnNvY2tldCA9IHRoaXMuX3dlYnNvY2tldDtcbiAgICBpZiAod2Vic29ja2V0ICE9IG51bGwpIHtcbiAgICAgIHdlYnNvY2tldC5kaXNwb3NlKCk7XG4gICAgICB3ZWJzb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuX3dlYnNvY2tldCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3NjaGVkdWxlUmVjb25uZWN0KCkge1xuICAgIGlmICh0aGlzLl9yZWNvbm5lY3RUaW1lcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBFeHBvbmVudGlhbCByZWNvbm5lY3QgdGltZSB0cmlhbHMuXG4gICAgdGhpcy5fcmVjb25uZWN0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWVyID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlY29ubmVjdCgpO1xuICAgIH0sIHRoaXMuX3JlY29ubmVjdFRpbWUpO1xuICAgIHRoaXMuX3JlY29ubmVjdFRpbWUgPSB0aGlzLl9yZWNvbm5lY3RUaW1lICogMjtcbiAgICBpZiAodGhpcy5fcmVjb25uZWN0VGltZSA+IE1BWF9SRUNPTk5FQ1RfVElNRV9NUykge1xuICAgICAgdGhpcy5fcmVjb25uZWN0VGltZSA9IE1BWF9SRUNPTk5FQ1RfVElNRV9NUztcbiAgICB9XG4gIH1cblxuICBfY2xlYXJSZWNvbm5lY3RUaW1lcigpIHtcbiAgICBpZiAodGhpcy5fcmVjb25uZWN0VGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZWNvbm5lY3RUaW1lcik7XG4gICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgc2VuZChkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBXcmFwIHRoZSBkYXRhIGluIGFuIG9iamVjdCwgYmVjYXVzZSBpZiBgZGF0YWAgaXMgYSBwcmltaXRpdmUgZGF0YSB0eXBlLFxuICAgIC8vIGZpbmRpbmcgaXQgaW4gYW4gYXJyYXkgd291bGQgcmV0dXJuIHRoZSBmaXJzdCBtYXRjaGluZyBpdGVtLCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWVcbiAgICAvLyBpbnNlcnRlZCBpdGVtLlxuICAgIGNvbnN0IG1lc3NhZ2UgPSB7ZGF0YX07XG4gICAgdGhpcy5fY2FjaGVkTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICBpZiAoIXRoaXMuX2Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHdlYnNvY2tldCA9IHRoaXMuX3dlYnNvY2tldDtcbiAgICBpZiAod2Vic29ja2V0ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgd2Vic29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSksIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ1dlYlNvY2tldCBlcnJvciwgYnV0IGNhY2hpbmcgdGhlIG1lc3NhZ2U6JywgZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VJbmRleCA9IHRoaXMuX2NhY2hlZE1lc3NhZ2VzLmluZGV4T2YobWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fY2FjaGVkTWVzc2FnZXMuc3BsaWNlKG1lc3NhZ2VJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHhoclJlcXVlc3Qob3B0aW9uczogUmVxdWVzdE9wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlLCBjbGllbnRLZXksIGNsaWVudENlcnRpZmljYXRlfSA9IHRoaXMuX29wdGlvbnM7XG4gICAgaWYgKGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgJiYgY2xpZW50S2V5ICYmIGNsaWVudENlcnRpZmljYXRlKSB7XG4gICAgICBvcHRpb25zLmFnZW50T3B0aW9ucyA9IHtcbiAgICAgICAgY2E6IGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgICAgIGtleTogY2xpZW50S2V5LFxuICAgICAgICBjZXJ0OiBjbGllbnRDZXJ0aWZpY2F0ZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgb3B0aW9ucy51cmkgPSB0aGlzLl9zZXJ2ZXJVcmkgKyAnLycgKyBvcHRpb25zLnVyaTtcbiAgICBjb25zdCB7Ym9keX0gPSBhd2FpdCBhc3luY1JlcXVlc3Qob3B0aW9ucyk7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cblxuICBfbW9uaXRvclNlcnZlckhlYXJ0YmVhdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9oZWFydGJlYXQoKTtcbiAgICB0aGlzLl9oZWFydGJlYXRJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHRoaXMuX2hlYXJ0YmVhdCgpLCBIRUFSVEJFQVRfSU5URVJWQUxfTVMpO1xuICB9XG5cbiAgLy8gUmVzb2x2ZXMgaWYgdGhlIGNvbm5lY3Rpb24gbG9va3MgaGVhbHRoeS5cbiAgLy8gV2lsbCByZWplY3QgcXVpY2tseSBpZiB0aGUgY29ubmVjdGlvbiBsb29rcyB1bmhlYWx0aHkuXG4gIHRlc3RDb25uZWN0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kSGVhcnRCZWF0KCk7XG4gIH1cblxuICBhc3luYyBfc2VuZEhlYXJ0QmVhdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnhoclJlcXVlc3Qoe1xuICAgICAgdXJpOiBIRUFSVEJFQVRfQ0hBTk5FTCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2hlYXJ0YmVhdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5fc2VuZEhlYXJ0QmVhdCgpO1xuICAgICAgdGhpcy5faGVhcnRiZWF0Q29ubmVjdGVkT25jZSA9IHRydWU7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgdGhpcy5fbGFzdEhlYXJ0YmVhdFRpbWUgPSB0aGlzLl9sYXN0SGVhcnRiZWF0VGltZSB8fCBub3c7XG4gICAgICBpZiAodGhpcy5fbGFzdEhlYXJ0YmVhdCA9PT0gJ2F3YXknXG4gICAgICAgICAgfHwgKChub3cgLSB0aGlzLl9sYXN0SGVhcnRiZWF0VGltZSkgPiBNQVhfSEVBUlRCRUFUX0FXQVlfUkVDT05ORUNUX01TKSkge1xuICAgICAgICAvLyBUcmlnZ2VyIGEgd2Vic29ja2V0IHJlY29ubmVjdC5cbiAgICAgICAgdGhpcy5fY2xlYW5XZWJTb2NrZXQoKTtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVSZWNvbm5lY3QoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXQgPSAnaGVyZSc7XG4gICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0VGltZSA9IG5vdztcbiAgICAgIHRoaXMuZW1pdCgnaGVhcnRiZWF0Jyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLl9kaXNjb25uZWN0KCk7XG4gICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0ID0gJ2F3YXknO1xuICAgICAgLy8gRXJyb3IgY29kZSBjb3VsZCBjb3VsZCBiZSBvbmUgb2Y6XG4gICAgICAvLyBbJ0VOT1RGT1VORCcsICdFQ09OTlJFRlVTRUQnLCAnRUNPTk5SRVNFVCcsICdFVElNRURPVVQnXVxuICAgICAgLy8gQSBoZXVyaXN0aWMgbWFwcGluZyBpcyBkb25lIGJldHdlZW4gdGhlIHhociBlcnJvciBjb2RlIHRvIHRoZSBzdGF0ZSBvZiBzZXJ2ZXIgY29ubmVjdGlvbi5cbiAgICAgIGNvbnN0IHtjb2RlOiBvcmlnaW5hbENvZGUsIG1lc3NhZ2V9ID0gZXJyO1xuICAgICAgbGV0IGNvZGUgPSBudWxsO1xuICAgICAgc3dpdGNoIChvcmlnaW5hbENvZGUpIHtcbiAgICAgICAgY2FzZSAnRU5PVEZPVU5EJzpcbiAgICAgICAgLy8gQSBzb2NrZXQgb3BlcmF0aW9uIGZhaWxlZCBiZWNhdXNlIHRoZSBuZXR3b3JrIHdhcyBkb3duLlxuICAgICAgICBjYXNlICdFTkVURE9XTic6XG4gICAgICAgIC8vIFRoZSByYW5nZSBvZiB0aGUgdGVtcG9yYXJ5IHBvcnRzIGZvciBjb25uZWN0aW9uIGFyZSBhbGwgdGFrZW4sXG4gICAgICAgIC8vIFRoaXMgaXMgdGVtcG9yYWwgd2l0aCBtYW55IGh0dHAgcmVxdWVzdHMsIGJ1dCBzaG91bGQgYmUgY291bnRlZCBhcyBhIG5ldHdvcmsgYXdheSBldmVudC5cbiAgICAgICAgY2FzZSAnRUFERFJOT1RBVkFJTCc6XG4gICAgICAgIC8vIFRoZSBob3N0IHNlcnZlciBpcyB1bnJlYWNoYWJsZSwgY291bGQgYmUgaW4gYSBWUE4uXG4gICAgICAgIGNhc2UgJ0VIT1NUVU5SRUFDSCc6XG4gICAgICAgIC8vIEEgcmVxdWVzdCB0aW1lb3V0IGlzIGNvbnNpZGVyZWQgYSBuZXR3b3JrIGF3YXkgZXZlbnQuXG4gICAgICAgIGNhc2UgJ0VUSU1FRE9VVCc6XG4gICAgICAgICAgY29kZSA9ICdORVRXT1JLX0FXQVknO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFQ09OTlJFRlVTRUQnOlxuICAgICAgICAgIC8vIFNlcnZlciBzaHV0IGRvd24gb3IgcG9ydCBubyBsb25nZXIgYWNjZXNzaWJsZS5cbiAgICAgICAgICBpZiAodGhpcy5faGVhcnRiZWF0Q29ubmVjdGVkT25jZSkge1xuICAgICAgICAgICAgY29kZSA9ICdTRVJWRVJfQ1JBU0hFRCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvZGUgPSAnUE9SVF9OT1RfQUNDRVNTSUJMRSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFQ09OTlJFU0VUJzpcbiAgICAgICAgICBjb2RlID0gJ0lOVkFMSURfQ0VSVElGSUNBVEUnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvZGUgPSBvcmlnaW5hbENvZGU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2hlYXJ0YmVhdC5lcnJvcicsIHtjb2RlLCBvcmlnaW5hbENvZGUsIG1lc3NhZ2V9KTtcbiAgICB9XG4gIH1cblxuICBnZXRTZXJ2ZXJVcmkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyVXJpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5fY2xvc2VkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5fY29ubmVjdGVkKSB7XG4gICAgICB0aGlzLl9kaXNjb25uZWN0KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9yZWNvbm5lY3RUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JlY29ubmVjdFRpbWVyKTtcbiAgICB9XG4gICAgdGhpcy5fY2xlYW5XZWJTb2NrZXQoKTtcbiAgICB0aGlzLl9jYWNoZWRNZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMuX3JlY29ubmVjdFRpbWUgPSBJTklUSUFMX1JFQ09OTkVDVF9USU1FX01TO1xuICAgIGlmICh0aGlzLl9oZWFydGJlYXRJbnRlcnZhbCAhPSBudWxsKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuX2hlYXJ0YmVhdEludGVydmFsKTtcbiAgICB9XG4gIH1cblxuICBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGVkO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTnVjbGlkZVNvY2tldDtcbiJdfQ==