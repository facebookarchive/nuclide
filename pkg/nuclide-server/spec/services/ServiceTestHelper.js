'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import NuclideServer from '../../lib/NuclideServer';
import NuclideSocket from '../../lib/NuclideSocket';
import {ClientComponent} from '../../../nuclide-rpc';
import type {ConfigEntry} from '../../../nuclide-rpc';

type Services = Array<ConfigEntry>;

export default class ServiceTestHelper {
  _server: NuclideServer;
  _client: ClientComponent<NuclideSocket>;
  _port: number;

  async start(customServices: Services): Promise<void> {
    this._server = new NuclideServer({port: 0}, customServices);
    await this._server.connect();

    const port = this._server._webServer.address().port;
    this._client = new ClientComponent(
      'localhost', port, new NuclideSocket(`http://localhost:${port}`), customServices);
    this._port = port;
  }

  stop(): void {
    this._client.close();
    this._server.close();
  }

  getRemoteService(serviceName: string): any {
    return this._client.getService(serviceName);
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://localhost:${this._port}${remotePath}`;
  }
}
