Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = loadServicesConfig;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

/**
 * Load service configs, and resolve all of the paths to absolute paths.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

function loadServicesConfig(dirname) {
  return [(_nuclideRemoteUri2 || _nuclideRemoteUri()).default.resolve(dirname, './services-3.json'), (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.resolve(dirname, './fb-services-3.json')].reduce(function (acc, servicePath) {
    if ((_fs2 || _fs()).default.existsSync(servicePath)) {
      var basedir = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(servicePath);
      var src = (_fs2 || _fs()).default.readFileSync(servicePath, 'utf8');
      var jsonConfig = JSON.parse(src);
      acc.push.apply(acc, _toConsumableArray(createServiceConfigObject(basedir, jsonConfig)));
    }
    return acc;
  }, []);
}

/**
 * Takes the contents of a service config JSON file, and formats each entry into
 * a ConfigEntry.
 * Service paths must either be absolute or relative to the service config
 * config file.
 */
function createServiceConfigObject(basedir, jsonConfig) {
  return jsonConfig.map(function (config) {
    return {
      name: config.name,
      // TODO(peterhal): Remove this once all services have had their def files removed.
      definition: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.resolve(basedir, config.definition || config.implementation),
      implementation: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.resolve(basedir, config.implementation),
      preserveFunctionNames: config.preserveFunctionNames === true
    };
  });
}
module.exports = exports.default;