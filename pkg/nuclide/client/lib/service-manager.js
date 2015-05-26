'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var logger = require('nuclide-logging').getLogger();
var {loadConfigsOfServiceWithServiceFramework} = require('nuclide-server/lib/config');
var {optionsToString} = require('nuclide-server/lib/service-manager');
var {RemoteConnection} = require('nuclide-remote-connection');
var {isRemote, getHostname} = require('nuclide-remote-uri');

var serviceConfigs = loadConfigsOfServiceWithServiceFramework();

// A cache stores services in form of '$serviceName@$host:$options' => $serviceObject. A special
// case would be the local service, where the $host will be empty string.
var cachedServices: Map<string, mixed> = new Map();

/**
 * Create or get a cached service with given serviceOptions.
 * @param nuclideUri It could either be either a local path or a remote path in form of
 *    `nuclide:$host:$port/$path`. The function will use the $host from remote path to
 *    create a remote service with given serviceOptions or create a local service if the
 *    uri is local path.
 */
function getServiceByNuclideUri(serviceName: string, nuclideUri=null: ?NuclideUri, serviceOptions=null: ?mixed): ?mixed {
  var hostname = (nuclideUri && isRemote(nuclideUri)) ? getHostname(nuclideUri) : null;
  return getService(serviceName, hostname, serviceOptions);
}

/**
 * Create or get a cached service with given serviceOptions. If hostname is null or empty string,
 * it returns a local service, otherwise a remote service will be returned. For the same host
 * serviceOptions, the same service instance will be returned.
 */
function getService(serviceName: string, hostname: ?string, serviceOptions: ?mixed): ?mixed {
  var [serviceConfig] = serviceConfigs.filter(config => config.name === serviceName);
  if (!serviceConfig) {
    logger.error('Service %s undefined.', serviceName);
    return null;
  }

  var cacheKey = serviceName + '@' + (hostname ? hostname : '') + ':' + optionsToString(serviceOptions);

  if (cachedServices.has(cacheKey)) {
    return cachedServices.get(cacheKey);
  }

  serviceOptions = serviceOptions || {};

  if (hostname) {
    var serviceInstance = createRemoteService(serviceConfig, hostname, serviceOptions);
  } else {
    var serviceInstance = createLocalService(serviceConfig, serviceOptions);
  }
  cachedServices.set(cacheKey, serviceInstance);

  return serviceInstance;
}

function createRemoteService(serviceConfig: ServiceConfig, hostname: string, serviceOptions: mixed): mixed {
  var {requireRemoteServiceSync} = require('nuclide-service-transformer');
  var remoteServiceClass = requireRemoteServiceSync(serviceConfig.definition);
  var remoteConnection = RemoteConnection.getByHostnameAndPath(hostname, null);
  return new remoteServiceClass(remoteConnection, serviceOptions);
}

function createLocalService(serviceConfig: ServiceConfig, serviceOptions: mixed): mixed {
  var serviceClass = require(serviceConfig.implementation);
  return new serviceClass(serviceOptions);
}

module.exports = {
  getService,
  getServiceByNuclideUri,
};
