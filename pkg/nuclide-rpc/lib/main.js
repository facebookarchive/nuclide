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

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _module2;

function _module() {
  return _module2 = _interopRequireDefault(require('module'));
}

var _proxyGenerator2;

function _proxyGenerator() {
  return _proxyGenerator2 = require('./proxy-generator');
}

var _serviceParser2;

function _serviceParser() {
  return _serviceParser2 = require('./service-parser');
}

// Proxy dependencies

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
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
    (0, (_assert2 || _assert()).default)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isAbsolute(definitionPath), '"' + definitionPath + '" definition path must be absolute.');
    var definitionSource = (_fs2 || _fs()).default.readFileSync(definitionPath, 'utf8');
    var def = (0, (_serviceParser2 || _serviceParser()).parseServiceDefinition)(definitionPath, definitionSource);
    definitionsCache.set(definitionPath, def);
  }
  var result = definitionsCache.get(definitionPath);
  (0, (_assert2 || _assert()).default)(result != null);
  return result;
}

/**
 * Get a proxy module for a given (service, client) pair. This function generates
 * the definitions if the they don't exist, and caches the proxy module if it has
 * already been generated before.
 * @param clientObject {RpcConnection} The client object that needs to be able to marhsal
 *   and unmarshal objects, as well as make RPC calls.
 * @returns - A proxy module that exports the API specified by the definition
 */

function getProxy(serviceName, definitionPath, clientObject) {
  if (!proxiesCache.has(definitionPath)) {
    (0, (_assert2 || _assert()).default)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isAbsolute(definitionPath), '"' + definitionPath + '" definition path must be absolute.');
    proxiesCache.set(definitionPath, createProxyFactory(serviceName, false, definitionPath));
  }

  var factory = proxiesCache.get(definitionPath);
  (0, (_assert2 || _assert()).default)(factory != null);
  return factory(clientObject);
}

function createProxyFactory(serviceName, preserveFunctionNames, definitionPath) {
  (0, (_assert2 || _assert()).default)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isAbsolute(definitionPath), '"' + definitionPath + '" definition path must be absolute.');

  var defs = getDefinitions(definitionPath);
  var code = (0, (_proxyGenerator2 || _proxyGenerator()).generateProxy)(serviceName, preserveFunctionNames, defs);
  var filename = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parsePath(definitionPath).name + 'Proxy.js';
  var m = loadCodeAsModule(code, filename);
  m.exports.inject((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming);

  return m.exports;
}

function loadCodeAsModule(code, filename) {
  var m = new (_module2 || _module()).default();
  m.filename = m.id = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, filename);
  m.paths = []; // Prevent accidental requires by removing lookup paths.
  m._compile(code, filename);

  return m;
}

// Export caches for testing.
var __test__ = {
  definitionsCache: definitionsCache,
  proxiesCache: proxiesCache
};
exports.__test__ = __test__;