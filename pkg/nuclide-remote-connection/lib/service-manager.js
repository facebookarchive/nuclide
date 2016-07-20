var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ServerConnection2;

function _ServerConnection() {
  return _ServerConnection2 = require('./ServerConnection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideServerLibServicesConfig2;

function _nuclideServerLibServicesConfig() {
  return _nuclideServerLibServicesConfig2 = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _ServiceLogger2;

function _ServiceLogger() {
  return _ServiceLogger2 = _interopRequireDefault(require('./ServiceLogger'));
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _commonsNodeSystemInfo2;

function _commonsNodeSystemInfo() {
  return _commonsNodeSystemInfo2 = require('../../commons-node/system-info');
}

var logger = require('../../nuclide-logging').getLogger();

var localRpcClient = null;
var knownLocalRpc = false;

// Creates a local RPC client that we can use to ensure that
// local service calls have the same behavior as remote RPC calls.
function createLocalRpcClient() {
  var localTransports = new (_nuclideRpc2 || _nuclideRpc()).LoopbackTransports();
  var serviceRegistry = (_nuclideRpc2 || _nuclideRpc()).ServiceRegistry.createLocal((_nuclideServerLibServicesConfig2 || _nuclideServerLibServicesConfig()).default);
  var localClientConnection = (_nuclideRpc2 || _nuclideRpc()).RpcConnection.createServer(serviceRegistry, localTransports.serverTransport);
  (0, (_assert2 || _assert()).default)(localClientConnection != null); // silence lint...
  return (_nuclideRpc2 || _nuclideRpc()).RpcConnection.createLocal(localTransports.clientTransport, (_nuclideServerLibServicesConfig2 || _nuclideServerLibServicesConfig()).default);
}

function setUseLocalRpc(value) {
  (0, (_assert2 || _assert()).default)(!knownLocalRpc, 'setUseLocalRpc must be called exactly once');
  knownLocalRpc = true;
  if (value) {
    localRpcClient = createLocalRpcClient();
  }
}

function getlocalService(serviceName) {
  (0, (_assert2 || _assert()).default)(knownLocalRpc || (0, (_commonsNodeSystemInfo2 || _commonsNodeSystemInfo()).isRunningInTest)(), 'Must call setUseLocalRpc before getService');
  if (localRpcClient != null) {
    return localRpcClient.getService(serviceName);
  } else {
    var _default$filter = (_nuclideServerLibServicesConfig2 || _nuclideServerLibServicesConfig()).default.filter(function (config) {
      return config.name === serviceName;
    });

    var _default$filter2 = _slicedToArray(_default$filter, 1);

    var serviceConfig = _default$filter2[0];

    (0, (_assert2 || _assert()).default)(serviceConfig, 'No config found for service ' + serviceName);
    // $FlowIgnore
    return require(serviceConfig.implementation);
  }
}

/**
 * Create or get a cached service.
 * @param uri It could either be either a local path or a remote path in form of
 *    `nuclide://$host/$path`. The function will use the $host from remote path to
 *    create a remote service or create a local service if the uri is local path.
 */
function getServiceByNuclideUri(serviceName) {
  var uri = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var hostname = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getHostnameOpt(uri);
  return getService(serviceName, hostname);
}

/**
 * Create or get a cached service. If hostname is null or empty string,
 * it returns a local service, otherwise a remote service will be returned.
 */
function getService(serviceName, hostname) {
  if (hostname) {
    var serverConnection = (_ServerConnection2 || _ServerConnection()).ServerConnection.getByHostname(hostname);
    if (serverConnection == null) {
      return null;
    }
    return serverConnection.getService(serviceName);
  } else {
    return getlocalService(serviceName);
  }
}

var serviceLogger = undefined;
function getServiceLogger() {
  if (!serviceLogger) {
    serviceLogger = new (_ServiceLogger2 || _ServiceLogger()).default();
    serviceLogger.onNewItem(function (item) {
      // TODO(t8579744): Log these to a separate file. Note that whatever file is used should also
      // be included in bug reports.
      logger.debug('Service call:', item.service, item.method, item.isLocal, item.argInfo);
    });
  }
  return serviceLogger;
}

module.exports = {
  getService: getService,
  getServiceByNuclideUri: getServiceByNuclideUri,
  getServiceLogger: getServiceLogger,
  setUseLocalRpc: setUseLocalRpc
};