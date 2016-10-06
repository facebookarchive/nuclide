function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-console */

var _yargs2;

function _yargs() {
  return _yargs2 = _interopRequireDefault(require('yargs'));
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _main2;

function _main() {
  return _main2 = require('./main');
}

var _location2;

function _location() {
  return _location2 = require('./location');
}

var _proxyGenerator2;

function _proxyGenerator() {
  return _proxyGenerator2 = require('./proxy-generator');
}

var _serviceParser2;

function _serviceParser() {
  return _serviceParser2 = require('./service-parser');
}

var argv = (_yargs2 || _yargs()).default.usage('Usage: $0 -d path/to/definition -n serviceName').options({
  definitionPath: {
    demand: true,
    describe: 'Path to definition',
    type: 'string'
  },
  serviceName: {
    demand: true,
    describe: 'Service name',
    type: 'string'
  },
  preserveFunctionNames: {
    demand: false,
    'default': false,
    describe: 'Preserve function names',
    type: 'boolean'
  },
  useBasename: {
    demand: false,
    'default': false,
    describe: 'Removes full paths from definitions in favor of base names',
    type: 'boolean'
  },
  save: {
    demand: false,
    'default': false,
    describe: 'Save the proxy next to definition file',
    type: 'boolean'
  },
  code: {
    demand: false,
    'default': false,
    describe: 'Prints the proxy code',
    type: 'boolean'
  },
  json: {
    demand: false,
    'default': false,
    describe: 'Prints details in JSON format',
    type: 'boolean'
  },
  validate: {
    demand: false,
    'default': false,
    describe: 'Validate the proxy by running it',
    type: 'boolean'
  }
}).argv;

var definitionPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.resolve(argv.definitionPath);
var preserveFunctionNames = argv.preserveFunctionNames;
var serviceName = argv.serviceName;

// TODO: Make this a command line option.
var predefinedTypeNames = [(_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.NUCLIDE_URI_TYPE_NAME, 'atom$Point', 'atom$Range'];

var filename = (0, (_main2 || _main()).proxyFilename)(definitionPath);
var definitionSource = (_fs2 || _fs()).default.readFileSync(definitionPath, 'utf8');
var defs = (0, (_serviceParser2 || _serviceParser()).parseServiceDefinition)(definitionPath, definitionSource, predefinedTypeNames);
if (argv.useBasename) {
  (0, (_location2 || _location()).stripLocationsFileName)(defs);
}
var code = (0, (_proxyGenerator2 || _proxyGenerator()).generateProxy)(argv.serviceName, argv.preserveFunctionNames, defs);

if (argv.validate) {
  try {
    var fakeClient = {};
    var factory = (0, (_main2 || _main()).createProxyFactory)(serviceName, preserveFunctionNames, definitionPath, predefinedTypeNames);
    factory(fakeClient);
  } catch (e) {
    console.error('Failed to validate "' + definitionPath + '"');
    throw e;
  }
}

if (argv.save) {
  (_fs2 || _fs()).default.writeFileSync(filename, code);
}

if (argv.json) {
  console.log(JSON.stringify({
    src: definitionPath,
    dest: filename,
    code: argv.code ? code : undefined
  }, null, 2));
} else if (argv.code) {
  console.log(code);
}