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

var _fs = _interopRequireDefault(require('fs'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _runtimeInfo;

function _load_runtimeInfo() {
  return _runtimeInfo = require('../../commons-node/runtime-info');
}

var _serverPort;

function _load_serverPort() {
  return _serverPort = require('../../../modules/nuclide-commons/serverPort');
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

// This code may be executed before the config has been loaded!
// getWithDefaults is necessary to make sure that the default is 'true'.
// (But not in tests, as it's slow to start it up every time.)
// We disable this on Windows until fork gets fixed.
const useLocalRpc = Boolean((_featureConfig || _load_featureConfig()).default.getWithDefaults('useLocalRpc', !atom.inSpecMode())) && process.platform !== 'win32'; /**
                                                                                                                                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                    * All rights reserved.
                                                                                                                                                                    *
                                                                                                                                                                    * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                    * the root directory of this source tree.
                                                                                                                                                                    *
                                                                                                                                                                    * 
                                                                                                                                                                    * @format
                                                                                                                                                                    */

let localRpcClient = null;

// Creates a local RPC client that connects to a separate process.
function createLocalRpcClient() {
  // The Electron Node process won't support --inspect until v1.7.x.
  // In the meantime, try to find a more standard Node process.
  const fbNodeRun = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../commons-node/fb-node-run.sh');
  const spawnOptions = {
    killTreeWhenDone: true,
    stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'ipc']
  };
  // We cannot synchronously spawn the process here due to the shell environment.
  // process.js will wait for Atom's shell environment to become ready.
  const localServerProcess = (_runtimeInfo || _load_runtimeInfo()).__DEV__ && _fs.default.existsSync(fbNodeRun) && process.platform !== 'win32' ? _rxjsBundlesRxMinJs.Observable.defer(() => Promise.all([(0, (_serverPort || _load_serverPort()).getAvailableServerPort)(), (0, (_process || _load_process()).getOriginalEnvironment)()])).do(([port]) => {
    // eslint-disable-next-line no-console
    console.log(`Starting local RPC process with --inspect=${port}`);
  }).switchMap(([port, env]) => (0, (_process || _load_process()).spawn)(fbNodeRun, ['node',
  // Electron v1.7.x will also allow --inspect=0.
  `--inspect=${port}`, '--require', require.resolve('../../commons-node/load-transpiler'), require.resolve('./LocalRpcServer')], spawnOptions)) : (0, (_process || _load_process()).fork)('--require', [require.resolve('../../commons-node/load-transpiler'), require.resolve('./LocalRpcServer')], spawnOptions);

  const transport = new (_IpcTransports || _load_IpcTransports()).IpcClientTransport(localServerProcess);
  return (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createLocal(transport, (_nuclideMarshalersAtom || _load_nuclideMarshalersAtom()).getAtomSideLoopbackMarshalers, (_servicesConfig || _load_servicesConfig()).default);
}

function getlocalService(serviceName) {
  if (useLocalRpc) {
    if (localRpcClient == null) {
      localRpcClient = createLocalRpcClient();
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