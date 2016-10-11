function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Regenerates the .proxy baseline files in the spec/fixtures directory.

var _serviceParser;

function _load_serviceParser() {
  return _serviceParser = require('./service-parser');
}

var _proxyGenerator;

function _load_proxyGenerator() {
  return _proxyGenerator = require('./proxy-generator');
}

var _location;

function _load_location() {
  return _location = require('./location');
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('fs'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var dir = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(__dirname, '../spec/fixtures');
for (var file of (_fs || _load_fs()).default.readdirSync(dir)) {
  if (file.endsWith('.def')) {
    var serviceName = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(file, '.def');
    var preserveFunctionNames = false;
    var definitionPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(dir, file);

    var definitionSource = (_fs || _load_fs()).default.readFileSync(definitionPath, 'utf8');
    var definitions = (0, (_serviceParser || _load_serviceParser()).parseServiceDefinition)(definitionPath, definitionSource, []);

    (0, (_location || _load_location()).stripLocationsFileName)(definitions);

    var json = mapDefinitions(definitions);
    (_fs || _load_fs()).default.writeFileSync(definitionPath.replace('.def', '.def.json'), JSON.stringify(json, null, 4), 'utf8');

    var code = (0, (_proxyGenerator || _load_proxyGenerator()).generateProxy)(serviceName, preserveFunctionNames, definitions);
    (_fs || _load_fs()).default.writeFileSync(definitionPath.replace('.def', '.proxy'), code, 'utf8');
  }
}

function mapDefinitions(map) {
  var obj = {};
  for (var it of map.values()) {
    var value = undefined;
    switch (it.kind) {
      case 'interface':
        value = {
          constructorArgs: it.constructorArgs,
          instanceMethods: mapToJSON(it.instanceMethods),
          staticMethods: mapToJSON(it.staticMethods)
        };
        break;
      default:
        value = it;
        break;
    }
    obj[it.name] = value;
  }
  return obj;
}

function mapToJSON(map) {
  var result = {};
  for (var it of map.entries()) {
    result[it[0]] = it[1];
  }
  return result;
}