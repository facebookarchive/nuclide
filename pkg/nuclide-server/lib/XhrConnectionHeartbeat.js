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

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var HEARTBEAT_INTERVAL_MS = 10000;
var HEARTBEAT_TIMEOUT_MS = 10000;
var MAX_HEARTBEAT_AWAY_RECONNECT_MS = 60000;

var XhrConnectionHeartbeat = (function () {
  function XhrConnectionHeartbeat(serverUri, agentOptions) {
    _classCallCheck(this, XhrConnectionHeartbeat);

    this._heartbeatConnectedOnce = false;
    this._lastHeartbeat = null;
    this._lastHeartbeatTime = null;
    var options = {
      uri: serverUri + '/' + (_config2 || _config()).HEARTBEAT_CHANNEL,
      method: 'POST',
      timeout: HEARTBEAT_TIMEOUT_MS
    };
    if (agentOptions != null) {
      options.agentOptions = agentOptions;
    }
    this._options = options;
    this._emitter = new (_eventKit2 || _eventKit()).Emitter();

    this._monitorServerHeartbeat();
  }

  _createClass(XhrConnectionHeartbeat, [{
    key: '_monitorServerHeartbeat',
    value: function _monitorServerHeartbeat() {
      var _this = this;

      this._heartbeat();
      this._heartbeatInterval = setInterval(function () {
        return _this._heartbeat();
      }, HEARTBEAT_INTERVAL_MS);
    }

    // Returns version
  }, {
    key: 'sendHeartBeat',
    value: _asyncToGenerator(function* () {
      var _ref = yield (0, (_utils2 || _utils()).asyncRequest)(this._options);

      var body = _ref.body;

      return body;
    })
  }, {
    key: '_heartbeat',
    value: _asyncToGenerator(function* () {
      try {
        yield this.sendHeartBeat();
        this._heartbeatConnectedOnce = true;
        var now = Date.now();
        this._lastHeartbeatTime = this._lastHeartbeatTime || now;
        if (this._lastHeartbeat === 'away' || now - this._lastHeartbeatTime > MAX_HEARTBEAT_AWAY_RECONNECT_MS) {
          // Trigger a websocket reconnect.
          this._emitter.emit('reconnect');
        }
        this._lastHeartbeat = 'here';
        this._lastHeartbeatTime = now;
        this._emitter.emit('heartbeat');
      } catch (err) {
        this._lastHeartbeat = 'away';
        // Error code could could be one of:
        // ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT']
        // A heuristic mapping is done between the xhr error code to the state of server connection.
        var _originalCode = err.code;
        var _message = err.message;

        var _code = null;
        switch (_originalCode) {
          case 'ENOTFOUND':
          // A socket operation failed because the network was down.
          // falls through
          case 'ENETDOWN':
          // The range of the temporary ports for connection are all taken,
          // This is temporal with many http requests, but should be counted as a network away event.
          // falls through
          case 'EADDRNOTAVAIL':
          // The host server is unreachable, could be in a VPN.
          // falls through
          case 'EHOSTUNREACH':
          // A request timeout is considered a network away event.
          // falls through
          case 'ETIMEDOUT':
          case 'ESOCKETTIMEDOUT':
            _code = 'NETWORK_AWAY';
            break;
          case 'ECONNREFUSED':
            // Server shut down or port no longer accessible.
            if (this._heartbeatConnectedOnce) {
              _code = 'SERVER_CRASHED';
            } else {
              _code = 'PORT_NOT_ACCESSIBLE';
            }
            break;
          case 'ECONNRESET':
            _code = 'INVALID_CERTIFICATE';
            break;
          default:
            _code = _originalCode;
            break;
        }
        this._emitter.emit('heartbeat.error', { code: _code, originalCode: _originalCode, message: _message });
      }
    })
  }, {
    key: 'onHeartbeat',
    value: function onHeartbeat(callback) {
      return this._emitter.on('heartbeat', callback);
    }
  }, {
    key: 'onHeartbeatError',
    value: function onHeartbeatError(callback) {
      return this._emitter.on('heartbeat.error', callback);
    }
  }, {
    key: 'onConnectionRestored',
    value: function onConnectionRestored(callback) {
      return this._emitter.on('reconnect', callback);
    }
  }, {
    key: 'close',
    value: function close() {
      if (this._heartbeatInterval != null) {
        clearInterval(this._heartbeatInterval);
      }
    }
  }]);

  return XhrConnectionHeartbeat;
})();

exports.XhrConnectionHeartbeat = XhrConnectionHeartbeat;