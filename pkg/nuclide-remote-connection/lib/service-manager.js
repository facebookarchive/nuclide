'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUseLocalRpc = setUseLocalRpc;
exports.getlocalService = getlocalService;
exports.getServiceByNuclideUri = getServiceByNuclideUri;
exports.getServiceByConnection = getServiceByConnection;
exports.getService = getService;

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('../../commons-node/system-info');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _nuclideMarshalersAtom;

function _load_nuclideMarshalersAtom() {
  return _nuclideMarshalersAtom = require('../../nuclide-marshalers-atom');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let localRpcClient = null; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */

let knownLocalRpc = false;

// Creates a local RPC client that we can use to ensure that
// local service calls have the same behavior as remote RPC calls.
function createLocalRpcClient() {
  const localTransports = new (_nuclideRpc || _load_nuclideRpc()).LoopbackTransports();
  const serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry((_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getServerSideMarshalers, (_servicesConfig || _load_servicesConfig()).default);
  const localClientConnection = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createServer(serviceRegistry, localTransports.serverTransport);

  if (!(localClientConnection != null)) {
    throw new Error('Invariant violation: "localClientConnection != null"');
  } // silence lint...


  return (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createLocal(localTransports.clientTransport, (_nuclideMarshalersAtom || _load_nuclideMarshalersAtom()).getAtomSideLoopbackMarshalers, (_servicesConfig || _load_servicesConfig()).default);
}

function setUseLocalRpc(value) {
  if (!!knownLocalRpc) {
    throw new Error('setUseLocalRpc must be called exactly once');
  }

  knownLocalRpc = true;
  if (value) {
    localRpcClient = createLocalRpcClient();
  }
}

function getlocalService(serviceName) {
  if (!(knownLocalRpc || (0, (_systemInfo || _load_systemInfo()).isRunningInTest)())) {
    throw new Error('Must call setUseLocalRpc before getService');
  }

  if (localRpcClient != null) {
    return localRpcClient.getService(serviceName);
  } else {
    const [serviceConfig] = (_servicesConfig || _load_servicesConfig()).default.filter(config => config.name === serviceName);

    if (!serviceConfig) {
      throw new Error(`No config found for service ${serviceName}`);
    }
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
function getServiceByNuclideUri(serviceName, uri = null) {
  const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(uri);
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
  // flowlint-next-line sketchy-null-string:off
  if (hostname) {
    const serverConnection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getByHostname(hostname);
    if (serverConnection == null) {
      return null;
    }
    return serverConnection.getService(serviceName);
  } else {
    return getlocalService(serviceName);
  }
}