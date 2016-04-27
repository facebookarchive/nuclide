Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.loadServicesConfig = loadServicesConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var PACKAGE_ROOT = _path2['default'].resolve(__dirname, '..', '..');

/**
 * Load service configs, and resolve all of the paths to absolute paths.
 */

function loadServicesConfig() {
  var publicServices = createServiceConfigObject(require('../../services-3.json'));
  var privateServices = [];
  try {
    privateServices = createServiceConfigObject(require('../../fb/fb-services-3.json'));
  } catch (e) {
    // This file may not exist.
  }
  return publicServices.concat(privateServices);
}

/**
 * Takes the contents of a service config JSON file, and formats each entry into
 * a ConfigEntry.
 */
function createServiceConfigObject(jsonConfig) {
  return jsonConfig.map(function (config) {
    // TODO(peterhal): Remove this once all services have had their def files removed.
    if (config.definition == null) {
      config.definition = config.implementation;
    }
    return {
      name: config.name,
      definition: resolveServicePath(config.definition),
      implementation: resolveServicePath(config.implementation)
    };
  });
}

/**
 * Resolve service path defined in services-3.json to absolute path. The service path could
 * be in one of following forms:
 *   1. A path relative to the folder that contains `service-config.json`.
 *   2. An absolute path.
 *   3. A path in form of `$dependency_package/path/to/service`. For example,
 *      'nuclide-commons/lib/array.js'.
 */
function resolveServicePath(servicePath) {
  try {
    return require.resolve(servicePath);
  } catch (e) {
    return _path2['default'].resolve(PACKAGE_ROOT, servicePath);
  }
}