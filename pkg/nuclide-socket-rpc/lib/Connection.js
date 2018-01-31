/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {IRemoteSocket, TunnelHost} from './types';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getLogger} from 'log4js';
import net from 'net';

export class Connection {
  _socket: net.Socket;
  _remoteSocket: IRemoteSocket;
  _disposables: UniversalDisposable;

  constructor(tunnelHost: TunnelHost, remoteSocket: IRemoteSocket) {
    trace('Connection: creating connection: ' + JSON.stringify(tunnelHost));
    this._remoteSocket = remoteSocket;

    this._socket = net.createConnection(
      {port: tunnelHost.port, family: tunnelHost.family},
      socket => {
        trace('Connection: connection created and ready to write data.');
      },
    );

    this._disposables = new UniversalDisposable(
      () => this._socket.end(),
      this._remoteSocket,
    );

    this._socket.on('error', err => {
      // TODO: we should find a way to send the error back
      //       to the remote socket
      trace('Connection error: ' + JSON.stringify(err));
      this._socket.end();
    });

    this._socket.on('close', () => {
      this.dispose();
    });

    this._socket.on('data', data => {
      this._remoteSocket.write(data);
    });
  }

  write(msg: Buffer): void {
    this._socket.write(msg);
  }

  dispose(): void {
    trace('Connection: disposing connection');
    this._disposables.dispose();
  }
}

export class ConnectionFactory {
  constructor() {}

  async createConnection(
    tunnelHost: TunnelHost,
    socket: IRemoteSocket,
  ): Promise<Connection> {
    return new Connection(tunnelHost, socket);
  }

  dispose(): void {
    trace('disposing connection.');
  }
}

function trace(message: string) {
  getLogger('SocketService').trace(message);
}
