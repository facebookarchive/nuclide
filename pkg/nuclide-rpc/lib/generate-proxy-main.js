"use strict";

function t() {
  const data = _interopRequireWildcard(require("@babel/types"));

  t = function () {
    return data;
  };

  return data;
}

function _generator() {
  const data = _interopRequireDefault(require("@babel/generator"));

  _generator = function () {
    return data;
  };

  return data;
}

function _yargs() {
  const data = _interopRequireDefault(require("yargs"));

  _yargs = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _main() {
  const data = require("./main");

  _main = function () {
    return data;
  };

  return data;
}

function _location() {
  const data = require("./location");

  _location = function () {
    return data;
  };

  return data;
}

function _proxyGenerator() {
  const data = _interopRequireDefault(require("./proxy-generator"));

  _proxyGenerator = function () {
    return data;
  };

  return data;
}

function _serviceParser() {
  const data = require("./service-parser");

  _serviceParser = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/* eslint-disable no-console */
// eslint-disable-next-line nuclide-internal/no-unresolved
const {
  generateProxy
} = (0, _proxyGenerator().default)(t(), _generator().default);

const argv = _yargs().default.usage('Usage: $0 -d path/to/definition -n serviceName').options({
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
}).argv;

const definitionPath = _nuclideUri().default.resolve(argv.definitionPath);

const preserveFunctionNames = argv.preserveFunctionNames;
const serviceName = argv.serviceName; // TODO: Make this a command line option.

const predefinedTypeNames = [_nuclideUri().default.NUCLIDE_URI_TYPE_NAME, 'atom$Point', 'atom$Range'];
const filename = (0, _main().proxyFilename)(definitionPath);

const definitionSource = _fs.default.readFileSync(definitionPath, 'utf8');

const defs = (0, _serviceParser().parseServiceDefinition)(definitionPath, definitionSource, predefinedTypeNames);

if (argv.useBasename) {
  (0, _location().stripLocationsFileName)(defs);
}

const code = generateProxy(argv.serviceName, argv.preserveFunctionNames, defs);

if (argv.validate) {
  try {
    const fakeClient = {};
    const factory = (0, _main().createProxyFactory)(serviceName, preserveFunctionNames, definitionPath, predefinedTypeNames);
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