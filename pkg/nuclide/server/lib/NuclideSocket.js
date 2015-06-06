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
    this._cachedMessages = [];

    var {protocol, host} = url.parse(serverUri);
    var websocketUri = 'ws' + ((protocol === 'https:') ? 's' : '') + '://' + host;
    this._websocketUri = websocketUri;

    this._heartbeatConnectedOnce = false;
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

    websocket.on('open', () => {
      this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
      this._websocket = websocket;
      // Handshake the server with my client id to manage my re-connect attemp, if it is.
      websocket.send(this.id, () => {
        this._connected = true;
        this.emit('connect');
        this._cachedMessages.splice(0).forEach((message) => this.send(message));
      });
    });

    websocket.on('close', () => {
      this._websocket = null;
      this._connected = false;
      this.emit('disconnect');
      this._scheduleReconnect();
    });

    websocket.on('error', (error) => {
      logger.error('WebSocket Error - reconnecting...', error);
      websocket.close();
      this._scheduleReconnect();
    });

    websocket.on('message', (data, flags) => {
      // flags.binary will be set if a binary data is received.
      // flags.masked will be set if the data was masked.
      var json = JSON.parse(data);
      this.emit('message', json);
    });
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

  send(data: any): void {
    if (!this._websocket || !this._connected) {
      this._cachedMessages.push(data);
      return;
    }
    this._websocket.send(JSON.stringify(data));
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
      this.emit('heartbeat');
    } catch (err) {
      // Error code could could be one of:
      // ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT']
      // A heuristic mapping is done between the xhr error code to the state of server connection.
      var {code, message} = err;
      var errorCode = null;
      switch (code) {
        case 'ENOTFOUND':
        // A socket operation failed because the network was down.
        case 'ENETDOWN':
        // The range of the temporary ports for connection are all taken,
        // This is temporal with many http requests, but should be counted as a network away event.
        case 'EADDRNOTAVAIL':
          errorCode = 'NETWORK_AWAY';
          break;
        case 'ECONNREFUSED':
          // Server shut down or port no longer accessible.
          if (this._heartbeatConnectedOnce) {
            errorCode = 'SERVER_CRASHED';
          } else {
            errorCode = 'PORT_NOT_ACCESSIBLE';
          }
          break;
        case 'ECONNRESET':
          errorCode = 'INVALID_CERTIFICATE';
          break;
        case 'ETIMEDOUT':
          errorCode = 'REQUEST_TIMEOUT';
          break;
        default:
          errorCode = code;
          break;
      }
      this.emit('heartbeat.error', {code: errorCode, message});
    }
  }

  getServerUri(): string {
    return this._serverUri;
  }

  close() {
    if (this._connected) {
      this._connected = false;
      this.emit('disconnect');
    }
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
    }
    if (this._websocket) {
      this._websocket.close();
      this._websocket = null;
    }
    this._cachedMessages = [];
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    clearInterval(this._heartbeatInterval);
  }
}

module.exports = NuclideSocket;
