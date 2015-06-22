'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var url = require('url');
var {asyncRequest} = require('./utils');
var WebSocket = require('ws');
var uuid = require('uuid');
var {EventEmitter} = require('events');
var logger = require('nuclide-logging').getLogger();

type NuclideSocketOptions = {
  certificateAuthorityCertificate: ?Buffer;
  clientCertificate: ?Buffer;
  clientKey: ?Buffer;
};

const INITIAL_RECONNECT_TIME_MS = 10;
const MAX_RECONNECT_TIME_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 5000;
const MAX_HEARTBEAT_AWAY_RECONNECT_MS = 60000;

// TODO(most): Rename class to reflect its new responsibilities (not just WebSocket connection).
class NuclideSocket extends EventEmitter {

  constructor(serverUri: string, options: ?NuclideSocketOptions) {
    super();
    this._serverUri = serverUri;
    this._options = options;
    this.id = uuid.v4();
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    this._reconnectTimer = null;
    this._connected = false;
    this._closed = false;
    this._previouslyConnected = false;
    this._cachedMessages = [];

    var {protocol, host} = url.parse(serverUri);
    var websocketUri = 'ws' + ((protocol === 'https:') ? 's' : '') + '://' + host;
    this._websocketUri = websocketUri;

    this._heartbeatConnectedOnce = false;
    this._lastHeartbeat = null;
    this._lastHeartbeatTime = null;
    this._monitorServerHeartbeat();

    this._reconnect();
  }

  waitForConnect(): Promise {
    return new Promise((resolve, reject) => {
      if (this._connected) {
        return resolve();
      } else {
        this.on('connect', resolve);
      }
    });
  }

  _reconnect() {
    var {certificateAuthorityCertificate, clientKey, clientCertificate} = this._options;
    var websocket = new WebSocket(this._websocketUri, {
      cert: clientCertificate,
      key: clientKey,
      ca: certificateAuthorityCertificate,
    });

    var onSocketOpen = () => {
      this._websocket = websocket;
      this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
      // Handshake the server with my client id to manage my re-connect attemp, if it is.
      websocket.send(this.id, () => {
        if (this._previouslyConnected) {
          logger.info('WebSocket reconnected');
          this.emit('reconnect');
        } else {
          logger.info('WebSocket connected');
          this.emit('connect');
        }
        this._connected = true;
        this._previouslyConnected = true;
        this._cachedMessages.splice(0).forEach(message => this.send(message.data));
      });
    }
    websocket.on('open', onSocketOpen);

    var onSocketClose = () => {
      if (this._websocket !== websocket) {
        return;
      }
      logger.info('WebSocket closed.');
      this._websocket = null;
      this._connected = false;
      this.emit('disconnect');
      if (!this._closed) {
        logger.info('WebSocket reconnecting after closed.');
        this._scheduleReconnect();
      }
    };
    websocket.on('close', onSocketClose);

    var onSocketError = (error) => {
      if (this._websocket !== websocket) {
        return;
      }
      logger.error('WebSocket Error - reconnecting...', error);
      this._cleanWebSocket();
      this._scheduleReconnect();
    };
    websocket.on('error', onSocketError);

    var onSocketMessage = (data, flags) => {
      // flags.binary will be set if a binary data is received.
      // flags.masked will be set if the data was masked.
      var json = JSON.parse(data);
      this.emit('message', json);
    };

    websocket.on('message', onSocketMessage);
    // WebSocket inherits from EventEmitter, and doesn't dispose the listeners on close.
    // Here, I added an expando property function to allow disposing those listeners on the created instance.
    websocket.dispose = () => {
      websocket.removeListener('open', onSocketOpen);
      websocket.removeListener('close', onSocketClose);
      websocket.removeListener('error', onSocketError);
      websocket.removeListener('message', onSocketMessage);
    };
  }

  _cleanWebSocket() {
    if (this._websocket) {
      this._websocket.dispose();
      this._websocket.close();
      this._websocket = null;
    }
  }

  _scheduleReconnect() {
    if (this._reconnectTimer) {
      return;
    }
    // Exponential reconnect time trials.
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      this._reconnect();
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

  send(data: any): void {
    // Wrap the data in an object, because if `data` is a primitive data type,
    // finding it in an array would return the first matching item, not necessarily the same inserted item.
    var message = {data};
    this._cachedMessages.push(message);
    if (!this._connected || !this._websocket) {
      return;
    }
    this._websocket.send(JSON.stringify(data), (err) => {
      if (err) {
        logger.warn('WebSocket error, but caching the message:', err);
      } else {
        var messageIndex = this._cachedMessages.indexOf(message);
        if (messageIndex !== -1) {
          this._cachedMessages.splice(messageIndex, 1);
        }
      }
    });
  }

  async xhrRequest(options: any): Promise<string|any> {
    var {certificateAuthorityCertificate, clientKey, clientCertificate} = this._options;
    if (certificateAuthorityCertificate && clientKey && clientCertificate) {
      options.agentOptions = {
        ca: certificateAuthorityCertificate,
        key: clientKey,
        cert: clientCertificate,
      };
    }

    options.uri = this._serverUri + '/' + options.uri;
    var {body} = await asyncRequest(options);
    return body;
  }

  _monitorServerHeartbeat(): void {
    this._heartbeat();
    this._heartbeatInterval = setInterval(() => this._heartbeat(), HEARTBEAT_INTERVAL_MS);
  }

  async _heartbeat(): Promise<void> {
    try {
      await this.xhrRequest({
        uri: 'server/version',
        method: 'POST',
      });
      this._heartbeatConnectedOnce = true;
      var now = Date.now();
      this._lastHeartbeatTime = this._lastHeartbeatTime || now;
      if (this._lastHeartbeat === 'away'
          || ((now - this._lastHeartbeatTime) > MAX_HEARTBEAT_AWAY_RECONNECT_MS)) {
        // Trigger a websocket reconnect.
        this._cleanWebSocket();
        this._scheduleReconnect();
      }
      this._lastHeartbeat  = 'here';
      this._lastHeartbeatTime = now;
      this.emit('heartbeat');
    } catch (err) {
      this._connected = false;
      this._lastHeartbeat  = 'away';
      // Error code could could be one of:
      // ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT']
      // A heuristic mapping is done between the xhr error code to the state of server connection.
      var {code: originalCode, message} = err;
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
      this.emit('heartbeat.error', {code, originalCode, message});
    }
  }

  getServerUri(): string {
    return this._serverUri;
  }

  close() {
    this._closed = true;
    if (this._connected) {
      this._connected = false;
      this.emit('disconnect');
    }
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
    }
    this._cleanWebSocket();
    this._cachedMessages = [];
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    clearInterval(this._heartbeatInterval);
  }
}

module.exports = NuclideSocket;
