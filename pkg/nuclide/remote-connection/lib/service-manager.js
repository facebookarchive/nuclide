'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';

const logger = require('../../logging').getLogger();
const {RemoteConnection} = require('./RemoteConnection');
const {isRemote, getHostname} = require('../../remote-uri');

import {getProxy} from '../../service-parser';
import invariant from 'assert';
import ServiceFramework from '../../server/lib/serviceframework';
import ServiceLogger from './ServiceLogger';

const newServices = ServiceFramework.loadServicesConfig();

// A cache stores services in form of '$serviceName@$host:$options' => $serviceObject. A special
// case would be the local service, where the $host will be empty string.
const cachedServices: Map<string, any> = new Map();

RemoteConnection.onDidCloseRemoteConnection((connection: RemoteConnection) => {
  for (const cacheEntry of cachedServices) {
    const [cacheKey, serviceInstance] = cacheEntry;
    if (serviceInstance._connection === connection) {
      cachedServices.delete(cacheKey);
    }
  }
});

/**
 * Get a remote v3 service by service name and remote connection.
 */
function getRemoteServiceByRemoteConnection(
  serviceName: string,
  connection: RemoteConnection,
): ?any {
  const [serviceConfig] = newServices.filter(config => config.name === serviceName);
  if (serviceConfig) {
    return getProxy(serviceConfig.name, serviceConfig.definition, connection.getClient());
  } else {
    logger.error('Service %s undefined.', serviceName);
    return null;
  }
}

/**
 * Create or get a cached service with given serviceOptions.
 * @param nuclideUri It could either be either a local path or a remote path in form of
 *    `nuclide:$host:$port/$path`. The function will use the $host from remote path to
 *    create a remote service with given serviceOptions or create a local service if the
 *    uri is local path.
 */
function getServiceByNuclideUri(
  serviceName: string,
  nuclideUri: ?NuclideUri = null,
  serviceOptions: ?any = null
): ?any {
  const hostname = (nuclideUri && isRemote(nuclideUri)) ?
    getHostname(nuclideUri) :
    null;
  return getService(serviceName, hostname, serviceOptions);
}

/**
 * Create or get a cached service with given serviceOptions. If hostname is null or empty string,
 * it returns a local service, otherwise a remote service will be returned. For the same host
 * serviceOptions, the same service instance will be returned.
 */
function getService(serviceName: string, hostname: ?string, serviceOptions: ?any): ?any {
  /** First, try to find a 3.0 service */
  const [serviceConfig] = newServices.filter(config => config.name === serviceName);
  invariant(serviceConfig);
  if (hostname) {
    const remoteConnection = RemoteConnection.getByHostnameAndPath(hostname, null);
    if (remoteConnection == null) {
      return null;
    }
    return getProxy(serviceConfig.name, serviceConfig.definition, remoteConnection.getClient());
  } else {
    // $FlowIgnore
    return require(serviceConfig.implementation);
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
  getRemoteServiceByRemoteConnection,
};
