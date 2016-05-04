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

import invariant from 'assert';
import {getLogger} from '../../nuclide-logging';
import {Emitter} from 'event-kit';

const logger = getLogger();

// An unreliable transport for sending JSON formatted messages
// over a WebSocket
//
// onClose handlers are guaranteed to be called exactly once.
// onMessage handlers are guaranteed to not be called after onClose has been called.
// send(data) yields false if the message failed to send, true on success.
// onClose handlers will be called before close() returns.
export class WebSocketTransport {
  id: string;
  _socket: ?WS;
  _emitter: Emitter;

  constructor(clientId: string, socket: WS, closeOnError: boolean) {
    this.id = clientId;
    this._emitter = new Emitter();
    this._socket = socket;

    logger.info('Client #%s connecting with a new socket!', this.id);
    socket.on('message', message => this._onSocketMessage(message));

    socket.on('close', () => {
      if (this._socket != null) {
        invariant(this._socket === socket);
        logger.info('Client #%s socket close recieved on open socket!', this.id);
        this._setClosed();
      } else {
        logger.info('Client #%s recieved socket close on already closed socket!', this.id);
      }
    });

    socket.on('error', e => {
      logger.error(`Client #${this.id} error: ${e.message}`);
      if (closeOnError && this._socket != null) {
        this.close();
      }
    });
  }

  _onSocketMessage(message: any): void {
    if (this._socket == null) {
      logger.error('Received socket message after connection closed', new Error());
      return;
    }

    const parsedMessage: Object = JSON.parse(message);
    this._emitter.emit('message', parsedMessage);
  }

  onMessage(callback: (message: Object) => mixed): IDisposable {
    return this._emitter.on('message', callback);
  }

  onClose(callback: () => mixed): IDisposable {
    return this._emitter.on('close', callback);
  }

  send(data: any): Promise<boolean> {
    const socket = this._socket;
    if (socket == null) {
      logger.error('Attempt to send socket message after connection closed', new Error());
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      socket.send(JSON.stringify(data), err => {
        if (err != null) {
          logger.warn('Failed sending socket message to client:', this.id, data);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  close(): void {
    if (this._socket != null) {
      // The call to socket.close may or may not cause our handler to be called
      this._socket.close();
      this._setClosed();
    }
  }

  isClosed(): boolean {
    return this._socket == null;
  }

  _setClosed(): void {
    if (this._socket != null) {
      // In certain (Error) conditions socket.close may not emit the on close
      // event synchronously.
      this._socket = null;
      this._emitter.emit('close');
    }
  }
}
