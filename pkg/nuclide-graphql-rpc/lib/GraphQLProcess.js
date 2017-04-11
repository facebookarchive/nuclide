'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGraphQLProcess = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getGraphQLProcess = exports.getGraphQLProcess = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileCache, filePath) {
    const configDir = yield (0, (_config || _load_config()).findGraphQLConfigDir)(filePath);
    if (configDir == null) {
      return null;
    }

    const processCache = processes.get(fileCache);
    return processCache.get(configDir);
  });

  return function getGraphQLProcess(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _config;

function _load_config() {
  return _config = require('./config');
}

var _RpcProcess;

function _load_RpcProcess() {
  return _RpcProcess = require('../../nuclide-rpc/lib/RpcProcess');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _cache;

function _load_cache() {
  return _cache = require('../../commons-node/cache');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// RPC Process interface and service registry/marshalers
const GRAPHQL_FILE_EXTENTIONS = ['.graphql'];

// Nuclide-specific utility functions


// Deals with the file event from Atom process


// GraphQL-related helpers
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let serviceRegistry = null;
function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry((_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getServerSideMarshalers, (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..')), 'graphql-protocol');
  }
  return serviceRegistry;
}

/**
 * GraphQL language service doesn't really depend on a 'process' per se,
 * but having a process-like configuration store that maps fileCache to
 * schema/.graphqlrc config file sounds useful. Also, this process seems
 * useful for setting up operations like 'getBufferAtVersion' to manage
 * Observable streams for Atom file events.
 * Also realized that if GraphQL runtime is built, many functions in this
 * class will be migrated to the runtime.
 */

class GraphQLProcess {

  constructor(fileCache, name, configDir, processStream) {
    this._fileCache = fileCache;
    this._fileVersionNotifier = new (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileVersionNotifier();
    this._configDir = configDir;
    this._process = new (_RpcProcess || _load_RpcProcess()).RpcProcess('GraphQLServer', getServiceRegistry(), processStream);
    this.getService();

    this._fileSubscription = fileCache.observeFileEvents().filter(fileEvent => {
      const fileExtension = (_nuclideUri || _load_nuclideUri()).default.extname(fileEvent.fileVersion.filePath);
      return GRAPHQL_FILE_EXTENTIONS.indexOf(fileExtension) !== -1;
    }).subscribe(fileEvent => {
      this._fileVersionNotifier.onEvent(fileEvent);
    });

    this._process.observeExitCode().subscribe(() => this.dispose());
  }

  getService() {
    if (this._process.isDisposed()) {
      throw new Error('GraphQLServerService disposed already');
    }
    return this._process.getService('GraphQLServerService');
  }

  getDiagnostics(query, filePath) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this.getService()).getDiagnostics(query, filePath);
    })();
  }

  getDefinition(query, position, filePath) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this2.getService()).getDefinition(query, position, filePath);
    })();
  }

  getAutocompleteSuggestions(query, position, filePath) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this3.getService()).getAutocompleteSuggestions(query, position, filePath);
    })();
  }

  getBufferAtVersion(fileVersion) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      if (!(yield _this4._fileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
    })();
  }

  dispose() {
    (_config || _load_config()).logger.logTrace('Cleaning up GraphQL artifacts');
    this._process.getService('GraphQLServerService').then(service => {
      // Atempt to send disconnect message before shutting down connection
      try {
        (_config || _load_config()).logger.logTrace('Attempting to disconnect cleanly from GraphQLProcess');
        service.disconnect();
      } catch (e) {
        // Failing to send the shutdown is not fatal...
        // ... continue with shutdown.
        (_config || _load_config()).logger.logError('GraphQL Process died before disconnect() could be sent.');
      }
    });
    this._process.dispose();
    this._fileVersionNotifier.dispose();
    this._fileSubscription.unsubscribe();
    if (processes.has(this._fileCache)) {
      processes.get(this._fileCache).delete(this._configDir);
    }
  }
}

const processes = new (_cache || _load_cache()).Cache(fileCache => new (_cache || _load_cache()).Cache(graphqlRoot => createGraphQLProcess(fileCache, graphqlRoot), process => {
  process.dispose();
}), (_cache || _load_cache()).DISPOSE_VALUE);

function createGraphQLProcess(fileCache, configDir) {
  const processStream = (0, (_process || _load_process()).forkProcessStream)(require.resolve('../../nuclide-graphql-language-service/bin/graphql.js'), ['server', `-c ${configDir}`], { silent: true });

  return new GraphQLProcess(fileCache, `GraphQLProcess-${configDir}`, configDir, processStream);
}