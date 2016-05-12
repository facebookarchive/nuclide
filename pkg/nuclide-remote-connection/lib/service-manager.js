'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {Transport} from '../../nuclide-rpc';

import {ServerConnection} from './ServerConnection';
import {isRemote, getHostname} from '../../nuclide-remote-uri';
import invariant from 'assert';
import {loadServicesConfig} from '../../nuclide-server/lib/services';
import ServiceLogger from './ServiceLogger';
import {
  LoopbackTransports,
  ServiceRegistry,
  ClientConnection,
  ClientComponent,
} from '../../nuclide-rpc';

const logger = require('../../nuclide-logging').getLogger();
const newServices = loadServicesConfig();

let localRpcClient: ?ClientComponent<Transport> = null;
let knownLocalRpc = false;

// Creates a local RPC client that we can use to ensure that
// local service calls have the same behavior as remote RPC calls.
function createLocalRpcClient(): ClientComponent<Transport> {
  const localTransports = new LoopbackTransports();
  const serviceRegistry = ServiceRegistry.createRemote(newServices);
  const localClientConnection
    = new ClientConnection('server', serviceRegistry, localTransports.serverTransport);
  invariant(localClientConnection != null); // silence lint...
  return ClientComponent.createLocal(localTransports.clientTransport, newServices);
}

function setUseLocalRpc(value: boolean): void {
  invariant(!knownLocalRpc, 'setUseLocalRpc must be called exactly once');
  knownLocalRpc = true;
  if (value) {
    localRpcClient = createLocalRpcClient();
  }
}

function getlocalService(serviceName: string): Object {
  invariant(knownLocalRpc, 'Must call setUseLocalRpc before getService');
  if (localRpcClient != null) {
    return localRpcClient.getService(serviceName);
  } else {
    const [serviceConfig] = newServices.filter(config => config.name === serviceName);
    invariant(serviceConfig, `No config found for service ${serviceName}`);
    // $FlowIgnore
    return require(serviceConfig.implementation);
  }
}

/**
 * Create or get a cached service.
 * @param nuclideUri It could either be either a local path or a remote path in form of
 *    `nuclide:$host:$port/$path`. The function will use the $host from remote path to
 *    create a remote service or create a local service if the uri is local path.
 */
function getServiceByNuclideUri(
  serviceName: string,
  nuclideUri: ?NuclideUri = null
): ?any {
  const hostname = (nuclideUri && isRemote(nuclideUri)) ?
    getHostname(nuclideUri) :
    null;
  return getService(serviceName, hostname);
}

/**
 * Create or get a cached service. If hostname is null or empty string,
 * it returns a local service, otherwise a remote service will be returned.
 */
function getService(serviceName: string, hostname: ?string): ?any {
  if (hostname) {
    const serverConnection = ServerConnection.getByHostname(hostname);
    if (serverConnection == null) {
      return null;
    }
    return serverConnection.getService(serviceName);
  } else {
    return getlocalService(serviceName);
  }
}

let serviceLogger: ?ServiceLogger;
function getServiceLogger(): ServiceLogger {
  if (!serviceLogger) {
    serviceLogger = new ServiceLogger();
    serviceLogger.onNewItem(item => {
      // TODO(t8579744): Log these to a separate file. Note that whatever file is used should also
      // be included in bug reports.
      logger.debug('Service call:', item.service, item.method, item.isLocal, item.argInfo);
    });
  }
  return serviceLogger;
}

module.exports = {
  getService,
  getServiceByNuclideUri,
  getServiceLogger,
  setUseLocalRpc,
};
