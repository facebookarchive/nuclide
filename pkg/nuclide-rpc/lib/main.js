Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getDefinitions = getDefinitions;
exports.getProxy = getProxy;
exports.createProxyFactory = createProxyFactory;

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

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _module2;

function _module() {
  return _module2 = _interopRequireDefault(require('module'));
}

var _nuclideNodeTranspilerLibNodeTranspiler2;

function _nuclideNodeTranspilerLibNodeTranspiler() {
  return _nuclideNodeTranspilerLibNodeTranspiler2 = _interopRequireDefault(require('../../nuclide-node-transpiler/lib/NodeTranspiler'));
}

var _proxyGenerator2;

function _proxyGenerator() {
  return _proxyGenerator2 = require('./proxy-generator');
}

var _serviceParser2;

function _serviceParser() {
  return _serviceParser2 = require('./service-parser');
}

/** Cache for definitions. */
var definitionsCache = new Map();
/** Cache for remote proxies. */
var proxiesCache = new Map();

/**
 * Load the definitions, cached by their resolved file path.
 * @param definitionPath - The path to the definition file, relative to the module of
 *  the caller.
 * @returns - The Definitions that represents the API of the definiition file.
 */

function getDefinitions(definitionPath) {
  if (!definitionsCache.has(definitionPath)) {
    definitionsCache.set(definitionPath, loadDefinitions(definitionPath));
  }
  var result = definitionsCache.get(definitionPath);
  (0, (_assert2 || _assert()).default)(result != null);
  return result;
}

function loadDefinitions(definitionPath) {
  var resolvedPath = resolvePath(definitionPath);
  return (0, (_serviceParser2 || _serviceParser()).parseServiceDefinition)(resolvedPath, (_fs2 || _fs()).default.readFileSync(resolvedPath, 'utf8'));
}

/**
 * Get a proxy module for a given (service, client) pair. This function generates
 * the definitions if the they don't exist, and caches the proxy module if it has
 * already been generated before.
 * @param clientObject {ClientComponent} The client object that needs to be able to marhsal
 *   and unmarshal objects, as well as make RPC calls.
 * @returns - A proxy module that exports the API specified by the definition
 */

function getProxy(serviceName, definitionPath, clientObject) {
  if (!proxiesCache.has(definitionPath)) {
    proxiesCache.set(definitionPath, createProxyFactory(serviceName, definitionPath));
  }

  var factory = proxiesCache.get(definitionPath);
  (0, (_assert2 || _assert()).default)(factory != null);
  return factory(clientObject);
}

function createProxyFactory(serviceName, definitionPath) {
  // Transpile this code (since it will use anonymous classes and arrow functions).
  var defs = getDefinitions(definitionPath);
  var code = (0, (_proxyGenerator2 || _proxyGenerator()).generateProxy)(serviceName, defs);
  var filename = (_path2 || _path()).default.parse(definitionPath).name + 'Proxy.js';
  var m = transpileToModule(code, filename);

  return m.exports;
}

function transpileToModule(code, filename) {
  var transpiled = new (_nuclideNodeTranspilerLibNodeTranspiler2 || _nuclideNodeTranspilerLibNodeTranspiler()).default().transformWithCache(code, filename);

  // Load the module directly from a string,
  var m = new (_module2 || _module()).default();
  // as if it were a sibling to this file.
  m.filename = m.id = (_path2 || _path()).default.join(__dirname, filename);
  m.paths = module.paths;
  m._compile(transpiled, filename);

  return m;
}

/**
 * Resolve definitionPath based on the caller's module, and fallback to
 * this file's module in case module.parent doesn't exist (we are using repl).
 * Note that `require('module')._resolveFilename(path, module)` is equivelent to
 * `require.resolve(path)` under the context of given module.
 */
function resolvePath(definitionPath) {
  return (_module2 || _module()).default._resolveFilename(definitionPath, module.parent ? module.parent : module);
}

// Export caches for testing.
var __test__ = {
  definitionsCache: definitionsCache,
  proxiesCache: proxiesCache
};
exports.__test__ = __test__;