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

function _serviceParser() {
  const data = require("./service-parser");

  _serviceParser = function () {
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

function _location() {
  const data = require("./location");

  _location = function () {
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
// Regenerates the .proxy baseline files in the spec/fixtures directory.
// eslint-disable-next-line nuclide-internal/no-unresolved
const {
  generateProxy
} = (0, _proxyGenerator().default)(t(), _generator().default);

const dir = _nuclideUri().default.join(__dirname, '../spec/fixtures');

for (const file of _fs.default.readdirSync(dir)) {
  if (file.endsWith('.def')) {
    const serviceName = _nuclideUri().default.basename(file, '.def');

    const preserveFunctionNames = false;

    const definitionPath = _nuclideUri().default.join(dir, file);

    const definitionSource = _fs.default.readFileSync(definitionPath, 'utf8');

    const definitions = (0, _serviceParser().parseServiceDefinition)(definitionPath, definitionSource, []);
    (0, _location().stripLocationsFileName)(definitions);

    _fs.default.writeFileSync(definitionPath.replace('.def', '.def.json'), JSON.stringify(definitions, null, 4), 'utf8');

    const code = generateProxy(serviceName, preserveFunctionNames, definitions);

    _fs.default.writeFileSync(definitionPath.replace('.def', '.proxy'), code, 'utf8');
  }
}