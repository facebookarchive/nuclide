'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ConfigEntry} from '../lib/index';
import type {Transport} from '../lib/types';
import {ClientComponent} from '../lib/ClientComponent';
import {ServerComponent} from '../lib/ServerComponent';
import {ClientConnection} from '../lib/ClientConnection';

export class ServiceTester {
  _server: ServerComponent;
  _client: ClientComponent<Transport>;
  _clientConnection: ClientConnection<Transport>;
  _port: number;

  async start(customServices: Array<ConfigEntry>): Promise<void> {
    const transports = new LoopbackTransports();
    this._server = new ServerComponent(customServices);
    this._clientConnection = new ClientConnection(this._server, transports.serverTransport);

    const port = 42;
    this._client = ClientComponent.createRemote(
      'localhost', port, transports.clientTransport, customServices);
    this._port = port;
  }

  stop(): void {
    this._client.close();
    this._clientConnection.dispose();
  }

  getRemoteService(serviceName: string): any {
    return this._client.getService(serviceName);
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://localhost:${this._port}${remotePath}`;
  }
}

class LoopbackTransports {
  serverTransport: Transport;
  clientTransport: Transport;

  constructor() {
    let onServerMessage: (message: Object) => mixed;
    let onClientMessage: (message: Object) => mixed;

    this.serverTransport = {
      send(data: Object): void {
        onClientMessage(data);
      },
      onMessage(callback: (message: Object) => mixed): IDisposable {
        onServerMessage = callback;
        return {dispose() {}};
      },
      close() {},
    };

    this.clientTransport = {
      send(data: Object): void {
        onServerMessage(data);
      },
      onMessage(callback: (message: Object) => mixed): IDisposable {
        onClientMessage = callback;
        return {dispose() {}};
      },
      close() {},
    };
  }
}
