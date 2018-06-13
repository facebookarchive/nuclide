'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = exports.ServerConnection = exports.BIG_DIG_VERSION = undefined;

var _config;

function _load_config() {
  return _config = require('../../nuclide-rpc/lib/config');
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _RemoteConnectionConfigurationManager;

function _load_RemoteConnectionConfigurationManager() {
  return _RemoteConnectionConfigurationManager = require('./RemoteConnectionConfigurationManager');
}

var _ConnectionHealthNotifier;

function _load_ConnectionHealthNotifier() {
  return _ConnectionHealthNotifier = require('./ConnectionHealthNotifier');
}

var _RemoteFile;

function _load_RemoteFile() {
  return _RemoteFile = require('./RemoteFile');
}

var _RemoteDirectory;

function _load_RemoteDirectory() {
  return _RemoteDirectory = require('./RemoteDirectory');
}

var _nuclideMarshalersAtom;

function _load_nuclideMarshalersAtom() {
  return _nuclideMarshalersAtom = require('../../nuclide-marshalers-atom');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _SharedObservableCache;

function _load_SharedObservableCache() {
  return _SharedObservableCache = _interopRequireDefault(require('../../commons-node/SharedObservableCache'));
}

var _ReliableSocket;

function _load_ReliableSocket() {
  return _ReliableSocket = require('../../../modules/big-dig/src/socket/ReliableSocket');
}

var _NuclideServer;

function _load_NuclideServer() {
  return _NuclideServer = require('../../nuclide-server/lib/NuclideServer');
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-server/lib/utils');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideVersion;

function _load_nuclideVersion() {
  return _nuclideVersion = require('../../nuclide-version');
}

var _lookupPreferIpV;

function _load_lookupPreferIpV() {
  return _lookupPreferIpV = _interopRequireDefault(require('./lookup-prefer-ip-v6'));
}

var _createBigDigRpcClient;

function _load_createBigDigRpcClient() {
  return _createBigDigRpcClient = _interopRequireDefault(require('./createBigDigRpcClient'));
}

var _electron = _interopRequireDefault(require('electron'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection'); /**
                                                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                                                         * All rights reserved.
                                                                                         *
                                                                                         * This source code is licensed under the license found in the LICENSE file in
                                                                                         * the root directory of this source tree.
                                                                                         *
                                                                                         * 
                                                                                         * @format
                                                                                         */

const remote = _electron.default.remote;
const ipc = _electron.default.ipcRenderer;

if (!remote) {
  throw new Error('Invariant violation: "remote"');
}

if (!ipc) {
  throw new Error('Invariant violation: "ipc"');
}

const BIG_DIG_VERSION = exports.BIG_DIG_VERSION = 2;

// ServerConnection represents the client side of a connection to a remote machine.
// There can be at most one connection to a given remote machine at a time. Clients should
// get a ServerConnection via ServerConnection.getOrCreate() and should never call the
// constructor directly. Alternately existing connections can be queried with getByHostname().
//
// getService() returns typed RPC services via the service framework.
//
// A ServerConnection keeps a list of RemoteConnections - one for each open directory on the remote
// machine. Once all RemoteConnections have been closed, then the ServerConnection will close.
class ServerConnection {

  static async getOrCreate(config) {
    const existingConnection = ServerConnection.getByHostname(config.host);
    if (existingConnection != null) {
      return existingConnection;
    }

    const newConnection = new ServerConnection(config);
    try {
      await newConnection.initialize();
      return newConnection;
    } catch (e) {
      newConnection.close();
      throw e;
    }
  }

  static cancelConnection(hostname) {
    ServerConnection._emitter.emit('did-cancel', hostname);
  }

  // WARNING: This shuts down all Nuclide servers _without_ closing their
  // RemoteConnections first! This is extremely unsafe and
  // should only be used to forcibly kill Nuclide servers before restarting.
  static forceShutdownAllServers() {
    return ServerConnection.closeAll(true);
  }

  // WARNING: This shuts down all Nuclide servers _without_ closing their
  // RemoteConnections first! This is extremely unsafe and
  // should only be Called during shutdown, reload, or before autoupdate.
  static async closeAll(shutdown) {
    await Promise.all(Array.from(ServerConnection._connections).map(([_, connection]) => {
      return connection._closeServerConnection(shutdown);
    }));
  }

  // Do NOT call this from outside this class. Use ServerConnection.getOrCreate() instead.
  constructor(config) {
    this._config = config;
    this._closed = false;
    this._healthNotifier = null;
    this._client = null;
    this._bigDigClient = null;
    this._heartbeat = null;
    this._connections = [];
    this._fileWatches = new (_SharedObservableCache || _load_SharedObservableCache()).default(path => {
      const fileWatcherService = this.getService('FileWatcherService');
      return fileWatcherService.watchFile(path).refCount();
    });
    this._directoryWatches = new (_SharedObservableCache || _load_SharedObservableCache()).default(path => {
      const fileWatcherService = this.getService('FileWatcherService');
      return fileWatcherService.watchDirectory(path).refCount();
    });

    ipc.on((_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).SERVER_CONFIG_REQUEST_EVENT, (event, host, id) => {
      logger.info(`received request for server config for ${host} from window ${id}`);
      let response = null;
      if (host === this._config.host) {
        logger.info(`found the server config for ${host}, sending it via ipc`);
        response = this._config;
      }

      const window = remote.BrowserWindow.getAllWindows().filter(win => win.id === id)[0];

      if (!window) {
        throw new Error('Invariant violation: "window"');
      }

      window.send((_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).SERVER_CONFIG_RESPONSE_EVENT, response);
    });
  }

  static async _createInsecureConnectionForTesting(cwd, port) {
    const config = {
      host: 'localhost',
      port,
      cwd
    };
    const connection = new ServerConnection(config);
    await connection.initialize();
    return connection;
  }

  _monitorConnectionHeartbeat() {
    if (!(this._healthNotifier == null)) {
      throw new Error('Invariant violation: "this._healthNotifier == null"');
    }

    this._healthNotifier = new (_ConnectionHealthNotifier || _load_ConnectionHealthNotifier()).ConnectionHealthNotifier(this._config.host, this._config.port, this.getHeartbeat());
  }

  setOnHeartbeatError(onHeartbeatError) {
    if (!(this._healthNotifier != null)) {
      throw new Error('Invariant violation: "this._healthNotifier != null"');
    }

    this._healthNotifier.setOnHeartbeatError(onHeartbeatError);
  }

  getUriOfRemotePath(remotePath) {
    return `nuclide://${this.getRemoteHostname()}${remotePath}`;
  }

  createDirectory(uri, hgRepositoryDescription, symlink = false) {
    let { path } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
    path = (_nuclideUri || _load_nuclideUri()).default.normalize(path);
    return new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory(this, this.getUriOfRemotePath(path), symlink, {
      hgRepositoryDescription
    });
  }

  createFile(uri, symlink = false) {
    let { path } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
    path = (_nuclideUri || _load_nuclideUri()).default.normalize(path);
    return new (_RemoteFile || _load_RemoteFile()).RemoteFile(this, this.getUriOfRemotePath(path), symlink);
  }

  createFileAsDirectory(uri, hgRepositoryDescription, symlink = false) {
    let { path } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
    path = (_nuclideUri || _load_nuclideUri()).default.normalize(path);
    return new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory(this, this.getUriOfRemotePath(path), symlink, Object.assign({}, hgRepositoryDescription, { isArchive: true }));
  }

  getFileWatch(path) {
    return this._fileWatches.get(path);
  }

  getDirectoryWatch(path) {
    return this._directoryWatches.get(path);
  }

  async initialize() {
    await this._startRpc();
    const clientVersion = (0, (_nuclideVersion || _load_nuclideVersion()).getVersion)();

    function throwVersionMismatch(version) {
      const err = new Error(`Version mismatch. Client at ${clientVersion} while server at ${version}.`);
      err.name = 'VersionMismatchError';
      throw err;
    }

    // NOTE: BigDig's version may not actually match Nuclide's
    if (this._config.version !== 2) {
      // Test connection first. First time we get here we're checking to reestablish
      // connection using cached credentials. This will fail fast (faster than infoService)
      // when we don't have cached credentials yet.
      const heartbeatVersion = await this.getHeartbeat().sendHeartBeat();
      if (clientVersion !== heartbeatVersion) {
        throwVersionMismatch(heartbeatVersion);
      }
    }

    // Do another version check over the RPC framework.
    const [serverVersion, ip] = await Promise.all([this._getInfoService().getServerVersion(), (0, (_lookupPreferIpV || _load_lookupPreferIpV()).default)(this._config.host)]);
    if (clientVersion !== serverVersion) {
      throwVersionMismatch(serverVersion);
    }

    this._monitorConnectionHeartbeat();

    ServerConnection._connections.set(this.getRemoteHostname(), this);
    await (0, (_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).setConnectionConfig)(this._config, ip.address);
    ServerConnection._emitter.emit('did-add', this);
  }

  close() {
    if (this._closed) {
      return;
    }

    // Future getClient calls should fail, if it has a cached ServerConnection instance.
    this._closed = true;

    // The Rpc channel owns the socket.
    if (this._client != null) {
      this._client.dispose();
      this._client = null;
      if (this._heartbeat) {
        this._heartbeat.close();
        this._heartbeat = null;
      }
    }

    // Remove from _connections to not be considered in future connection queries.
    if (ServerConnection._connections.delete(this.getRemoteHostname())) {
      ServerConnection._emitter.emit('did-close', this);
    }

    if (this._healthNotifier != null) {
      this._healthNotifier.dispose();
    }

    ipc.removeAllListeners((_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).SERVER_CONFIG_REQUEST_EVENT);
  }

  getClient() {
    if (!(!this._closed && this._client != null)) {
      throw new Error('Server connection has been closed.');
    }

    return this._client;
  }

  getBigDigClient() {
    if (!(!this._closed && this._bigDigClient != null)) {
      throw new Error('Server connection has been closed');
    }

    return this._bigDigClient;
  }

  getHeartbeat() {
    if (!(!this._closed && this._client != null && this._heartbeat != null)) {
      throw new Error('Server connection has been closed.');
    }

    return this._heartbeat;
  }

  async _startRpc() {
    if (this._config.version === BIG_DIG_VERSION) {
      const { bigDigClient, rpcConnection } = await (0, (_createBigDigRpcClient || _load_createBigDigRpcClient()).default)(this._config);
      this._client = rpcConnection;
      this._bigDigClient = bigDigClient;
      this._heartbeat = bigDigClient.getHeartbeat();
      return;
    }

    let uri;
    let options = {};

    // Use https if we have key, cert, and ca
    if (this._isSecure()) {
      if (!(this._config.certificateAuthorityCertificate != null)) {
        throw new Error('Invariant violation: "this._config.certificateAuthorityCertificate != null"');
      }

      if (!(this._config.clientCertificate != null)) {
        throw new Error('Invariant violation: "this._config.clientCertificate != null"');
      }

      if (!(this._config.clientKey != null)) {
        throw new Error('Invariant violation: "this._config.clientKey != null"');
      }

      options = Object.assign({}, options, {
        ca: this._config.certificateAuthorityCertificate,
        cert: this._config.clientCertificate,
        key: this._config.clientKey,
        family: this._config.family
      });
      uri = `https://${this.getRemoteHostname()}:${this.getPort()}`;
    } else {
      options = Object.assign({}, options, { family: this._config.family });
      uri = `http://${this.getRemoteHostname()}:${this.getPort()}`;
    }

    const socket = new (_ReliableSocket || _load_ReliableSocket()).ReliableSocket(uri, (_NuclideServer || _load_NuclideServer()).HEARTBEAT_CHANNEL, options, (_utils || _load_utils()).protocolLogger);
    const client = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createRemote(socket, (0, (_nuclideMarshalersAtom || _load_nuclideMarshalersAtom()).getAtomSideMarshalers)(this.getRemoteHostname()), (_servicesConfig || _load_servicesConfig()).default,
    // Track calls with a sampling rate of 1/10.
    { trackSampleRate: 10 }, (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL, socket.id, (_utils || _load_utils()).protocolLogger);

    this._client = client;
    this._heartbeat = socket.getHeartbeat();
  }

  _isSecure() {
    return Boolean(this._config.certificateAuthorityCertificate && this._config.clientCertificate && this._config.clientKey);
  }

  getPort() {
    return this._config.port;
  }

  getRemoteHostname() {
    return this._config.host;
  }

  getConfig() {
    return this._config;
  }

  addConnection(connection) {
    this._connections.push(connection);
  }

  async removeConnection(connection, shutdownIfLast) {
    if (!(this._connections.indexOf(connection) !== -1)) {
      throw new Error('Attempt to remove a non-existent RemoteConnection');
    }

    this._connections.splice(this._connections.indexOf(connection), 1);
    logger.info('Removed connection.', {
      cwd: connection.getUri(),
      title: connection.getDisplayTitle(),
      remainingConnections: this._connections.length
    });
    if (this._connections.length === 0) {
      // The await here is subtle, it ensures that the shutdown call is sent
      // on the socket before the socket is closed on the next line.
      await this._closeServerConnection(shutdownIfLast);
      this.close();
    }
  }

  static onDidAddServerConnection(handler) {
    return ServerConnection._emitter.on('did-add', handler);
  }

  // exposes an Observable of all the ServerConnection additions,
  // including those that have already connected
  static connectionAdded() {
    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.from(ServerConnection._connections.values()), (0, (_event || _load_event()).observableFromSubscribeFunction)(ServerConnection.onDidAddServerConnection));
  }

  static onDidCancelServerConnection(handler) {
    return ServerConnection._emitter.on('did-cancel', handler);
  }

  static connectionAddedToHost(hostname) {
    const addEvents = ServerConnection.connectionAdded().filter(sc => sc.getRemoteHostname() === hostname);
    const cancelEvents = (0, (_event || _load_event()).observableFromSubscribeFunction)(ServerConnection.onDidCancelServerConnection).filter(canceledHostname => canceledHostname === hostname);
    return _rxjsBundlesRxMinJs.Observable.merge(addEvents, cancelEvents.map(x => {
      throw new Error('Cancelled server connection to ' + hostname);
    }));
  }

  static onDidCloseServerConnection(handler) {
    return ServerConnection._emitter.on('did-close', handler);
  }

  static getForUri(uri) {
    if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {
      return null;
    }
    return ServerConnection.getByHostname((_nuclideUri || _load_nuclideUri()).default.getHostname(uri));
  }

  static getByHostname(hostname) {
    return ServerConnection._connections.get(hostname);
  }

  static observeConnections(handler) {
    ServerConnection._connections.forEach(handler);
    return ServerConnection.onDidAddServerConnection(handler);
  }

  static toDebugString(connection) {
    return connection == null ? 'local' : connection.getRemoteHostname();
  }

  getRemoteConnectionForUri(uri) {
    const { path } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
    return this.getConnections().filter(connection => {
      return path.startsWith(connection.getPath());
    })[0];
  }

  getConnections() {
    return this._connections;
  }

  hasSingleMountPoint() {
    return this.getConnections().length === 1;
  }

  getService(serviceName) {
    return this.getClient().getService(serviceName);
  }

  _getInfoService() {
    return this.getService('InfoService');
  }

  async _closeServerConnection(shutdown) {
    try {
      // If the Nuclide server has already been shutdown or has crashed,
      // the closeConnection() call will attempt to disconnect from the Nuclide
      // server forever. This sets a 5 second timeout for it so that the rest
      // of this function and anything calling it can complete.
      await (0, (_promise || _load_promise()).timeoutPromise)(this._getInfoService().closeConnection(shutdown), 5000);
    } catch (e) {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection').error('Failed to close Nuclide server connection.');
    } finally {
      if (shutdown) {
        // Clear the saved connection config so we don't try it again at startup.
        (0, (_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).clearConnectionConfig)(this._config.host);
      }
    }
  }

  static observeRemoteConnections() {
    const emitter = ServerConnection._emitter;
    return _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => emitter.on('did-add', cb)), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => emitter.on('did-close', cb)), _rxjsBundlesRxMinJs.Observable.of(null) // so subscribers get a full list immediately
    ).map(() => Array.from(ServerConnection._connections.values()));
  }

  static getAllConnections() {
    return Array.from(ServerConnection._connections.values());
  }
}

exports.ServerConnection = ServerConnection;
ServerConnection._connections = new Map();
ServerConnection._emitter = new (_eventKit || _load_eventKit()).Emitter();
const __test__ = exports.__test__ = {
  connections: ServerConnection._connections
};