function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Regenerates the .proxy baseline files in the spec/fixtures directory.

var _serviceParser2;

function _serviceParser() {
  return _serviceParser2 = require('./service-parser');
}

var _proxyGenerator2;

function _proxyGenerator() {
  return _proxyGenerator2 = require('./proxy-generator');
}

var _location2;

function _location() {
  return _location2 = require('./location');
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var dir = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, '../spec/fixtures');
for (var file of (_fs2 || _fs()).default.readdirSync(dir)) {
  if (file.endsWith('.def')) {
    var serviceName = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(file, '.def');
    var preserveFunctionNames = false;
    var definitionPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(dir, file);

    var definitionSource = (_fs2 || _fs()).default.readFileSync(definitionPath, 'utf8');
    var definitions = (0, (_serviceParser2 || _serviceParser()).parseServiceDefinition)(definitionPath, definitionSource, []);

    (0, (_location2 || _location()).stripLocationsFileName)(definitions);

    var json = mapDefinitions(definitions);
    (_fs2 || _fs()).default.writeFileSync(definitionPath.replace('.def', '.def.json'), JSON.stringify(json, null, 4), 'utf8');

    var code = (0, (_proxyGenerator2 || _proxyGenerator()).generateProxy)(serviceName, preserveFunctionNames, definitions);
    (_fs2 || _fs()).default.writeFileSync(definitionPath.replace('.def', '.proxy'), code, 'utf8');
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