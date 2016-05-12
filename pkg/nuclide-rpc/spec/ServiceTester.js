'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ConfigEntry, Transport} from '../lib/index';
import {LoopbackTransports} from '../lib/LoopbackTransports';
import {RpcConnection} from '../lib/RpcConnection';
import {ServiceRegistry} from '../lib/ServiceRegistry';

export class ServiceTester {
  _serviceRegistry: ServiceRegistry;
  _client: RpcConnection<Transport>;
  _clientConnection: RpcConnection<Transport>;
  _port: number;

  async start(customServices: Array<ConfigEntry>): Promise<void> {
    const transports = new LoopbackTransports();
    this._serviceRegistry = ServiceRegistry.createRemote(customServices);
    this._clientConnection = new RpcConnection(
      'server', this._serviceRegistry, transports.serverTransport);

    const port = 42;
    this._client = RpcConnection.createRemote(
      'localhost', port, transports.clientTransport, customServices);
    this._port = port;
  }

  stop(): void {
    this._client.dispose();
    this._clientConnection.dispose();
  }

  getRemoteService(serviceName: string): any {
    return this._client.getService(serviceName);
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://localhost:${this._port}${remotePath}`;
  }
}
