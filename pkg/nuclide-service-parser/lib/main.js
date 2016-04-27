Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getDefinitions = getDefinitions;
exports.getProxy = getProxy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _module2 = require('module');

var _module3 = _interopRequireDefault(_module2);

var _nuclideNodeTranspilerLibNodeTranspiler = require('../../nuclide-node-transpiler/lib/NodeTranspiler');

var _nuclideNodeTranspilerLibNodeTranspiler2 = _interopRequireDefault(_nuclideNodeTranspilerLibNodeTranspiler);

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
// $FlowFixMe

function getDefinitions(definitionPath) {
  var resolvedPath = resolvePath(definitionPath);

  // Cache definitions by the resolved file path they were loaded from.
  if (!definitionsCache.has(resolvedPath)) {
    var _require = require('./service-parser');

    var parseServiceDefinition = _require.parseServiceDefinition;

    definitionsCache.set(resolvedPath, parseServiceDefinition(resolvedPath, _fs2['default'].readFileSync(resolvedPath, 'utf8')));
  }
  return definitionsCache.get(resolvedPath);
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
  var resolvedPath = resolvePath(definitionPath);
  var defs = getDefinitions(definitionPath);

  // Cache proxy factory functions by the resolved definition file path.
  if (!proxiesCache.has(resolvedPath)) {
    var _require2 = require('./proxy-generator');

    var generateProxy = _require2.generateProxy;

    // Transpile this code (since it will use anonymous classes and arrow functions).
    var code = generateProxy(serviceName, defs);
    var filename = _path2['default'].parse(definitionPath).name + 'Proxy.js';
    var transpiled = new _nuclideNodeTranspilerLibNodeTranspiler2['default']().transformWithCache(code, filename);

    // Load the module directly from a string,
    var m = new _module3['default']();
    // as if it were a sibling to this file.
    m.filename = m.id = _path2['default'].join(__dirname, filename);
    m.paths = module.paths;
    m._compile(transpiled, filename);

    // Add the factory function to a cache.
    proxiesCache.set(resolvedPath, {
      factory: m.exports,
      proxies: new WeakMap()
    });
  }

  // Cache remote proxy modules by the (definition path, client object) tuple.
  var cache = proxiesCache.get(resolvedPath);
  (0, _assert2['default'])(cache != null);
  if (!cache.proxies.has(clientObject)) {
    cache.proxies.set(clientObject, cache.factory(clientObject));
  }
  return cache.proxies.get(clientObject);
}

/**
 * Resolve definitionPath based on the caller's module, and fallback to
 * this file's module in case module.parent doesn't exist (we are using repl).
 * Note that `require('module')._resolveFilename(path, module)` is equivelent to
 * `require.resolve(path)` under the context of given module.
 */
function resolvePath(definitionPath) {
  return _module3['default']._resolveFilename(definitionPath, module.parent ? module.parent : module);
}

// Export caches for testing.
var __test__ = {
  definitionsCache: definitionsCache,
  proxiesCache: proxiesCache
};
exports.__test__ = __test__;