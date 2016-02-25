'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {SERVICE_FRAMEWORK3_CHANNEL} from './config';
import ServiceFramework from './serviceframework';
import invariant from 'assert';

import {getLogger} from '../../logging';
const logger = getLogger();

// Server side analog to (parts of) NuclideSocket
// Handles JSON messaging and reconnect.
export class SocketClient {
  id: string;
  _socket: ?ws$WebSocket;
  _messageQueue: Array<{data: string}>;
  _serverComponent: ServiceFramework.ServerComponent;

  constructor(
      clientId: string,
      serverComponent: ServiceFramework.ServerComponent,
      socket: ws$WebSocket) {
    this.id = clientId;
    this._socket = null;
    this._messageQueue = [];
    this._serverComponent = serverComponent;
    this._connect(socket);
  }

  _connect(socket: ws$WebSocket): void {
    logger.info('Client #%s connecting with a new socket!', this.id);
    invariant(this._socket == null);
    this._socket = socket;
    socket.on('message', message => this._onSocketMessage(message));

    socket.on('close', () => {
      if (this._socket != null) {
        // This can occur on a reconnect, where the old socket has been closed
        // but its close event is sent asynchronously.
        if (this._socket === socket) {
          this._socket = null;
        }
        logger.info('Client #%s closing a socket!', this.id);
      }
    });
  }

  reconnect(socket: ws$WebSocket): void {
    this._close();
    this._connect(socket);
    const queuedMessages = this._messageQueue;
    this._messageQueue = [];
    queuedMessages.
        forEach(message => this.sendSocketMessage(message.data));
  }

  _close(): void {
    if (this._socket != null) {
      this._socket.close();
      // In certain (Error) conditions socket.close may not emit the on close
      // event synchronously.
      this._socket = null;
    }
  }

  _onSocketMessage(message: any): void {
    const parsedMessage: Object = JSON.parse(message);
    invariant(parsedMessage.protocol && parsedMessage.protocol === SERVICE_FRAMEWORK3_CHANNEL);
    this._serverComponent.handleMessage(this, parsedMessage);
  }

  sendSocketMessage(data: any): void {
    // Wrap the data in an object, because if `data` is a primitive data type,
    // finding it in an array would return the first matching item, not necessarily
    // the same inserted item.
    const message = {data};
    this._messageQueue.push(message);
    const socket = this._socket;
    if (socket == null) {
      return;
    }
    socket.send(JSON.stringify(data), err => {
      if (err) {
        logger.warn('Failed sending socket message to client:', this.id, data);
      } else {
        const messageIndex = this._messageQueue.indexOf(message);
        if (messageIndex !== -1) {
          this._messageQueue.splice(messageIndex, 1);
        }
      }
    });
  }
}
