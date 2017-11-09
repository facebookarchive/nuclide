'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XhrConnectionHeartbeat = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HEARTBEAT_INTERVAL_MS = 10000; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */

const HEARTBEAT_TIMEOUT_MS = 10000;
const MAX_HEARTBEAT_AWAY_RECONNECT_MS = 60000;

class XhrConnectionHeartbeat {

  constructor(serverUri, agentOptions) {
    this._heartbeatConnectedOnce = false;
    this._lastHeartbeat = null;
    this._lastHeartbeatTime = null;
    const options = {
      uri: serverUri + '/' + (_config || _load_config()).HEARTBEAT_CHANNEL,
      method: 'POST',
      timeout: HEARTBEAT_TIMEOUT_MS
    };
    if (agentOptions != null) {
      options.agentOptions = agentOptions;
    }
    this._options = options;
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();

    this._monitorServerHeartbeat();
  }

  _monitorServerHeartbeat() {
    this._heartbeat();
    this._heartbeatInterval = setInterval(() => this._heartbeat(), HEARTBEAT_INTERVAL_MS);
  }

  // Returns version
  sendHeartBeat() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { body } = yield (0, (_utils || _load_utils()).asyncRequest)(_this._options);
      return body;
    })();
  }

  _heartbeat() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        yield _this2.sendHeartBeat();
        _this2._heartbeatConnectedOnce = true;
        const now = Date.now();
        // flowlint-next-line sketchy-null-number:off
        _this2._lastHeartbeatTime = _this2._lastHeartbeatTime || now;
        if (_this2._lastHeartbeat === 'away' || now - _this2._lastHeartbeatTime > MAX_HEARTBEAT_AWAY_RECONNECT_MS) {
          // Trigger a websocket reconnect.
          _this2._emitter.emit('reconnect');
        }
        _this2._lastHeartbeat = 'here';
        _this2._lastHeartbeatTime = now;
        _this2._emitter.emit('heartbeat');
      } catch (err) {
        _this2._lastHeartbeat = 'away';
        // Error code could could be one of:
        // ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT']
        // A heuristic mapping is done between the xhr error code to the state of server connection.
        const { code: originalCode, message } = err;
        let code = null;
        switch (originalCode) {
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
            code = 'NETWORK_AWAY';
            break;
          case 'ECONNREFUSED':
            // Server shut down or port no longer accessible.
            if (_this2._heartbeatConnectedOnce) {
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
        _this2._emitter.emit('heartbeat.error', { code, originalCode, message });
      }
    })();
  }

  onHeartbeat(callback) {
    return this._emitter.on('heartbeat', callback);
  }

  onHeartbeatError(callback) {
    return this._emitter.on('heartbeat.error', callback);
  }

  onConnectionRestored(callback) {
    return this._emitter.on('reconnect', callback);
  }

  close() {
    if (this._heartbeatInterval != null) {
      clearInterval(this._heartbeatInterval);
    }
  }
}
exports.XhrConnectionHeartbeat = XhrConnectionHeartbeat;