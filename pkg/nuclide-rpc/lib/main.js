"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxyFilename = proxyFilename;
exports.createProxyFactory = createProxyFactory;
exports.__test__ = void 0;

function _memoize2() {
  const data = _interopRequireDefault(require("lodash/memoize"));

  _memoize2 = function () {
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

var _module = _interopRequireDefault(require("module"));

var _os = _interopRequireDefault(require("os"));

function _memoizeWithDisk() {
  const data = _interopRequireDefault(require("../../commons-node/memoizeWithDisk"));

  _memoizeWithDisk = function () {
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

/** Cache for remote proxies. */
const proxiesCache = new Map();

function proxyFilename(definitionPath) {
  if (!_nuclideUri().default.isAbsolute(definitionPath)) {
    throw new Error(`"${definitionPath}" definition path must be absolute.`);
  }

  const dir = _nuclideUri().default.dirname(definitionPath);

  const name = _nuclideUri().default.basename(definitionPath, _nuclideUri().default.extname(definitionPath));

  const filename = _nuclideUri().default.join(dir, name + 'Proxy.js');

  return filename;
}

function createProxyFactory(serviceName, preserveFunctionNames, definitionPath, predefinedTypes) {
  if (!proxiesCache.has(definitionPath)) {
    const filename = proxyFilename(definitionPath);
    let code;

    if (_fs.default.existsSync(filename)) {
      code = _fs.default.readFileSync(filename, 'utf8');
    } else {
      const definitionSource = _fs.default.readFileSync(definitionPath, 'utf8');

      const defs = (0, _serviceParser().parseServiceDefinition)(definitionPath, definitionSource, predefinedTypes);
      code = memoizedGenerateProxy(serviceName, preserveFunctionNames, defs);
    }

    const m = loadCodeAsModule(code, filename);
    proxiesCache.set(definitionPath, m.exports);
  }

  const factory = proxiesCache.get(definitionPath);

  if (!(factory != null)) {
    throw new Error("Invariant violation: \"factory != null\"");
  }

  return factory;
}

const memoizedReadFile = (0, _memoize2().default)(filename => {
  return _fs.default.readFileSync(filename, 'utf8');
});
const memoizedGenerateProxy = (0, _memoizeWithDisk().default)(function generateProxy(serviceName, preserveFunctionNames, defs) {
  // External dependencies: ensure that they're included in the key below.
  const createProxyGenerator = require("./proxy-generator").default;

  const generate = require('@babel/generator').default;

  const t = require('@babel/types');

  return createProxyGenerator(t, generate).generateProxy(serviceName, preserveFunctionNames, defs);
}, (serviceName, preserveFunctionNames, defs) => [serviceName, preserveFunctionNames, defs, memoizedReadFile(require.resolve("./proxy-generator")), require('@babel/generator/package.json').version, require('@babel/types/package.json').version], _nuclideUri().default.join(_os.default.tmpdir(), 'nuclide-rpc-cache'));

function loadCodeAsModule(code, filename) {
  if (!(code.length > 0)) {
    throw new Error('Code must not be empty.');
  }

  const m = new _module.default(filename);
  m.filename = filename;
  m.paths = []; // Disallow require resolving by removing lookup paths.

  m._compile(code, filename);

  m.loaded = true;
  return m;
} // Export caches for testing.


const __test__ = {
  proxiesCache
};
exports.__test__ = __test__;