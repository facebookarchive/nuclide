'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/**
  * Currently we have two different ways to config a service in service-config.json:
  *   1. `{"useServiceFramework": false, "path": "path/to/service/file"}`, a old fashioned way
  *      to config a service and it is deprecated.
  *   2. `{"useServiceFramework": true,
  *        "definition": "path/to/service/defintion",
  *        "implementation": "path/to/local/implementation"}, use service framework to config
  *      a service definition and a local implementation.
  */

var fs = require('fs-plus');
var path = require('path');

var PACKAGE_ROOT = path.resolve(__dirname, '..');

// Custom services path is defined in "package.json", which is always in the root, so resolve
// the path to the custom services config from the root as well.
var CUSTOM_SERVICES_CONFIG_PATH = path.resolve(
  PACKAGE_ROOT,
  require(path.resolve(PACKAGE_ROOT, 'package.json'))['nuclide']['customServices']
);
var SERVICE_FRAMEWORK_EVENT_CHANNEL = 'service_framework_event';
var SERVICE_FRAMEWORK_RPC_CHANNEL = 'service_framework_rpc';
var SERVICE_FRAMEWORK3_CHANNEL = 'service_framework3_rpc';

var SERVICE_FRAMEWORK_RPC_TIMEOUT_MS = 60 * 1000;
var SERVICES_CONFIG_PATH = path.resolve(PACKAGE_ROOT, 'services-config.json');

function loadConfigs(): Array<any> {
  var configList = require(SERVICES_CONFIG_PATH);

  if (fs.isFileSync(CUSTOM_SERVICES_CONFIG_PATH)) {
    var customConfigs = require(CUSTOM_SERVICES_CONFIG_PATH);
    configList = configList.concat(customConfigs);
  }

  return configList;
}

function loadConfigsOfServiceWithServiceFramework(): Array<any> {
  return loadConfigs()
    .filter(config => config.useServiceFramework)
    .map(config => {
      return {
        name: config.name,
        definition: _resolveServiceConfigPath(config.definition),
        implementation: _resolveServiceConfigPath(config.implementation),
      };
    });
}

function loadConfigsOfServiceWithoutServiceFramework(): Array<string> {
  return loadConfigs()
    .filter(config => !config.useServiceFramework)
    .map(config => _resolveServiceConfigPath(config.path));
}

/**
  * Resolve service path defined in service-config.json to absolute path. The service path could
  * be in one of following forms:
  *   1. A path relative to the folder contains `service-config.json`.
  *   2. An absolute path.
  *   3. A path in form of `$dependency_package/path/to/service`. For example,
  *      'nuclide-commons/lib/array.js'.
  */
function _resolveServiceConfigPath(serviceConfigPath: string): string {
  try {
    return require.resolve(serviceConfigPath);
  } catch (e) {
    return path.resolve(path.dirname(SERVICES_CONFIG_PATH), serviceConfigPath);
  }
}

module.exports = {
  loadConfigsOfServiceWithoutServiceFramework,
  loadConfigsOfServiceWithServiceFramework,
  SERVICE_FRAMEWORK_EVENT_CHANNEL,
  SERVICE_FRAMEWORK_RPC_CHANNEL,
  SERVICE_FRAMEWORK_RPC_TIMEOUT_MS,
  SERVICE_FRAMEWORK3_CHANNEL,
};
