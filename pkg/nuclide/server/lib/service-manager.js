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

// A cache stores services in form of '$serviceName@$cwd' => $serviceObject.
var cachedServices: Map<string, any> = new Map();

function optionsToString(options: ?any): string {
  if (!options) {
    return '';
  } else if (options instanceof Array) {
    return '[' + options.map(item => optionsToString(item)).join(', ') + ']';
  } else if (options instanceof Object) {
    var keys = Object.keys(options).sort();
    return '{' + keys.map(key => key + ': ' + optionsToString(options[key])).join(', ') + '}';
  } else if (typeof options === 'number' || typeof options === 'boolean' || typeof options === 'string') {
    return JSON.stringify(options);
  } else {
    throw Error('Can\'t stringify %o', options);
  }
}

/**
 * Create a new or retrieve a cached service instance by serviceName and service options.
 */
function getService(serviceName: string, options: any, localImplementationClassPath: string): any {
  var key = serviceName + '@' + optionsToString(options);
  if (!cachedServices.has(key)) {
    logger.debug(`Create service instance: ${key}`);
    var serviceInstance = createLocalService(localImplementationClassPath, options);
    cachedServices.set(key, serviceInstance);
  }
  return cachedServices.get(key);
}

function createLocalService(localImplementationClassPath: string, options: any): any {
  var serviceClass = require(localImplementationClassPath);
  return new serviceClass(options);
}

function getRemoteEventName(serviceName: string, eventMethodName: string, serviceOptions: any): string {
  return getLocalEventName(serviceName, eventMethodName) + '@' + optionsToString(serviceOptions);
}

function getLocalEventName(serviceName: string, eventMethodName: string): string {
  return serviceName + '/' + eventMethodName;
}

module.exports = {
  getService,
  getRemoteEventName,
  optionsToString,
}
