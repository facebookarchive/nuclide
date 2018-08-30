/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {Observable} from 'rxjs';
import type {TunnelMessage} from './types';

import net from 'net';
import Encoder from './Encoder';

import {getLogger} from 'log4js';
import invariant from 'assert';
import EventEmitter from 'events';

const logger = getLogger('tunnel-proxy');

export type Transport = {
  send(string): void,
  onMessage(): Observable<string>,
};

export class Proxy extends EventEmitter {
  _localPort: number;
  _remotePort: number;
  _transport: Transport;
  _server: ?net.Server;
  _socketByClientId: Map<number, net.Socket>;
  _tunnelId: string;
  _useIPv4: boolean;

  constructor(
    tunnelId: string,
    localPort: number,
    remotePort: number,
    useIPv4: boolean,
    transport: Transport,
  ) {
    super();
    this._tunnelId = tunnelId;
    this._localPort = localPort;
    this._remotePort = remotePort;
    this._transport = transport;
    this._useIPv4 = useIPv4;
    this._server = null;
    this._socketByClientId = new Map();
  }

  static async createProxy(
    tunnelId: string,
    localPort: number,
    remotePort: number,
    useIPv4: boolean,
    transport: Transport,
  ): Promise<Proxy> {
    const proxy = new Proxy(
      tunnelId,
      localPort,
      remotePort,
      useIPv4,
      transport,
    );
    await proxy.startListening();

    return proxy;
  }

  async startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server = net.createServer(socket => {
        const clientId: number = socket.remotePort;
        this._sendMessage({
          event: 'connection',
          clientId,
        });

        // forward events over the transport
        ['timeout', 'end', 'close', 'data'].forEach(event => {
          socket.on(event, arg => {
            this._sendMessage({
              event,
              arg,
              clientId,
            });
          });
        });

        socket.on('error', error => {
          logger.error('error on socket: ', error);
          this._sendMessage({
            event: 'error',
            error,
            clientId,
          });
          socket.destroy(error);
        });
        socket.on('close', () => this._deleteSocket(clientId));

        this._socketByClientId.set(clientId, socket);
      });

      this._server.on('error', error => {
        logger.error(
          `error when listening on port ${this._localPort}: `,
          error,
        );
        this._sendMessage({
          event: 'proxyError',
          port: this._localPort,
          useIpv4: this._useIPv4,
          remotePort: this._remotePort,
          error,
        });
        reject(error);
      });

      invariant(this._server);
      this._server.listen({port: this._localPort}, () => {
        logger.info(
          `successfully started listening on port ${this._localPort}`,
        );
        // send a message to create the SocketManager
        this._sendMessage({
          event: 'proxyCreated',
          port: this._localPort,
          useIPv4: this._useIPv4,
          remotePort: this._remotePort,
        });
        resolve();
      });
    });
  }

  getId(): string {
    return this._tunnelId;
  }

  receive(msg: TunnelMessage): void {
    const {clientId} = msg;
    invariant(clientId != null);

    if (msg.event === 'data') {
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

  close(): void {
    if (this._server != null) {
      this._server.close();
      this._server = null;
    }
    this._socketByClientId.forEach((socket, id) => {
      socket.end();
    });
    this.removeAllListeners();
    this._sendMessage({event: 'proxyClosed'});
  }
}
