'use strict';

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _main;

function _load_main() {
  return _main = require('./main');
}

var _location;

function _load_location() {
  return _location = require('./location');
}

var _proxyGenerator;

function _load_proxyGenerator() {
  return _proxyGenerator = require('./proxy-generator');
}

var _serviceParser;

function _load_serviceParser() {
  return _serviceParser = require('./service-parser');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = (_yargs || _load_yargs()).default.usage('Usage: $0 -d path/to/definition -n serviceName').options({
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
    default: false,
    describe: 'Preserve function names',
    type: 'boolean'
  },
  useBasename: {
    demand: false,
    default: false,
    describe: 'Removes full paths from definitions in favor of base names',
    type: 'boolean'
  },
  save: {
    demand: false,
    default: false,
    describe: 'Save the proxy next to definition file',
    type: 'boolean'
  },
  code: {
    demand: false,
    default: false,
    describe: 'Prints the proxy code',
    type: 'boolean'
  },
  json: {
    demand: false,
    default: false,
    describe: 'Prints details in JSON format',
    type: 'boolean'
  },
  validate: {
    demand: false,
    default: false,
    describe: 'Validate the proxy by running it',
    type: 'boolean'
  }
}).argv; /**
          * Copyright (c) 2015-present, Facebook, Inc.
          * All rights reserved.
          *
          * This source code is licensed under the license found in the LICENSE file in
          * the root directory of this source tree.
          *
          * 
          * @format
          */

/* eslint-disable no-console */

const definitionPath = (_nuclideUri || _load_nuclideUri()).default.resolve(argv.definitionPath);
const preserveFunctionNames = argv.preserveFunctionNames;
const serviceName = argv.serviceName;

// TODO: Make this a command line option.
const predefinedTypeNames = [(_nuclideUri || _load_nuclideUri()).default.NUCLIDE_URI_TYPE_NAME, 'atom$Point', 'atom$Range'];

const filename = (0, (_main || _load_main()).proxyFilename)(definitionPath);
const definitionSource = _fs.default.readFileSync(definitionPath, 'utf8');
const defs = (0, (_serviceParser || _load_serviceParser()).parseServiceDefinition)(definitionPath, definitionSource, predefinedTypeNames);
if (argv.useBasename) {
  (0, (_location || _load_location()).stripLocationsFileName)(defs);
}
const code = (0, (_proxyGenerator || _load_proxyGenerator()).generateProxy)(argv.serviceName, argv.preserveFunctionNames, defs);

if (argv.validate) {
  try {
    const fakeClient = {};
    const factory = (0, (_main || _load_main()).createProxyFactory)(serviceName, preserveFunctionNames, definitionPath, predefinedTypeNames);
    factory(fakeClient);
  } catch (e) {
    console.error(`Failed to validate "${definitionPath}"`);
    throw e;
  }
}

if (argv.save) {
  _fs.default.writeFileSync(filename, code);
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