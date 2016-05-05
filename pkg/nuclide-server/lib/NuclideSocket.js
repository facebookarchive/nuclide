'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AgentOptions} from './main';

import url from 'url';
import WS from 'ws';
import uuid from 'uuid';
import {EventEmitter} from 'events';
import {event} from '../../nuclide-commons';
import {WebSocketTransport} from './WebSocketTransport';
import {QueuedTransport} from './QueuedTransport';
import {XhrConnectionHeartbeat} from './XhrConnectionHeartbeat';
import invariant from 'assert';

const logger = require('../../nuclide-logging').getLogger();


const INITIAL_RECONNECT_TIME_MS = 10;
const MAX_RECONNECT_TIME_MS = 5000;

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
  _options: ?AgentOptions;
  _reconnectTime: number;
  _reconnectTimer: ?number; // ID from a setTimeout() call.
  _previouslyConnected: boolean;
  _websocketUri: string;
  _emitter: EventEmitter;
  _transport: ?QueuedTransport;
  _heartbeat: XhrConnectionHeartbeat;

  constructor(serverUri: string, options: ?AgentOptions) {
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

    this._heartbeat = new XhrConnectionHeartbeat(serverUri);
    this._heartbeat.onConnectionRestored(() => {
      this._scheduleReconnect();
    });

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

    const websocket = new WS(this._websocketUri, this._options);

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
            const ws = new WebSocketTransport(this.id, websocket);
            ws.onError(error => { ws.close(); });
            invariant(this._transport != null);
            this._transport.reconnect(ws);
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

  // Resolves if the connection looks healthy.
  // Will reject quickly if the connection looks unhealthy.
  testConnection(): Promise<string> {
    return this._heartbeat.sendHeartBeat();
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
    this._heartbeat.close();
  }

  onHeartbeat(callback: () => mixed): IDisposable {
    return this._heartbeat.onHeartbeat(callback);
  }

  onHeartbeatError(
    callback: (code: string, originalCode: string, message: string) => mixed
  ): IDisposable {
    return this._heartbeat.onHeartbeatError(callback);
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
