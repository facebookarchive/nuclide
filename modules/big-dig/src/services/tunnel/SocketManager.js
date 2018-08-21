/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Transport} from './Proxy';
import type {TunnelMessage} from './types';

import invariant from 'assert';
import net from 'net';
import {getLogger} from 'log4js';
import Encoder from './Encoder';
import EventEmitter from 'events';

const logger = getLogger('tunnel-socket-manager');

export class SocketManager extends EventEmitter {
  _port: number;
  _transport: Transport;
  _socketByClientId: Map<number, net.Socket>;
  _tunnelId: string;
  _useIPv4: boolean;

  constructor(
    tunnelId: string,
    port: number,
    useIPv4: boolean,
    transport: Transport,
  ) {
    super();
    this._tunnelId = tunnelId;
    this._port = port;
    this._transport = transport;
    this._useIPv4 = useIPv4;
    this._socketByClientId = new Map();
  }

  getId(): string {
    return this._tunnelId;
  }

  receive(msg: TunnelMessage): void {
    const {clientId} = msg;
    invariant(clientId != null);

    if (msg.event === 'connection') {
      this._createConnection(clientId);
    } else if (msg.event === 'data') {
      invariant(msg.arg != null);
      this._forwardData(clientId, msg.arg);
    } else if (msg.event === 'close') {
      this._ensureSocketClosed(clientId);
    } else if (msg.event === 'error') {
      invariant(clientId != null);
      invariant(msg.error != null);
      this._destroySocket(clientId, msg.error);
    } else if (msg.event === 'end') {
      this._endSocket(clientId);
    }
  }

  _createConnection(clientId: number) {
    const connectOptions = {
      port: this._port,
      family: this._useIPv4 ? 4 : 6,
    };

    logger.info(`creating socket with ${JSON.stringify(connectOptions)}`);
    const socket = net.createConnection(connectOptions);

    socket.on('error', error => {
      logger.error('error on socket: ', error);
      this._sendMessage({
        event: 'error',
        error,
        clientId,
      });
      socket.destroy(error);
    });

    socket.on('data', data => {
      this._sendMessage({
        event: 'data',
        arg: data,
        clientId,
      });
    });

    socket.on('end', () => {
      this._sendMessage({
        event: 'end',
        clientId,
      });
    });

    socket.on('close', () => {
      this._sendMessage({
        event: 'close',
        clientId,
      });
      this._deleteSocket(clientId);
    });

    this._socketByClientId.set(clientId, socket);
  }

  _forwardData(id: number, data: string) {
    const socket = this._socketByClientId.get(id);
    if (socket != null) {
      socket.write(data);
    } else {
      logger.error(`data loss - socket already closed or nonexistent: ${id}`);
    }
  }

  _deleteSocket(id: number) {
    logger.info(`socket ${id} closed`);
    const socket = this._socketByClientId.get(id);
    invariant(socket);
    socket.removeAllListeners();
    this._socketByClientId.delete(id);
  }

  _destroySocket(id: number, error: Error) {
    const socket = this._socketByClientId.get(id);
    if (socket != null) {
      socket.destroy(error);
    } else {
      logger.info(
        `no socket ${id} found for ${
          error.message
        }, this is expected if it was closed recently`,
      );
    }
  }

  _endSocket(id: number) {
    const socket = this._socketByClientId.get(id);
    if (socket != null) {
      socket.end();
    } else {
      logger.info(
        `no socket ${id} found to be ended, this is expected if it was closed recently`,
      );
    }
  }

  _ensureSocketClosed(id: number) {
    const socket = this._socketByClientId.get(id);
    if (socket != null) {
      logger.info(`socket ${id} wasn't closed in time, force closing it`);
      socket.destroy();
    }
  }

  _sendMessage(msg: TunnelMessage): void {
    this._transport.send(Encoder.encode({tunnelId: this._tunnelId, ...msg}));
  }

  close() {
    this._socketByClientId.forEach(socket => {
      socket.end();
    });
  }
}
