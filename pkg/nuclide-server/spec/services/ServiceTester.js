'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Transport} from '../../lib/serviceframework/types';
import ClientComponent from '../../lib/serviceframework/ClientComponent';
import ServerComponent from '../../lib/serviceframework/ServerComponent';
import {ClientConnection} from '../../lib/serviceframework/ClientConnection';

type Services = Array<{name: string; definition: string; implementation: string}>;

export class ServiceTester {
  _server: ServerComponent;
  _client: ClientComponent<Transport>;
  _clientConnection: ClientConnection<Transport>;
  _port: number;

  async start(customServices: Services): Promise<void> {
    const transports = new LoopbackTransports();
    this._server = new ServerComponent(customServices);
    this._clientConnection = new ClientConnection(this._server, transports.serverTransport);

    const port = 42;
    this._client = new ClientComponent(
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
