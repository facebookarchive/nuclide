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

  receive(message: Object) {
    this._handleMessage(message);
  }

  getId(): string {
    return this._tunnelId;
  }

  _handleMessage(message: Object) {
    if (message.event === 'connection') {
      this._createConnection(message);
    } else if (message.event === 'data') {
      this._forwardData(message);
    } else if (message.event === 'error') {
      this._handleError(message);
    }
  }

  _createConnection(message: Object) {
    const connectOptions = {
      port: this._port,
      family: this._useIPv4 ? 4 : 6,
    };

    logger.info(`creating socket with ${JSON.stringify(connectOptions)}`);
    const socket = net.createConnection(connectOptions);

    socket.on('error', error => {
      this.emit('error', error);
      logger.error(error);
      this._sendMessage({
        event: 'error',
        error,
        clientId: message.clientId,
        tunnelId: this._tunnelId,
      });
      socket.end();
    });

    socket.on('data', data => {
      this._sendMessage({
        event: 'data',
        arg: data,
        clientId: message.clientId,
        tunnelId: this._tunnelId,
      });
    });

    socket.on('close', () => {
      logger.info(
        `received close event on socket ${message.clientId} in socketManager`,
      );
      this._sendMessage({
        event: 'close',
        clientId: message.clientId,
        tunnelId: this._tunnelId,
      });
      this._socketByClientId.delete(message.clientId);
    });

    this._socketByClientId.set(message.clientId, socket);
  }

  _forwardData(message: Object) {
    const socket = this._socketByClientId.get(message.clientId);
    if (socket != null) {
      socket.write(message.arg);
    } else {
      logger.error('no socket found for this data: ', message);
    }
  }

  _handleError(message: Object) {
    this.emit('error', message.arg);
  }

  _sendMessage(msg: Object): void {
    this._transport.send(Encoder.encode(msg));
  }

  close() {
    this._socketByClientId.forEach(socket => {
      socket.end();
    });
  }
}
