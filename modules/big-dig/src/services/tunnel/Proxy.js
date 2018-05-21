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

import type {Observable, Subscription} from 'rxjs';
import type {TunnelMessage} from './types.js';

import net from 'net';

import {getLogger} from 'log4js';

const logger = getLogger('tunnel-proxy');

export type Transport = {
  send(string): void,
  onMessage(): Observable<string>,
};

export class Proxy {
  _port: number;
  _remotePort: number;
  _transport: Transport;
  _server: ?net.Server;
  _subscription: ?Subscription;
  _idToSocket: Map<number, net.Socket>;

  constructor(port: number, remotePort: number, transport: Transport) {
    this._port = port;
    this._remotePort = remotePort;
    this._transport = transport;
    this._server = null;
    this._subscription = null;
    this._idToSocket = new Map();
  }

  static async createProxy(
    port: number,
    remotePort: number,
    transport: Transport,
  ): Promise<Proxy> {
    const proxy = new Proxy(port, remotePort, transport);
    await proxy.startListening();

    return proxy;
  }

  async startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server = net.createServer(socket => {
        const clientId: number = socket.remotePort;
        this._idToSocket.set(clientId, socket);
        this._sendMessage({
          event: 'connection',
          clientId,
        });

        this._subscription = this._transport
          .onMessage()
          .map(msg => {
            return JSON.parse(msg);
          })
          .filter(msg => {
            return msg.clientId === clientId;
          })
          .subscribe(msg => {
            if (msg.event === 'data') {
              socket.write(Buffer.from(msg.arg, 'base64'));
            }
          });

        socket.on('data', arg => {
          logger.trace('socket data: ', arg);
          this._sendMessage({
            event: 'data',
            arg: arg.toString('base64'),
            clientId,
          });
        });

        // forward events over the transport
        ['timeout', 'error', 'end', 'close'].forEach(event => {
          socket.on(event, arg => {
            logger.trace(`socket ${event}: `, arg);
            this._sendMessage({
              event,
              arg,
              clientId,
            });
          });
        });
      });

      this._server.listen({port: this._port}, () => {
        // send a message to create the connection manager
        this._sendMessage({
          event: 'proxyCreated',
          port: this._port,
          remotePort: this._remotePort,
        });
        resolve();
      });
    });
  }

  _sendMessage(msg: TunnelMessage): void {
    this._transport.send(JSON.stringify(msg));
  }

  close(): void {
    if (this._server != null) {
      this._server.close();
      this._server = null;
    }
    if (this._subscription != null) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
    this._idToSocket.forEach(socket => {
      socket.end();
    });
  }
}
