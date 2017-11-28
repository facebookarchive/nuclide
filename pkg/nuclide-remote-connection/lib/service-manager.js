'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getlocalService = getlocalService;
exports.getServiceByNuclideUri = getServiceByNuclideUri;
exports.awaitServiceByNuclideUri = awaitServiceByNuclideUri;
exports.getServiceByConnection = getServiceByConnection;
exports.getService = getService;
exports.awaitService = awaitService;

var _IpcTransports;

function _load_IpcTransports() {
  return _IpcTransports = require('./IpcTransports');
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = require('../../commons-node/passesGK');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideMarshalersAtom;

function _load_nuclideMarshalersAtom() {
  return _nuclideMarshalersAtom = require('../../nuclide-marshalers-atom');
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

const useLocalRpc = Boolean((_featureConfig || _load_featureConfig()).default.get('useLocalRpc') || (0, (_passesGK || _load_passesGK()).isGkEnabled)('nuclide_local_rpc'));
let localRpcClient = null;

// Creates a local RPC client that connects to a separate process.
function createLocalRpcClient() {
  // We cannot synchronously spawn the process here due to the shell environment.
  // process.js will wait for Atom's shell environment to become ready.
  const localServerProcess = (0, (_process || _load_process()).fork)('--require', [require.resolve('../../commons-node/load-transpiler'), require.resolve('./LocalRpcServer')], {
    killTreeWhenDone: true,
    stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'ipc']
  });
  const transport = new (_IpcTransports || _load_IpcTransports()).IpcClientTransport(localServerProcess);
  return (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createLocal(transport, (_nuclideMarshalersAtom || _load_nuclideMarshalersAtom()).getAtomSideLoopbackMarshalers, (_servicesConfig || _load_servicesConfig()).default);
}

function getlocalService(serviceName) {
  if (useLocalRpc) {
    if (localRpcClient == null) {
      localRpcClient = createLocalRpcClient();
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('use-local-rpc');
    }
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
 * Asynchronously create or get a cached service.
 * @param uri It could either be either a local path or a remote path in form of
 *    `nuclide://$host/$path`. The function will use the $host from remote path to
 *    create a remote service or create a local service if the uri is local path.
 */
function awaitServiceByNuclideUri(serviceName, uri = null) {
  const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(uri);
  return awaitService(serviceName, hostname);
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
  if (hostname != null && hostname !== '') {
    const serverConnection = (_ServerConnection || _load_ServerConnection()).ServerConnection.getByHostname(hostname);
    if (serverConnection == null) {
      return null;
    }
    return serverConnection.getService(serviceName);
  } else {
    return getlocalService(serviceName);
  }
}

/**
 * Asynchronously create or get a cached service. If hostname is null or empty
 * string, it returns a local service, otherwise a remote service will be returned.
 */
function awaitService(serviceName, hostname) {
  if (hostname != null && hostname !== '') {
    return (_ServerConnection || _load_ServerConnection()).ServerConnection.connectionAddedToHost(hostname).first().toPromise().then(serverConnection => serverConnection.getService(serviceName));
  } else {
    return Promise.resolve(getlocalService(serviceName));
  }
}