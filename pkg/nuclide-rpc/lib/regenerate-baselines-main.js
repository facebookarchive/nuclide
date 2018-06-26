'use strict';

var _types;

function _load_types() {
  return _types = _interopRequireWildcard(require('@babel/types'));
}

var _generator;

function _load_generator() {
  return _generator = _interopRequireDefault(require('@babel/generator'));
}

var _serviceParser;

function _load_serviceParser() {
  return _serviceParser = require('./service-parser');
}

var _proxyGenerator;

function _load_proxyGenerator() {
  return _proxyGenerator = _interopRequireDefault(require('./proxy-generator'));
}

var _location;

function _load_location() {
  return _location = require('./location');
}

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// eslint-disable-next-line nuclide-internal/no-unresolved
const { generateProxy } = (0, (_proxyGenerator || _load_proxyGenerator()).default)(_types || _load_types(), (_generator || _load_generator()).default); /**
                                                                                                                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                         * All rights reserved.
                                                                                                                                                         *
                                                                                                                                                         * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                         * the root directory of this source tree.
                                                                                                                                                         *
                                                                                                                                                         * 
                                                                                                                                                         * @format
                                                                                                                                                         */

// Regenerates the .proxy baseline files in the spec/fixtures directory.

const dir = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../spec/fixtures');
for (const file of _fs.default.readdirSync(dir)) {
  if (file.endsWith('.def')) {
    const serviceName = (_nuclideUri || _load_nuclideUri()).default.basename(file, '.def');
    const preserveFunctionNames = false;
    const definitionPath = (_nuclideUri || _load_nuclideUri()).default.join(dir, file);

    const definitionSource = _fs.default.readFileSync(definitionPath, 'utf8');
    const definitions = (0, (_serviceParser || _load_serviceParser()).parseServiceDefinition)(definitionPath, definitionSource, []);

    (0, (_location || _load_location()).stripLocationsFileName)(definitions);

    _fs.default.writeFileSync(definitionPath.replace('.def', '.def.json'), JSON.stringify(definitions, null, 4), 'utf8');

    const code = generateProxy(serviceName, preserveFunctionNames, definitions);
    _fs.default.writeFileSync(definitionPath.replace('.def', '.proxy'), code, 'utf8');
  }
}