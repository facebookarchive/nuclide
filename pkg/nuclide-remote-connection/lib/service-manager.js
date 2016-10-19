var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideServerLibServicesConfig;

function _load_nuclideServerLibServicesConfig() {
  return _nuclideServerLibServicesConfig = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _commonsNodeSystemInfo;

function _load_commonsNodeSystemInfo() {
  return _commonsNodeSystemInfo = require('../../commons-node/system-info');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var localRpcClient = null;
var knownLocalRpc = false;

// Creates a local RPC client that we can use to ensure that
// local service calls have the same behavior as remote RPC calls.
function createLocalRpcClient() {
  var localTransports = new (_nuclideRpc || _load_nuclideRpc()).LoopbackTransports();
  var serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry((_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getServerSideMarshalers, (_nuclideServerLibServicesConfig || _load_nuclideServerLibServicesConfig()).default);
  var localClientConnection = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createServer(serviceRegistry, localTransports.serverTransport);
  (0, (_assert || _load_assert()).default)(localClientConnection != null); // silence lint...
  return (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createLocal(localTransports.clientTransport, (_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getAtomSideLoopbackMarshalers, (_nuclideServerLibServicesConfig || _load_nuclideServerLibServicesConfig()).default);
}

function setUseLocalRpc(value) {
  (0, (_assert || _load_assert()).default)(!knownLocalRpc, 'setUseLocalRpc must be called exactly once');
  knownLocalRpc = true;
  if (value) {
    localRpcClient = createLocalRpcClient();
  }
}

function getlocalService(serviceName) {
  (0, (_assert || _load_assert()).default)(knownLocalRpc || (0, (_commonsNodeSystemInfo || _load_commonsNodeSystemInfo()).isRunningInTest)(), 'Must call setUseLocalRpc before getService');
  if (localRpcClient != null) {
    return localRpcClient.getService(serviceName);
  } else {
    var _default$filter = (_nuclideServerLibServicesConfig || _load_nuclideServerLibServicesConfig()).default.filter(function (config) {
      return config.name === serviceName;
    });

    var _default$filter2 = _slicedToArray(_default$filter, 1);

    var serviceConfig = _default$filter2[0];

    (0, (_assert || _load_assert()).default)(serviceConfig, 'No config found for service ' + serviceName);
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

  var hostname = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getHostnameOpt(uri);
  return getService(serviceName, hostname);
}

/**
 * Create or get cached service.
 * null connection implies get local service.
 */
function getServiceByConnection(serviceName, connection) {
  if (connection == null) {
    return getlocalService(serviceName);
  } else {
    return connection.getService(serviceName);
  }
}

/**
 * Create or get a cached service. If hostname is null or empty string,
 * it returns a local service, otherwise a remote service will be returned.
 */
function getService(serviceName, hostname) {
  if (hostname) {
    var serverConnection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getByHostname(hostname);
    if (serverConnection == null) {
      return null;
    }
    return serverConnection.getService(serviceName);
  } else {
    return getlocalService(serviceName);
  }
}

module.exports = {
  getService: getService,
  getServiceByConnection: getServiceByConnection,
  getServiceByNuclideUri: getServiceByNuclideUri,
  setUseLocalRpc: setUseLocalRpc,
  getlocalService: getlocalService
};