'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {getPath} = require('nuclide-remote-uri');
var {requireRemoteServiceSync} = require('nuclide-service-transformer');
var NuclideServer = require('../lib/NuclideServer');
var NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');
var NuclideClient = require('../lib/NuclideClient');

class _RemoteConnectionMock {
  constructor(client: NuclideClient, port: number) {
    this._client = client;
    this._port = port;
  }

  makeRpc(serviceUri: string, args: Array<any>, serviceOptions: any): Promise<any> {
    return this._client.makeRpc(serviceUri, args, serviceOptions);
  }

  registerEventListener(eventName: string, callback: (payload: any) => void, serviceOptions: any): Disposable {
    return this._client.registerEventListener(eventName, callback, serviceOptions);
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://localhost:${this._port}/${remotePath}`;
  }

  getPathOfUri(uri: string): string {
    return getPath(uri);
  }
}

/**
 * A helper class for service framework integration test.
 *
 * Usage:
 * ```
 * var testHelper =
 *     new ServiceIntegrationTestHelper($className, $definitionPath, $implementationPath);
 *
 * await testHelper.start();
 *
 * var remoteService = testHelper.getRemoteService($serviceOptions);
 * var localService = testHelper.getLocalService($serviceOptions);
 *
 * ... // Do your test.
 *
 * testHelper.stop();
 * ```
 */
class ServiceIntegrationTestHelper {
  constructor(className: string, definitionPath: string, implementationPath: string) {
    this._className = className;
    this._definitionPath = definitionPath;
    this._implementationPath = implementationPath;
    spyOn(require('../lib/config'), 'loadConfigsOfServiceWithServiceFramework')
        .andCallFake(() => {
          return [{
            name: className,
            definition: definitionPath,
            implementation: implementationPath,
          }];
        });
    spyOn(require('../lib/config'), 'loadConfigsOfServiceWithoutServiceFramework')
        .andCallFake(() => {
          return [];
        });
  }

  async start(): Promise<void> {
    this._server = new NuclideServer({port: 0});
    await this._server.connect();

    var port = this._server._webServer.address().port;
    this._client = new NuclideClient(
      'test', new NuclideRemoteEventbus(`nuclide://localhost:${port}`));
    this._connection = new _RemoteConnectionMock(this._client, port);
  }

  stop(): void {
    this._client.eventbus.socket.close();
    this._server.close();
  }

  getRemoteService(serviceOptions={}: any): any {
    var remoteServiceClass = requireRemoteServiceSync(this._definitionPath, this._className);
    return new remoteServiceClass(this._connection, serviceOptions);
  }

  getLocalService(serviceOptions={}: any): any {
    var serviceClass = require(this._implementationPath);
    return new serviceClass(serviceOptions);
  }

  getRemoteConnection(): _RemoteConnectionMock {
    return this._connection;
  }
}

module.exports = ServiceIntegrationTestHelper;
