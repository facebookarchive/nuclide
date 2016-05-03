'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getPath} from '../../../nuclide-remote-uri';
import NuclideServer from '../../lib/NuclideServer';
import NuclideSocket from '../../lib/NuclideSocket';
import ClientComponent from '../../lib/serviceframework/ClientComponent';

type Services = Array<{name: string; definition: string; implementation: string}>;

export default class ServiceTestHelper {
  _server: NuclideServer;
  _client: ClientComponent<NuclideSocket>;
  _connection: _RemoteConnectionMock;

  async start(customServices: Services): Promise<void> {
    this._server = new NuclideServer({port: 0}, customServices);
    await this._server.connect();

    const port = this._server._webServer.address().port;
    this._client = new ClientComponent(
      'localhost', port, new NuclideSocket(`http://localhost:${port}`), customServices);
    this._connection = new _RemoteConnectionMock(this._client, port);
  }

  stop(): void {
    this._client.close();
    this._server.close();
  }

  getRemoteService(serviceName: string): any {
    return this._client.getService(serviceName);
  }

  getRemoteConnection(): _RemoteConnectionMock {
    return this._connection;
  }
}

class _RemoteConnectionMock {
  _client: ClientComponent<NuclideSocket>;
  _port: number;

  constructor(client: ClientComponent<NuclideSocket>, port: number) {
    this._client = client;
    this._port = port;
  }

  getClient(): ClientComponent<NuclideSocket> {
    return this._client;
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://localhost:${this._port}${remotePath}`;
  }
  getPathOfUri(uri: string): string {
    return getPath(uri);
  }
}
