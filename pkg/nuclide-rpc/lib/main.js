Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.proxyFilename = proxyFilename;
exports.createProxyFactory = createProxyFactory;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('fs'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _module;

function _load_module() {
  return _module = _interopRequireDefault(require('module'));
}

var _proxyGenerator;

function _load_proxyGenerator() {
  return _proxyGenerator = require('./proxy-generator');
}

var _serviceParser;

function _load_serviceParser() {
  return _serviceParser = require('./service-parser');
}

// Proxy dependencies

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

/** Cache for remote proxies. */
var proxiesCache = new Map();

function proxyFilename(definitionPath) {
  (0, (_assert || _load_assert()).default)((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isAbsolute(definitionPath), '"' + definitionPath + '" definition path must be absolute.');
  var dir = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(definitionPath);
  var name = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(definitionPath, (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.extname(definitionPath));
  var filename = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(dir, name + 'Proxy.js');
  return filename;
}

function createProxyFactory(serviceName, preserveFunctionNames, definitionPath, predefinedTypes) {
  if (!proxiesCache.has(definitionPath)) {
    var filename = proxyFilename(definitionPath);

    var code = undefined;
    if ((_fs || _load_fs()).default.existsSync(filename)) {
      code = (_fs || _load_fs()).default.readFileSync(filename, 'utf8');
    } else {
      var definitionSource = (_fs || _load_fs()).default.readFileSync(definitionPath, 'utf8');
      var defs = (0, (_serviceParser || _load_serviceParser()).parseServiceDefinition)(definitionPath, definitionSource, predefinedTypes);
      code = (0, (_proxyGenerator || _load_proxyGenerator()).generateProxy)(serviceName, preserveFunctionNames, defs);
    }

    var m = loadCodeAsModule(code, filename);
    m.exports.inject((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable);

    proxiesCache.set(definitionPath, m.exports);
  }

  var factory = proxiesCache.get(definitionPath);
  (0, (_assert || _load_assert()).default)(factory != null);

  return factory;
}

function loadCodeAsModule(code, filename) {
  (0, (_assert || _load_assert()).default)(code.length > 0, 'Code must not be empty.');
  var m = new (_module || _load_module()).default(filename);
  m.filename = filename;
  m.paths = []; // Disallow require resolving by removing lookup paths.
  m._compile(code, filename);
  m.loaded = true;

  return m;
}

// Export caches for testing.
var __test__ = {
  proxiesCache: proxiesCache
};
exports.__test__ = __test__;