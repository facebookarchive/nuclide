'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getPath} from 'nuclide-remote-uri';
import {getProxy, getDefinitions} from 'nuclide-service-parser';
import NuclideServer from '../../lib/NuclideServer';
import NuclideClient from '../../lib/NuclideClient';
import NuclideRemoteEventbus from '../../lib/NuclideRemoteEventbus';
import TypeRegistry from 'nuclide-service-parser/lib/TypeRegistry';

var logger = require('nuclide-logging').getLogger();

type Services = Array<{name: string, definition: string, implementation: string}>;

export default class ServiceTestHelper {
  _server: NuclideServer;
  _client: NuclideClient;
  _connection: _RemoteConnectionMock;

  async start(customServices: ?Services): Promise<void> {
    if (customServices) {
      spyOn(NuclideServer.prototype, '_loadServicesConfig').andReturn(customServices);
    }

    this._server = new NuclideServer({port: 0});
    await this._server.connect();

    var port = this._server._webServer.address().port;
    this._client = new NuclideClient('test',
      new NuclideRemoteEventbus(`nuclide://localhost:${port}`));
    this._connection = new _RemoteConnectionMock(this._client, port, customServices);
  }

  stop(): void {
    this._client.eventbus.socket.close();
    this._server.close();
  }

  getRemoteService(serviceDefinitionFile: string): any {
    return getProxy(serviceDefinitionFile, this._connection);
  }
}

class _RemoteConnectionMock {
  _client: NuclideClient;
  _port: number;
  _typeRegistry: TypeRegistry;
  constructor(client: NuclideClient, port: number, customServices: ?Services) {
    this._client = client;
    this._port = port;
    this._typeRegistry = new TypeRegistry();

    // Setup services.
    var services = customServices || require('../../services-3.json');
    for (var service of services) {
      logger.info(`Registering 3.0 service ${service.name}...`);
      try {
        var defs = getDefinitions(service.definition);
        defs.aliases.forEach((type, name) => {
          logger.info(`Registering type alias ${name}...`);
          this._typeRegistry.registerAlias(name, type);
        });
      } catch(e) {
        logger.error(`Failed to load service ${service.name}. Stack Trace:\n${e.stack}`);
        continue;
      }
    }

    this._typeRegistry.registerType('NuclideUri',
      uri => this.getPathOfUri(uri),
      path => this.getUriOfRemotePath(path));
  }
  callRemoteFunction(functionName: string, returnType: string, args: Array<any>) {
    return this._client.callRemoteFunction(functionName, returnType, args);
  }
  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://localhost:${this._port}${remotePath}`;
  }
  getPathOfUri(uri: string): string {
    return getPath(uri);
  }
  marshal(...args): any {
    return this._typeRegistry.marshal.apply(this._typeRegistry, args);
  }
  unmarshal(...args): any {
    return this._typeRegistry.unmarshal.apply(this._typeRegistry, args);
  }
}
