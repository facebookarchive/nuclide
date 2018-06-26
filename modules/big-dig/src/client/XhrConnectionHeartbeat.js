'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XhrConnectionHeartbeat = undefined;

var _asyncRequest;

function _load_asyncRequest() {
  return _asyncRequest = _interopRequireDefault(require('./utils/asyncRequest'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../nuclide-commons/promise');
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
 *  strict-local
 * @format
 */

const HEARTBEAT_INTERVAL_MS = 10000;
const HEARTBEAT_TIMEOUT_MS = 10000;
const MAX_HEARTBEAT_AWAY_RECONNECT_MS = 60000;

const CERT_NOT_YET_VALID_DELAY = 3000;
const CERT_NOT_YET_VALID_RETRIES = 10;
const ECONNRESET_ERRORS_IN_ROW_LIMIT = 4;

class XhrConnectionHeartbeat {

  constructor(serverUri, heartbeatChannel, agentOptions) {
    this._heartbeatConnectedOnce = false;
    this._lastHeartbeat = null;
    this._lastHeartbeatTime = null;
    this._connectionResetCount = 0;
    const options = {
      uri: `${serverUri}/${heartbeatChannel}`,
      method: 'POST',
      timeout: HEARTBEAT_TIMEOUT_MS,
      // We're trying this to see if it resolves T28442202
      forever: true
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
  async sendHeartBeat() {
    let retries = CERT_NOT_YET_VALID_RETRIES;
    while (true) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { body } = await (0, (_asyncRequest || _load_asyncRequest()).default)(this._options);
        return body;
      } catch (err) {
        if (retries-- > 0 && err.code === 'CERT_NOT_YET_VALID') {
          (0, (_log4js || _load_log4js()).getLogger)('XhrConnectionHeartbeat').warn(`Certificate not yet valid, retrying after ${CERT_NOT_YET_VALID_DELAY}ms...`);
          // eslint-disable-next-line no-await-in-loop
          await (0, (_promise || _load_promise()).sleep)(CERT_NOT_YET_VALID_DELAY);
        } else {
          throw err;
        }
      }
    }
    // eslint-disable-next-line no-unreachable
    throw new Error('unreachable');
  }

  async _heartbeat() {
    try {
      await this.sendHeartBeat();
      this._heartbeatConnectedOnce = true;
      const now = Date.now();
      // flowlint-next-line sketchy-null-number:off
      this._lastHeartbeatTime = this._lastHeartbeatTime || now;
      if (this._lastHeartbeat === 'away' || now - this._lastHeartbeatTime > MAX_HEARTBEAT_AWAY_RECONNECT_MS) {
        // Trigger a websocket reconnect.
        this._emitter.emit('reconnect');
      }
      this._lastHeartbeat = 'here';
      this._lastHeartbeatTime = now;
      this._connectionResetCount = 0;
      this._emitter.emit('heartbeat');
    } catch (err) {
      this._lastHeartbeat = 'away';
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
          if (this._heartbeatConnectedOnce) {
            code = 'SERVER_CRASHED';
          } else {
            code = 'PORT_NOT_ACCESSIBLE';
          }
          break;
        case 'ECONNRESET':
          code = this._checkReconnectErrorType(originalCode);
          break;
        case 'CERT_SIGNATURE_FAILURE':
          code = 'INVALID_CERTIFICATE';
          break;
        default:
          code = originalCode;
          break;
      }
      if (code !== 'ECONNRESET') {
        this._connectionResetCount = 0;
      }
      this._emitter.emit('heartbeat.error', { code, originalCode, message });
    }
  }

  _checkReconnectErrorType(originalCode) {
    this._connectionResetCount++;
    if (this._connectionResetCount >= ECONNRESET_ERRORS_IN_ROW_LIMIT) {
      return 'INVALID_CERTIFICATE';
    }
    return originalCode;
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

  isAway() {
    return this._lastHeartbeat === 'away';
  }

  close() {
    if (this._heartbeatInterval != null) {
      clearInterval(this._heartbeatInterval);
    }
  }
}
exports.XhrConnectionHeartbeat = XhrConnectionHeartbeat;