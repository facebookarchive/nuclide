'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RequestOptions} from './utils';
const url = require('url');
const {asyncRequest} = require('./utils');
const WebSocket = require('ws');
const uuid = require('uuid');
const {EventEmitter} = require('events');
const logger = require('../../logging').getLogger();
import {HEARTBEAT_CHANNEL} from './config';

type NuclideSocketOptions = {
  certificateAuthorityCertificate?: Buffer,
  clientCertificate?: Buffer,
  clientKey?: Buffer,
};

const INITIAL_RECONNECT_TIME_MS = 10;
const MAX_RECONNECT_TIME_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 5000;
const MAX_HEARTBEAT_AWAY_RECONNECT_MS = 60000;

// TODO(most): Rename class to reflect its new responsibilities (not just WebSocket connection).
class NuclideSocket extends EventEmitter {
  id: string;

  _serverUri: string;
  _options: NuclideSocketOptions;
  _reconnectTime: number;
  _reconnectTimer: ?number; // ID from a setTimeout() call.
  _connected: boolean;
  _closed: boolean;
  _previouslyConnected: boolean;
  _cachedMessages: Array<{data: any}>;
  _websocketUri: string;
  _websocket: ?WebSocket;
  _heartbeatConnectedOnce: boolean;
  _lastHeartbeat: ?('here' | 'away');
  _lastHeartbeatTime: ?number;
  _heartbeatInterval: ?number;

  constructor(serverUri: string, options: NuclideSocketOptions = {}) {
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

    const {protocol, host} = url.parse(serverUri);
    this._websocketUri = `ws${protocol === 'https:' ? 's' : ''}://${host}`;

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
        this.on('reconnect', resolve);
      }
    });
  }

  _reconnect() {
    const {certificateAuthorityCertificate, clientKey, clientCertificate} = this._options;
    const websocket = new WebSocket(this._websocketUri, {
      cert: clientCertificate,
      key: clientKey,
      ca: certificateAuthorityCertificate,
    });

    const onSocketOpen = () => {
      this._websocket = websocket;
      this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
      // Handshake the server with my client id to manage my re-connect attemp, if it is.
      websocket.send(this.id, () => {
        this._connected = true;
        this.emit('status', this._connected);
        if (this._previouslyConnected) {
          logger.info('WebSocket reconnected');
          this.emit('reconnect');
        } else {
          logger.info('WebSocket connected');
          this.emit('connect');
        }
        this._previouslyConnected = true;
        this._cachedMessages.splice(0).forEach(message => this.send(message.data));
      });
    };
    websocket.on('open', onSocketOpen);

    const onSocketClose = () => {
      if (this._websocket !== websocket) {
        return;
      }
      logger.info('WebSocket closed.');
      this._websocket = null;
      this._disconnect();
      if (!this._closed) {
        logger.info('WebSocket reconnecting after closed.');
        this._scheduleReconnect();
      }
    };
    websocket.on('close', onSocketClose);

    const onSocketError = error => {
      if (this._websocket !== websocket) {
        return;
      }
      logger.error('WebSocket Error - reconnecting...', error);
      this._cleanWebSocket();
      this._scheduleReconnect();
    };
    websocket.on('error', onSocketError);

    const onSocketMessage = (data, flags) => {
      // flags.binary will be set if a binary data is received.
      // flags.masked will be set if the data was masked.
      const json = JSON.parse(data);
      this.emit('message', json);
    };

    websocket.on('message', onSocketMessage);
    // WebSocket inherits from EventEmitter, and doesn't dispose the listeners on close.
    // Here, I added an expando property function to allow disposing those listeners on the created
    // instance.
    websocket.dispose = () => {
      websocket.removeListener('open', onSocketOpen);
      websocket.removeListener('close', onSocketClose);
      websocket.removeListener('error', onSocketError);
      websocket.removeListener('message', onSocketMessage);
    };
  }

  _disconnect() {
    this._connected = false;
    this.emit('status', this._connected);
    this.emit('disconnect');
  }

  _cleanWebSocket() {
    const websocket = this._websocket;
    if (websocket != null) {
      websocket.dispose();
      websocket.close();
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
    // finding it in an array would return the first matching item, not necessarily the same
    // inserted item.
    const message = {data};
    this._cachedMessages.push(message);
    if (!this._connected) {
      return;
    }

    const websocket = this._websocket;
    if (websocket == null) {
      return;
    }
    websocket.send(JSON.stringify(data), err => {
      if (err) {
        logger.warn('WebSocket error, but caching the message:', err);
      } else {
        const messageIndex = this._cachedMessages.indexOf(message);
        if (messageIndex !== -1) {
          this._cachedMessages.splice(messageIndex, 1);
        }
      }
    });
  }

  async xhrRequest(options: RequestOptions): Promise<string> {
    const {certificateAuthorityCertificate, clientKey, clientCertificate} = this._options;
    if (certificateAuthorityCertificate && clientKey && clientCertificate) {
      options.agentOptions = {
        ca: certificateAuthorityCertificate,
        key: clientKey,
        cert: clientCertificate,
      };
    }

    options.uri = this._serverUri + '/' + options.uri;
    const {body} = await asyncRequest(options);
    return body;
  }

  _monitorServerHeartbeat(): void {
    this._heartbeat();
    this._heartbeatInterval = setInterval(() => this._heartbeat(), HEARTBEAT_INTERVAL_MS);
  }

  // Resolves if the connection looks healthy.
  // Will reject quickly if the connection looks unhealthy.
  testConnection(): Promise<void> {
    return this._sendHeartBeat();
  }

  async _sendHeartBeat(): Promise<void> {
    await this.xhrRequest({
      uri: HEARTBEAT_CHANNEL,
      method: 'POST',
    });
  }

  async _heartbeat(): Promise<void> {
    try {
      await this._sendHeartBeat();
      this._heartbeatConnectedOnce = true;
      const now = Date.now();
      this._lastHeartbeatTime = this._lastHeartbeatTime || now;
      if (this._lastHeartbeat === 'away'
          || ((now - this._lastHeartbeatTime) > MAX_HEARTBEAT_AWAY_RECONNECT_MS)) {
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
      const {code: originalCode, message} = err;
      let code = null;
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

  isConnected(): boolean {
    return this._connected;
  }
}

module.exports = NuclideSocket;
