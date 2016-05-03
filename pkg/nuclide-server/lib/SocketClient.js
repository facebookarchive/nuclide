'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type WS from 'ws';

import {SERVICE_FRAMEWORK3_CHANNEL} from './config';
import ServiceFramework from './serviceframework/index';
import invariant from 'assert';

import {getLogger} from '../../nuclide-logging';
const logger = getLogger();
import {ObjectRegistry} from './serviceframework/ObjectRegistry';

// Server side analog to (parts of) NuclideSocket
// Handles JSON messaging and reconnect.
export class SocketClient {
  id: string;
  _isDisposed: boolean;
  _socket: ?WS;
  _messageQueue: Array<{data: string}>;
  _serverComponent: ServiceFramework.ServerComponent;
  _objectRegistry: ObjectRegistry;

  constructor(
      clientId: string,
      serverComponent: ServiceFramework.ServerComponent,
      socket: WS) {
    this.id = clientId;
    this._isDisposed = false;
    this._socket = null;
    this._messageQueue = [];
    this._objectRegistry = new ObjectRegistry('server');
    this._serverComponent = serverComponent;
    this._connect(socket);
  }

  _connect(socket: WS): void {
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
          logger.info('Client #%s socket close recieved on open socket!', this.id);
        } else {
          logger.info('Client #%s socket close received on orphaned socket!', this.id);
        }
      } else {
        logger.info('Client #%s recieved socket close on already closed socket!', this.id);
      }
    });
  }

  reconnect(socket: WS): void {
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
    if (this._isDisposed) {
      logger.error('Received socket message after connection closed', new Error());
      return;
    }

    const parsedMessage: Object = JSON.parse(message);
    invariant(parsedMessage.protocol && parsedMessage.protocol === SERVICE_FRAMEWORK3_CHANNEL);
    this._serverComponent.handleMessage(this, parsedMessage);
  }

  sendSocketMessage(data: any): void {
    if (this._isDisposed) {
      logger.error('Attempt to send socket message after connection closed', new Error());
      return;
    }

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

  getMarshallingContext(): ObjectRegistry {
    return this._objectRegistry;
  }

  dispose(): void {
    this._isDisposed = true;
    this._close();
    this._objectRegistry.dispose();
  }
}
