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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsZUFBZSxFQUFFO0FBQ3hCLG9CQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ3BDO0FBQ0QsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBQzFCLFVBQUksQ0FBQyxjQUFjLEdBQUcseUJBQXlCLENBQUM7QUFDaEQsVUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxFQUFFO0FBQ25DLHFCQUFhLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7T0FDeEM7S0FDRjs7O1dBRVUsdUJBQVk7QUFDckIsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0tBQ3hCOzs7U0F4U0csYUFBYTtHQUFTLFlBQVk7O0FBMlN4QyxNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJOdWNsaWRlU29ja2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JlcXVlc3RPcHRpb25zfSBmcm9tICcuL3V0aWxzJztcbmNvbnN0IHVybCA9IHJlcXVpcmUoJ3VybCcpO1xuY29uc3Qge2FzeW5jUmVxdWVzdH0gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5jb25zdCBXZWJTb2NrZXQgPSByZXF1aXJlKCd3cycpO1xuY29uc3QgdXVpZCA9IHJlcXVpcmUoJ3V1aWQnKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5pbXBvcnQge0hFQVJUQkVBVF9DSEFOTkVMfSBmcm9tICcuL2NvbmZpZyc7XG5cbnR5cGUgTnVjbGlkZVNvY2tldE9wdGlvbnMgPSB7XG4gIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU/OiBCdWZmZXI7XG4gIGNsaWVudENlcnRpZmljYXRlPzogQnVmZmVyO1xuICBjbGllbnRLZXk/OiBCdWZmZXI7XG59O1xuXG5jb25zdCBJTklUSUFMX1JFQ09OTkVDVF9USU1FX01TID0gMTA7XG5jb25zdCBNQVhfUkVDT05ORUNUX1RJTUVfTVMgPSA1MDAwO1xuY29uc3QgSEVBUlRCRUFUX0lOVEVSVkFMX01TID0gNTAwMDtcbmNvbnN0IE1BWF9IRUFSVEJFQVRfQVdBWV9SRUNPTk5FQ1RfTVMgPSA2MDAwMDtcblxuLy8gVE9ETyhtb3N0KTogUmVuYW1lIGNsYXNzIHRvIHJlZmxlY3QgaXRzIG5ldyByZXNwb25zaWJpbGl0aWVzIChub3QganVzdCBXZWJTb2NrZXQgY29ubmVjdGlvbikuXG5jbGFzcyBOdWNsaWRlU29ja2V0IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgaWQ6IHN0cmluZztcblxuICBfc2VydmVyVXJpOiBzdHJpbmc7XG4gIF9vcHRpb25zOiBOdWNsaWRlU29ja2V0T3B0aW9ucztcbiAgX3JlY29ubmVjdFRpbWU6IG51bWJlcjtcbiAgX3JlY29ubmVjdFRpbWVyOiA/bnVtYmVyOyAvLyBJRCBmcm9tIGEgc2V0VGltZW91dCgpIGNhbGwuXG4gIF9jb25uZWN0ZWQ6IGJvb2xlYW47XG4gIF9jbG9zZWQ6IGJvb2xlYW47XG4gIF9wcmV2aW91c2x5Q29ubmVjdGVkOiBib29sZWFuO1xuICBfY2FjaGVkTWVzc2FnZXM6IEFycmF5PHtkYXRhOiBhbnl9PjtcbiAgX3dlYnNvY2tldFVyaTogc3RyaW5nO1xuICBfd2Vic29ja2V0OiA/V2ViU29ja2V0O1xuICBfaGVhcnRiZWF0Q29ubmVjdGVkT25jZTogYm9vbGVhbjtcbiAgX2xhc3RIZWFydGJlYXQ6ID8oJ2hlcmUnIHwgJ2F3YXknKTtcbiAgX2xhc3RIZWFydGJlYXRUaW1lOiA/bnVtYmVyO1xuICBfaGVhcnRiZWF0SW50ZXJ2YWw6ID9udW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc2VydmVyVXJpOiBzdHJpbmcsIG9wdGlvbnM6IE51Y2xpZGVTb2NrZXRPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NlcnZlclVyaSA9IHNlcnZlclVyaTtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgIHRoaXMuX3JlY29ubmVjdFRpbWUgPSBJTklUSUFMX1JFQ09OTkVDVF9USU1FX01TO1xuICAgIHRoaXMuX3JlY29ubmVjdFRpbWVyID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9jbG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9wcmV2aW91c2x5Q29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fY2FjaGVkTWVzc2FnZXMgPSBbXTtcblxuICAgIGNvbnN0IHtwcm90b2NvbCwgaG9zdH0gPSB1cmwucGFyc2Uoc2VydmVyVXJpKTtcbiAgICB0aGlzLl93ZWJzb2NrZXRVcmkgPSBgd3Mke3Byb3RvY29sID09PSAnaHR0cHM6JyA/ICdzJyA6ICcnfTovLyR7aG9zdH1gO1xuXG4gICAgdGhpcy5faGVhcnRiZWF0Q29ubmVjdGVkT25jZSA9IGZhbHNlO1xuICAgIHRoaXMuX2xhc3RIZWFydGJlYXQgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RIZWFydGJlYXRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9tb25pdG9yU2VydmVySGVhcnRiZWF0KCk7XG5cbiAgICB0aGlzLl9yZWNvbm5lY3QoKTtcbiAgfVxuXG4gIHdhaXRGb3JDb25uZWN0KCk6IFByb21pc2Uge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAodGhpcy5fY29ubmVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9uKCdjb25uZWN0JywgcmVzb2x2ZSk7XG4gICAgICAgIHRoaXMub24oJ3JlY29ubmVjdCcsIHJlc29sdmUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3JlY29ubmVjdCgpIHtcbiAgICBjb25zdCB7Y2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSwgY2xpZW50S2V5LCBjbGllbnRDZXJ0aWZpY2F0ZX0gPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IHdlYnNvY2tldCA9IG5ldyBXZWJTb2NrZXQodGhpcy5fd2Vic29ja2V0VXJpLCB7XG4gICAgICBjZXJ0OiBjbGllbnRDZXJ0aWZpY2F0ZSxcbiAgICAgIGtleTogY2xpZW50S2V5LFxuICAgICAgY2E6IGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBvblNvY2tldE9wZW4gPSAoKSA9PiB7XG4gICAgICB0aGlzLl93ZWJzb2NrZXQgPSB3ZWJzb2NrZXQ7XG4gICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lID0gSU5JVElBTF9SRUNPTk5FQ1RfVElNRV9NUztcbiAgICAgIC8vIEhhbmRzaGFrZSB0aGUgc2VydmVyIHdpdGggbXkgY2xpZW50IGlkIHRvIG1hbmFnZSBteSByZS1jb25uZWN0IGF0dGVtcCwgaWYgaXQgaXMuXG4gICAgICB3ZWJzb2NrZXQuc2VuZCh0aGlzLmlkLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZW1pdCgnc3RhdHVzJywgdGhpcy5fY29ubmVjdGVkKTtcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZpb3VzbHlDb25uZWN0ZWQpIHtcbiAgICAgICAgICBsb2dnZXIuaW5mbygnV2ViU29ja2V0IHJlY29ubmVjdGVkJyk7XG4gICAgICAgICAgdGhpcy5lbWl0KCdyZWNvbm5lY3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2dnZXIuaW5mbygnV2ViU29ja2V0IGNvbm5lY3RlZCcpO1xuICAgICAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3ByZXZpb3VzbHlDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9jYWNoZWRNZXNzYWdlcy5zcGxpY2UoMCkuZm9yRWFjaChtZXNzYWdlID0+IHRoaXMuc2VuZChtZXNzYWdlLmRhdGEpKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgd2Vic29ja2V0Lm9uKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcblxuICAgIGNvbnN0IG9uU29ja2V0Q2xvc2UgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fd2Vic29ja2V0ICE9PSB3ZWJzb2NrZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmluZm8oJ1dlYlNvY2tldCBjbG9zZWQuJyk7XG4gICAgICB0aGlzLl93ZWJzb2NrZXQgPSBudWxsO1xuICAgICAgdGhpcy5fZGlzY29ubmVjdCgpO1xuICAgICAgaWYgKCF0aGlzLl9jbG9zZWQpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1dlYlNvY2tldCByZWNvbm5lY3RpbmcgYWZ0ZXIgY2xvc2VkLicpO1xuICAgICAgICB0aGlzLl9zY2hlZHVsZVJlY29ubmVjdCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgd2Vic29ja2V0Lm9uKCdjbG9zZScsIG9uU29ja2V0Q2xvc2UpO1xuXG4gICAgY29uc3Qgb25Tb2NrZXRFcnJvciA9IGVycm9yID0+IHtcbiAgICAgIGlmICh0aGlzLl93ZWJzb2NrZXQgIT09IHdlYnNvY2tldCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnZXIuZXJyb3IoJ1dlYlNvY2tldCBFcnJvciAtIHJlY29ubmVjdGluZy4uLicsIGVycm9yKTtcbiAgICAgIHRoaXMuX2NsZWFuV2ViU29ja2V0KCk7XG4gICAgICB0aGlzLl9zY2hlZHVsZVJlY29ubmVjdCgpO1xuICAgIH07XG4gICAgd2Vic29ja2V0Lm9uKCdlcnJvcicsIG9uU29ja2V0RXJyb3IpO1xuXG4gICAgY29uc3Qgb25Tb2NrZXRNZXNzYWdlID0gKGRhdGEsIGZsYWdzKSA9PiB7XG4gICAgICAvLyBmbGFncy5iaW5hcnkgd2lsbCBiZSBzZXQgaWYgYSBiaW5hcnkgZGF0YSBpcyByZWNlaXZlZC5cbiAgICAgIC8vIGZsYWdzLm1hc2tlZCB3aWxsIGJlIHNldCBpZiB0aGUgZGF0YSB3YXMgbWFza2VkLlxuICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBqc29uKTtcbiAgICB9O1xuXG4gICAgd2Vic29ja2V0Lm9uKCdtZXNzYWdlJywgb25Tb2NrZXRNZXNzYWdlKTtcbiAgICAvLyBXZWJTb2NrZXQgaW5oZXJpdHMgZnJvbSBFdmVudEVtaXR0ZXIsIGFuZCBkb2Vzbid0IGRpc3Bvc2UgdGhlIGxpc3RlbmVycyBvbiBjbG9zZS5cbiAgICAvLyBIZXJlLCBJIGFkZGVkIGFuIGV4cGFuZG8gcHJvcGVydHkgZnVuY3Rpb24gdG8gYWxsb3cgZGlzcG9zaW5nIHRob3NlIGxpc3RlbmVycyBvbiB0aGUgY3JlYXRlZFxuICAgIC8vIGluc3RhbmNlLlxuICAgIHdlYnNvY2tldC5kaXNwb3NlID0gKCkgPT4ge1xuICAgICAgd2Vic29ja2V0LnJlbW92ZUxpc3RlbmVyKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcbiAgICAgIHdlYnNvY2tldC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBvblNvY2tldENsb3NlKTtcbiAgICAgIHdlYnNvY2tldC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvblNvY2tldEVycm9yKTtcbiAgICAgIHdlYnNvY2tldC5yZW1vdmVMaXN0ZW5lcignbWVzc2FnZScsIG9uU29ja2V0TWVzc2FnZSk7XG4gICAgfTtcbiAgfVxuXG4gIF9kaXNjb25uZWN0KCkge1xuICAgIHRoaXMuX2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZW1pdCgnc3RhdHVzJywgdGhpcy5fY29ubmVjdGVkKTtcbiAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3QnKTtcbiAgfVxuXG4gIF9jbGVhbldlYlNvY2tldCgpIHtcbiAgICBjb25zdCB3ZWJzb2NrZXQgPSB0aGlzLl93ZWJzb2NrZXQ7XG4gICAgaWYgKHdlYnNvY2tldCAhPSBudWxsKSB7XG4gICAgICB3ZWJzb2NrZXQuZGlzcG9zZSgpO1xuICAgICAgd2Vic29ja2V0LmNsb3NlKCk7XG4gICAgICB0aGlzLl93ZWJzb2NrZXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9zY2hlZHVsZVJlY29ubmVjdCgpIHtcbiAgICBpZiAodGhpcy5fcmVjb25uZWN0VGltZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gRXhwb25lbnRpYWwgcmVjb25uZWN0IHRpbWUgdHJpYWxzLlxuICAgIHRoaXMuX3JlY29ubmVjdFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9yZWNvbm5lY3RUaW1lciA9IG51bGw7XG4gICAgICB0aGlzLl9yZWNvbm5lY3QoKTtcbiAgICB9LCB0aGlzLl9yZWNvbm5lY3RUaW1lKTtcbiAgICB0aGlzLl9yZWNvbm5lY3RUaW1lID0gdGhpcy5fcmVjb25uZWN0VGltZSAqIDI7XG4gICAgaWYgKHRoaXMuX3JlY29ubmVjdFRpbWUgPiBNQVhfUkVDT05ORUNUX1RJTUVfTVMpIHtcbiAgICAgIHRoaXMuX3JlY29ubmVjdFRpbWUgPSBNQVhfUkVDT05ORUNUX1RJTUVfTVM7XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyUmVjb25uZWN0VGltZXIoKSB7XG4gICAgaWYgKHRoaXMuX3JlY29ubmVjdFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXIpO1xuICAgICAgdGhpcy5fcmVjb25uZWN0VGltZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHNlbmQoZGF0YTogYW55KTogdm9pZCB7XG4gICAgLy8gV3JhcCB0aGUgZGF0YSBpbiBhbiBvYmplY3QsIGJlY2F1c2UgaWYgYGRhdGFgIGlzIGEgcHJpbWl0aXZlIGRhdGEgdHlwZSxcbiAgICAvLyBmaW5kaW5nIGl0IGluIGFuIGFycmF5IHdvdWxkIHJldHVybiB0aGUgZmlyc3QgbWF0Y2hpbmcgaXRlbSwgbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lXG4gICAgLy8gaW5zZXJ0ZWQgaXRlbS5cbiAgICBjb25zdCBtZXNzYWdlID0ge2RhdGF9O1xuICAgIHRoaXMuX2NhY2hlZE1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgaWYgKCF0aGlzLl9jb25uZWN0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3ZWJzb2NrZXQgPSB0aGlzLl93ZWJzb2NrZXQ7XG4gICAgaWYgKHdlYnNvY2tldCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHdlYnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpLCBlcnIgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBsb2dnZXIud2FybignV2ViU29ja2V0IGVycm9yLCBidXQgY2FjaGluZyB0aGUgbWVzc2FnZTonLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZUluZGV4ID0gdGhpcy5fY2FjaGVkTWVzc2FnZXMuaW5kZXhPZihtZXNzYWdlKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLl9jYWNoZWRNZXNzYWdlcy5zcGxpY2UobWVzc2FnZUluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgeGhyUmVxdWVzdChvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge2NlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUsIGNsaWVudEtleSwgY2xpZW50Q2VydGlmaWNhdGV9ID0gdGhpcy5fb3B0aW9ucztcbiAgICBpZiAoY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSAmJiBjbGllbnRLZXkgJiYgY2xpZW50Q2VydGlmaWNhdGUpIHtcbiAgICAgIG9wdGlvbnMuYWdlbnRPcHRpb25zID0ge1xuICAgICAgICBjYTogY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSxcbiAgICAgICAga2V5OiBjbGllbnRLZXksXG4gICAgICAgIGNlcnQ6IGNsaWVudENlcnRpZmljYXRlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBvcHRpb25zLnVyaSA9IHRoaXMuX3NlcnZlclVyaSArICcvJyArIG9wdGlvbnMudXJpO1xuICAgIGNvbnN0IHtib2R5fSA9IGF3YWl0IGFzeW5jUmVxdWVzdChvcHRpb25zKTtcbiAgICByZXR1cm4gYm9keTtcbiAgfVxuXG4gIF9tb25pdG9yU2VydmVySGVhcnRiZWF0KCk6IHZvaWQge1xuICAgIHRoaXMuX2hlYXJ0YmVhdCgpO1xuICAgIHRoaXMuX2hlYXJ0YmVhdEludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5faGVhcnRiZWF0KCksIEhFQVJUQkVBVF9JTlRFUlZBTF9NUyk7XG4gIH1cblxuICAvLyBSZXNvbHZlcyBpZiB0aGUgY29ubmVjdGlvbiBsb29rcyBoZWFsdGh5LlxuICAvLyBXaWxsIHJlamVjdCBxdWlja2x5IGlmIHRoZSBjb25uZWN0aW9uIGxvb2tzIHVuaGVhbHRoeS5cbiAgdGVzdENvbm5lY3Rpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRIZWFydEJlYXQoKTtcbiAgfVxuXG4gIGFzeW5jIF9zZW5kSGVhcnRCZWF0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMueGhyUmVxdWVzdCh7XG4gICAgICB1cmk6IEhFQVJUQkVBVF9DSEFOTkVMLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfaGVhcnRiZWF0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9zZW5kSGVhcnRCZWF0KCk7XG4gICAgICB0aGlzLl9oZWFydGJlYXRDb25uZWN0ZWRPbmNlID0gdHJ1ZTtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0VGltZSA9IHRoaXMuX2xhc3RIZWFydGJlYXRUaW1lIHx8IG5vdztcbiAgICAgIGlmICh0aGlzLl9sYXN0SGVhcnRiZWF0ID09PSAnYXdheSdcbiAgICAgICAgICB8fCAoKG5vdyAtIHRoaXMuX2xhc3RIZWFydGJlYXRUaW1lKSA+IE1BWF9IRUFSVEJFQVRfQVdBWV9SRUNPTk5FQ1RfTVMpKSB7XG4gICAgICAgIC8vIFRyaWdnZXIgYSB3ZWJzb2NrZXQgcmVjb25uZWN0LlxuICAgICAgICB0aGlzLl9jbGVhbldlYlNvY2tldCgpO1xuICAgICAgICB0aGlzLl9zY2hlZHVsZVJlY29ubmVjdCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbGFzdEhlYXJ0YmVhdCA9ICdoZXJlJztcbiAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXRUaW1lID0gbm93O1xuICAgICAgdGhpcy5lbWl0KCdoZWFydGJlYXQnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuX2Rpc2Nvbm5lY3QoKTtcbiAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXQgPSAnYXdheSc7XG4gICAgICAvLyBFcnJvciBjb2RlIGNvdWxkIGNvdWxkIGJlIG9uZSBvZjpcbiAgICAgIC8vIFsnRU5PVEZPVU5EJywgJ0VDT05OUkVGVVNFRCcsICdFQ09OTlJFU0VUJywgJ0VUSU1FRE9VVCddXG4gICAgICAvLyBBIGhldXJpc3RpYyBtYXBwaW5nIGlzIGRvbmUgYmV0d2VlbiB0aGUgeGhyIGVycm9yIGNvZGUgdG8gdGhlIHN0YXRlIG9mIHNlcnZlciBjb25uZWN0aW9uLlxuICAgICAgY29uc3Qge2NvZGU6IG9yaWdpbmFsQ29kZSwgbWVzc2FnZX0gPSBlcnI7XG4gICAgICBsZXQgY29kZSA9IG51bGw7XG4gICAgICBzd2l0Y2ggKG9yaWdpbmFsQ29kZSkge1xuICAgICAgICBjYXNlICdFTk9URk9VTkQnOlxuICAgICAgICAvLyBBIHNvY2tldCBvcGVyYXRpb24gZmFpbGVkIGJlY2F1c2UgdGhlIG5ldHdvcmsgd2FzIGRvd24uXG4gICAgICAgIGNhc2UgJ0VORVRET1dOJzpcbiAgICAgICAgLy8gVGhlIHJhbmdlIG9mIHRoZSB0ZW1wb3JhcnkgcG9ydHMgZm9yIGNvbm5lY3Rpb24gYXJlIGFsbCB0YWtlbixcbiAgICAgICAgLy8gVGhpcyBpcyB0ZW1wb3JhbCB3aXRoIG1hbnkgaHR0cCByZXF1ZXN0cywgYnV0IHNob3VsZCBiZSBjb3VudGVkIGFzIGEgbmV0d29yayBhd2F5IGV2ZW50LlxuICAgICAgICBjYXNlICdFQUREUk5PVEFWQUlMJzpcbiAgICAgICAgLy8gVGhlIGhvc3Qgc2VydmVyIGlzIHVucmVhY2hhYmxlLCBjb3VsZCBiZSBpbiBhIFZQTi5cbiAgICAgICAgY2FzZSAnRUhPU1RVTlJFQUNIJzpcbiAgICAgICAgLy8gQSByZXF1ZXN0IHRpbWVvdXQgaXMgY29uc2lkZXJlZCBhIG5ldHdvcmsgYXdheSBldmVudC5cbiAgICAgICAgY2FzZSAnRVRJTUVET1VUJzpcbiAgICAgICAgICBjb2RlID0gJ05FVFdPUktfQVdBWSc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0VDT05OUkVGVVNFRCc6XG4gICAgICAgICAgLy8gU2VydmVyIHNodXQgZG93biBvciBwb3J0IG5vIGxvbmdlciBhY2Nlc3NpYmxlLlxuICAgICAgICAgIGlmICh0aGlzLl9oZWFydGJlYXRDb25uZWN0ZWRPbmNlKSB7XG4gICAgICAgICAgICBjb2RlID0gJ1NFUlZFUl9DUkFTSEVEJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29kZSA9ICdQT1JUX05PVF9BQ0NFU1NJQkxFJztcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0VDT05OUkVTRVQnOlxuICAgICAgICAgIGNvZGUgPSAnSU5WQUxJRF9DRVJUSUZJQ0FURSc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29kZSA9IG9yaWdpbmFsQ29kZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnaGVhcnRiZWF0LmVycm9yJywge2NvZGUsIG9yaWdpbmFsQ29kZSwgbWVzc2FnZX0pO1xuICAgIH1cbiAgfVxuXG4gIGdldFNlcnZlclVyaSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJVcmk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLl9jbG9zZWQgPSB0cnVlO1xuICAgIGlmICh0aGlzLl9jb25uZWN0ZWQpIHtcbiAgICAgIHRoaXMuX2Rpc2Nvbm5lY3QoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3JlY29ubmVjdFRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0VGltZXIpO1xuICAgIH1cbiAgICB0aGlzLl9jbGVhbldlYlNvY2tldCgpO1xuICAgIHRoaXMuX2NhY2hlZE1lc3NhZ2VzID0gW107XG4gICAgdGhpcy5fcmVjb25uZWN0VGltZSA9IElOSVRJQUxfUkVDT05ORUNUX1RJTUVfTVM7XG4gICAgaWYgKHRoaXMuX2hlYXJ0YmVhdEludGVydmFsICE9IG51bGwpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5faGVhcnRiZWF0SW50ZXJ2YWwpO1xuICAgIH1cbiAgfVxuXG4gIGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0ZWQ7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlU29ja2V0O1xuIl19