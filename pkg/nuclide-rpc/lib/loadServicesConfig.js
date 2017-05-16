'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadServicesConfig;

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Load service configs, and resolve all of the paths to absolute paths.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function loadServicesConfig(dirname) {
  return [(_nuclideUri || _load_nuclideUri()).default.resolve(dirname, './services-3.json'), (_nuclideUri || _load_nuclideUri()).default.resolve(dirname, './fb-services-3.json')].reduce((acc, servicePath) => {
    if (_fs.default.existsSync(servicePath)) {
      const basedir = (_nuclideUri || _load_nuclideUri()).default.dirname(servicePath);
      const src = _fs.default.readFileSync(servicePath, 'utf8');
      const jsonConfig = JSON.parse(src);
      acc.push(...createServiceConfigObject(basedir, jsonConfig));
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
  return jsonConfig.map(config => {
    return {
      name: config.name,
      // TODO(peterhal): Remove this once all services have had their def files removed.
      definition: (_nuclideUri || _load_nuclideUri()).default.resolve(basedir, config.definition || config.implementation),
      implementation: (_nuclideUri || _load_nuclideUri()).default.resolve(basedir, config.implementation),
      preserveFunctionNames: config.preserveFunctionNames === true
    };
  });
}