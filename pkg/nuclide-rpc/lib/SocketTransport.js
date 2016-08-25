'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Socket} from 'net';
import type {MessageLogger} from './index';

import {StreamTransport} from './StreamTransport';
import {Emitter} from 'event-kit';

export class SocketTransport extends StreamTransport {
  _socket: Socket;
  _emitter: Emitter;

  constructor(
    socket: Socket,
    messageLogger: MessageLogger = (direction, message) => { return; },
  ) {
    // $FlowIssue: Sockets are a stream$Duplex, but flow doesn't handle this.
    super(socket, socket, messageLogger);
    this._socket = socket;
    this._emitter = new Emitter();

    socket.on('close', () => {
      this._emitter.emit('close');
    });
  }

  onClose(callback: () => mixed): IDisposable {
    return this._emitter.on('close', callback);
  }

  close(): void {
    // Send the FIN packet ...
    this._socket.end();
    // Then hammer it closed
    this._socket.destroy();

    this._emitter.dispose();
  }
}
