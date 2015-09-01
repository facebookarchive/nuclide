'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from '../../lib/serviceframework/config';
import {getPath} from 'nuclide-remote-uri';
import {getProxy} from 'nuclide-service-parser';
import NuclideServer from '../../lib/NuclideServer';
import NuclideClient from '../../lib/NuclideClient';
import NuclideRemoteEventbus from '../../lib/NuclideRemoteEventbus';
import ServiceFramework from '../../lib/serviceframework';

type Services = Array<{name: string, definition: string, implementation: string}>;

export default class ServiceTestHelper {
  _server: NuclideServer;
  _client: NuclideClient;
  _connection: _RemoteConnectionMock;

  async start(customServices: ?Services): Promise<void> {
    if (customServices) {
      spyOn(config, 'loadServicesConfig').andReturn(customServices);
    }

    this._server = new NuclideServer({port: 0});
    await this._server.connect();

    var port = this._server._webServer.address().port;
    this._client = new NuclideClient('test',
      new NuclideRemoteEventbus(`nuclide://localhost:${port}`));
    this._connection = new _RemoteConnectionMock(this._client, port);
  }

  stop(): void {
    this._client.eventbus.socket.close();
    this._server.close();
  }

  getRemoteService(serviceDefinitionFile: string): any {
    return getProxy(serviceDefinitionFile, this._connection.getClient());
  }
}

class _RemoteConnectionMock {
  _client: NuclideClient;
  _port: number;

  constructor(client: NuclideClient, port: number) {
    this._client = client;
    this._port = port;

    this._client.registerType('NuclideUri',
      uri => this.getPathOfUri(uri),
      path => this.getUriOfRemotePath(path));
  }

  getClient(): NuclideClient {
    return this._client;
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://localhost:${this._port}${remotePath}`;
  }
  getPathOfUri(uri: string): string {
    return getPath(uri);
  }
}
