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

import url from 'url';
import {asyncRequest} from './utils';
import WS from 'ws';
import uuid from 'uuid';
import {EventEmitter} from 'events';
import {HEARTBEAT_CHANNEL} from './config';
import {event} from '../../nuclide-commons';
import {WebSocketTransport} from './WebSocketTransport';
import {QueuedTransport} from './QueuedTransport';
import invariant from 'assert';

const logger = require('../../nuclide-logging').getLogger();

type NuclideSocketOptions = {
  certificateAuthorityCertificate?: Buffer;
  clientCertificate?: Buffer;
  clientKey?: Buffer;
};

const INITIAL_RECONNECT_TIME_MS = 10;
const MAX_RECONNECT_TIME_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 5000;
const MAX_HEARTBEAT_AWAY_RECONNECT_MS = 60000;

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
export class NuclideSocket {
  id: string;

  _serverUri: string;
  _options: NuclideSocketOptions;
  _reconnectTime: number;
  _reconnectTimer: ?number; // ID from a setTimeout() call.
  _previouslyConnected: boolean;
  _websocketUri: string;
  _heartbeatConnectedOnce: boolean;
  _lastHeartbeat: ?('here' | 'away');
  _lastHeartbeatTime: ?number;
  _heartbeatInterval: ?number;
  _emitter: EventEmitter;
  _transport: ?QueuedTransport;

  constructor(serverUri: string, options: NuclideSocketOptions = {}) {
    this._emitter = new EventEmitter();
    this._serverUri = serverUri;
    this._options = options;
    this.id = uuid.v4();
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    this._reconnectTimer = null;
    this._previouslyConnected = false;
    const transport = new QueuedTransport(this.id);
    this._transport = transport;
    transport.onMessage(message => {
      this._emitter.emit('message', message);
    });
    transport.onDisconnect(() => {
      if (this.isDisconnected()) {
        this._emitter.emit('status', false);
        this._emitter.emit('disconnect');
        this._scheduleReconnect();
      }
    });

    const {protocol, host} = url.parse(serverUri);
    this._websocketUri = `ws${protocol === 'https:' ? 's' : ''}://${host}`;

    this._heartbeatConnectedOnce = false;
    this._lastHeartbeat = null;
    this._lastHeartbeatTime = null;
    this._monitorServerHeartbeat();

    this._reconnect();
  }

  isConnected(): boolean {
    return this._transport != null && this._transport.getState() === 'open';
  }

  isDisconnected(): boolean {
    return this._transport != null && this._transport.getState() === 'disconnected';
  }

  waitForConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        return resolve();
      } else {
        this.onConnect(resolve);
        this.onReconnect(resolve);
      }
    });
  }

  _reconnect() {
    invariant(this.isDisconnected());

    const {certificateAuthorityCertificate, clientKey, clientCertificate} = this._options;
    const websocket = new WS(this._websocketUri, {
      cert: clientCertificate,
      key: clientKey,
      ca: certificateAuthorityCertificate,
    });

    // Need to add this otherwise unhandled errors during startup will result
    // in uncaught exceptions. This is due to EventEmitter treating 'error'
    // events specially.
    const onSocketError = error => {
      logger.error('WebSocket Error - attempting connection...', error);
    };
    websocket.on('error', onSocketError);

    const onSocketOpen = async () => {
      const sendIdResult = await sendOneMessage(websocket, this.id);
      switch (sendIdResult.kind) {
        case 'close':
          websocket.close();
          logger.info('WebSocket closed before sending id handshake');
          if (this.isDisconnected()) {
            logger.info('WebSocket reconnecting after closed.');
            this._scheduleReconnect();
          }
          break;
        case 'error':
          websocket.close();
          logger.error('WebSocket Error before sending id handshake', sendIdResult.message);
          if (this.isDisconnected()) {
            logger.info('WebSocket reconnecting after error.');
            this._scheduleReconnect();
          }
          break;
        case 'success':
          if (this.isDisconnected()) {
            invariant(this._transport != null);
            const closeOnError = true;
            this._transport.reconnect(new WebSocketTransport(this.id, websocket, closeOnError));
            websocket.removeListener('error', onSocketError);
            this._emitter.emit('status', true);
            if (this._previouslyConnected) {
              logger.info('WebSocket reconnected');
              this._emitter.emit('reconnect');
            } else {
              logger.info('WebSocket connected');
              this._emitter.emit('connect');
            }
            this._previouslyConnected = true;
            this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
          }
          break;
      }
    };
    websocket.on('open', onSocketOpen);
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

  send(data: Object): void {
    invariant(this._transport != null);
    this._transport.send(data);
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
        this._scheduleReconnect();
      }
      this._lastHeartbeat = 'here';
      this._lastHeartbeatTime = now;
      this._emitter.emit('heartbeat');
    } catch (err) {
      if (this._transport != null) {
        this._transport.disconnect();
      }
      this._lastHeartbeat = 'away';
      // Error code could could be one of:
      // ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT']
      // A heuristic mapping is done between the xhr error code to the state of server connection.
      const {code: originalCode, message} = err;
      let code = null;
      switch (originalCode) {
        case 'ENOTFOUND':
        // A socket operation failed because the network was down.
        /* fallthrough */
        case 'ENETDOWN':
        // The range of the temporary ports for connection are all taken,
        // This is temporal with many http requests, but should be counted as a network away event.
        /* fallthrough */
        case 'EADDRNOTAVAIL':
        // The host server is unreachable, could be in a VPN.
        /* fallthrough */
        case 'EHOSTUNREACH':
        // A request timeout is considered a network away event.
        /* fallthrough */
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
      this._emitter.emit('heartbeat.error', {code, originalCode, message});
    }
  }

  getServerUri(): string {
    return this._serverUri;
  }

  close() {
    const transport = this._transport;
    if (transport != null) {
      this._transport = null;
      transport.close();
    }
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
    }
    this._reconnectTime = INITIAL_RECONNECT_TIME_MS;
    if (this._heartbeatInterval != null) {
      clearInterval(this._heartbeatInterval);
    }
  }

  onHeartbeat(callback: () => mixed): IDisposable {
    return event.attachEvent(this._emitter, 'heartbeat', callback);
  }

  onHeartbeatError(
    callback: (code: string, originalCode: string, message: string) => mixed
  ): IDisposable {
    return event.attachEvent(this._emitter, 'heartbeat.error', callback);
  }

  onMessage(callback: (message: Object) => mixed): IDisposable {
    return event.attachEvent(this._emitter, 'message', callback);
  }

  onStatus(callback: (connected: boolean) => mixed): IDisposable {
    return event.attachEvent(this._emitter, 'status', callback);
  }

  onConnect(callback: () => mixed): IDisposable {
    return event.attachEvent(this._emitter, 'connect', callback);
  }

  onReconnect(callback: () => mixed): IDisposable {
    return event.attachEvent(this._emitter, 'reconnect', callback);
  }

  onDisconnect(callback: () => mixed): IDisposable {
    return event.attachEvent(this._emitter, 'disconnect', callback);
  }
}

type SendResult =
  { kind: 'error'; message: string}
  | { kind: 'close' }
  | { kind: 'success' };

function sendOneMessage(socket: WS, message: string): Promise<SendResult> {
  return new Promise((resolve, reject) => {
    function finish(result) {
      onError.dispose();
      onClose.dispose();
      resolve(result);
    }
    const onError = event.attachEvent(socket, 'event',
      err => finish({kind: 'error', message: err}));
    const onClose = event.attachEvent(socket, 'close', () => finish({kind: 'close'}));
    socket.send(message, error => {
      if (error == null) {
        finish({kind: 'success'});
      } else {
        finish({kind: 'error', message: error.toString()});
      }
    });
  });
}
