"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = exports.ServerConnection = exports.BIG_DIG_VERSION = void 0;

function _config() {
  const data = require("../../nuclide-rpc/lib/config");

  _config = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _servicesConfig() {
  const data = _interopRequireDefault(require("../../nuclide-server/lib/servicesConfig"));

  _servicesConfig = function () {
    return data;
  };

  return data;
}

function _RemoteConnectionConfigurationManager() {
  const data = require("./RemoteConnectionConfigurationManager");

  _RemoteConnectionConfigurationManager = function () {
    return data;
  };

  return data;
}

function _ConnectionHealthNotifier() {
  const data = require("./ConnectionHealthNotifier");

  _ConnectionHealthNotifier = function () {
    return data;
  };

  return data;
}

function _RemoteFile() {
  const data = require("./RemoteFile");

  _RemoteFile = function () {
    return data;
  };

  return data;
}

function _RemoteDirectory() {
  const data = require("./RemoteDirectory");

  _RemoteDirectory = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersAtom() {
  const data = require("../../nuclide-marshalers-atom");

  _nuclideMarshalersAtom = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _eventKit() {
  const data = require("event-kit");

  _eventKit = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _SharedObservableCache() {
  const data = _interopRequireDefault(require("../../commons-node/SharedObservableCache"));

  _SharedObservableCache = function () {
    return data;
  };

  return data;
}

function _ReliableSocket() {
  const data = require("../../../modules/big-dig/src/socket/ReliableSocket");

  _ReliableSocket = function () {
    return data;
  };

  return data;
}

function _NuclideServer() {
  const data = require("../../nuclide-server/lib/NuclideServer");

  _NuclideServer = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../../nuclide-server/lib/utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideVersion() {
  const data = require("../../nuclide-version");

  _nuclideVersion = function () {
    return data;
  };

  return data;
}

function _lookupPreferIpV() {
  const data = _interopRequireDefault(require("./lookup-prefer-ip-v6"));

  _lookupPreferIpV = function () {
    return data;
  };

  return data;
}

function _createBigDigRpcClient() {
  const data = _interopRequireDefault(require("./createBigDigRpcClient"));

  _createBigDigRpcClient = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = _interopRequireWildcard(require("../../commons-node/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _createRfsClientAdapter() {
  const data = require("./thrift-service-adapters/createRfsClientAdapter");

  _createRfsClientAdapter = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("./thrift-service-adapters/util");

  _util = function () {
    return data;
  };

  return data;
}

var _electron = _interopRequireDefault(require("electron"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const logger = (0, _log4js().getLogger)('nuclide-remote-connection');
const remote = _electron.default.remote;
const ipc = _electron.default.ipcRenderer;
const THRIFT_RFS_GK = 'nuclide_thrift_rfs';
const FILE_SYSTEM_PERFORMANCE_SAMPLE_RATE = 10;

if (!remote) {
  throw new Error("Invariant violation: \"remote\"");
}

if (!ipc) {
  throw new Error("Invariant violation: \"ipc\"");
}

const BIG_DIG_VERSION = 2;
exports.BIG_DIG_VERSION = BIG_DIG_VERSION;

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
      await (0, _passesGK().default)(THRIFT_RFS_GK);
      await newConnection.initialize();
      return newConnection;
    } catch (e) {
      newConnection.close();
      throw e;
    }
  }

  static cancelConnection(hostname) {
    ServerConnection._emitter.emit('did-cancel', hostname);
  } // WARNING: This shuts down all Nuclide servers _without_ closing their
  // RemoteConnections first! This is extremely unsafe and
  // should only be used to forcibly kill Nuclide servers before restarting.


  static forceShutdownAllServers() {
    return ServerConnection.closeAll(true);
  } // WARNING: This shuts down all Nuclide servers _without_ closing their
  // RemoteConnections first! This is extremely unsafe and
  // should only be Called during shutdown, reload, or before autoupdate.


  static async closeAll(shutdown) {
    await Promise.all(Array.from(ServerConnection._connections).map(([_, connection]) => {
      return connection._closeServerConnection(shutdown);
    }));
  } // Do NOT call this from outside this class. Use ServerConnection.getOrCreate() instead.


  constructor(config) {
    this._config = config;
    this._closed = false;
    this._healthNotifier = null;
    this._client = null;
    this._bigDigClient = null;
    this._heartbeat = null;
    this._connections = [];
    this._fileWatches = new (_SharedObservableCache().default)(path => {
      const fileWatcherService = this.getService('FileWatcherService');
      return fileWatcherService.watchFile(path).refCount();
    });
    this._directoryWatches = new (_SharedObservableCache().default)(path => {
      const fileWatcherService = this.getService('FileWatcherService');
      return fileWatcherService.watchDirectory(path).refCount();
    });
    ipc.on(_RemoteConnectionConfigurationManager().SERVER_CONFIG_REQUEST_EVENT, (event, host, id) => {
      logger.info(`received request for server config for ${host} from window ${id}`);
      let response = null;

      if (host === this._config.host) {
        logger.info(`found the server config for ${host}, sending it via ipc`);
        response = this._config;
      }

      const window = remote.BrowserWindow.getAllWindows().filter(win => win.id === id)[0];

      if (!window) {
        throw new Error("Invariant violation: \"window\"");
      }

      window.send(_RemoteConnectionConfigurationManager().SERVER_CONFIG_RESPONSE_EVENT, response);
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
      throw new Error("Invariant violation: \"this._healthNotifier == null\"");
    }

    this._healthNotifier = new (_ConnectionHealthNotifier().ConnectionHealthNotifier)(this._config.host, this._config.port, this.getHeartbeat());
  }

  setOnHeartbeatError(onHeartbeatError) {
    if (!(this._healthNotifier != null)) {
      throw new Error("Invariant violation: \"this._healthNotifier != null\"");
    }

    this._healthNotifier.setOnHeartbeatError(onHeartbeatError);
  }

  getUriOfRemotePath(remotePath) {
    return `nuclide://${this.getRemoteHostname()}${remotePath}`;
  }

  createDirectory(uri, hgRepositoryDescription, symlink = false) {
    let {
      path
    } = _nuclideUri().default.parse(uri);

    path = _nuclideUri().default.normalize(path);
    return new (_RemoteDirectory().RemoteDirectory)(this, this.getUriOfRemotePath(path), symlink, {
      hgRepositoryDescription
    });
  }

  createFile(uri, symlink = false) {
    let {
      path
    } = _nuclideUri().default.parse(uri);

    path = _nuclideUri().default.normalize(path);
    return new (_RemoteFile().RemoteFile)(this, this.getUriOfRemotePath(path), symlink);
  }

  createFileAsDirectory(uri, hgRepositoryDescription, symlink = false) {
    let {
      path
    } = _nuclideUri().default.parse(uri);

    path = _nuclideUri().default.normalize(path);
    return new (_RemoteDirectory().RemoteDirectory)(this, this.getUriOfRemotePath(path), symlink, Object.assign({}, hgRepositoryDescription, {
      isArchive: true
    }));
  }

  getFileWatch(path) {
    return this._fileWatches.get(path);
  }

  getDirectoryWatch(path) {
    return this._directoryWatches.get(path);
  }

  async initialize() {
    await this._startRpc();
    const clientVersion = (0, _nuclideVersion().getVersion)();

    function throwVersionMismatch(version) {
      const err = new Error(`Version mismatch. Client at ${clientVersion} while server at ${version}.`);
      err.name = 'VersionMismatchError';
      throw err;
    } // NOTE: BigDig's version may not actually match Nuclide's


    if (this._config.version !== 2) {
      // Test connection first. First time we get here we're checking to reestablish
      // connection using cached credentials. This will fail fast (faster than infoService)
      // when we don't have cached credentials yet.
      const heartbeatVersion = await this.getHeartbeat().sendHeartBeat();

      if (clientVersion !== heartbeatVersion) {
        throwVersionMismatch(heartbeatVersion);
      }
    } // Do another version check over the RPC framework.


    const [serverVersion, ip] = await Promise.all([this._getInfoService().getServerVersion(), (0, _lookupPreferIpV().default)(this._config.host)]);

    if (clientVersion !== serverVersion) {
      throwVersionMismatch(serverVersion);
    }

    this._monitorConnectionHeartbeat();

    ServerConnection._connections.set(this.getRemoteHostname(), this);

    await (0, _RemoteConnectionConfigurationManager().setConnectionConfig)(this._config, ip.address);

    ServerConnection._emitter.emit('did-add', this);
  }

  close() {
    if (this._closed) {
      return;
    } // Future getClient calls should fail, if it has a cached ServerConnection instance.


    this._closed = true; // The Rpc channel owns the socket.

    if (this._client != null) {
      this._client.dispose();

      this._client = null;

      if (this._heartbeat) {
        this._heartbeat.close();

        this._heartbeat = null;
      }
    } // Remove from _connections to not be considered in future connection queries.


    if (ServerConnection._connections.delete(this.getRemoteHostname())) {
      ServerConnection._emitter.emit('did-close', this);
    }

    if (this._healthNotifier != null) {
      this._healthNotifier.dispose();
    }

    ipc.removeAllListeners(_RemoteConnectionConfigurationManager().SERVER_CONFIG_REQUEST_EVENT);
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
      const {
        bigDigClient,
        rpcConnection
      } = await (0, _createBigDigRpcClient().default)(this._config);
      this._client = rpcConnection;
      this._bigDigClient = bigDigClient;
      this._heartbeat = bigDigClient.getHeartbeat();
      return;
    }

    let uri;
    let options = {}; // Use https if we have key, cert, and ca

    if (this._isSecure()) {
      if (!(this._config.certificateAuthorityCertificate != null)) {
        throw new Error("Invariant violation: \"this._config.certificateAuthorityCertificate != null\"");
      }

      if (!(this._config.clientCertificate != null)) {
        throw new Error("Invariant violation: \"this._config.clientCertificate != null\"");
      }

      if (!(this._config.clientKey != null)) {
        throw new Error("Invariant violation: \"this._config.clientKey != null\"");
      }

      options = Object.assign({}, options, {
        ca: this._config.certificateAuthorityCertificate,
        cert: this._config.clientCertificate,
        key: this._config.clientKey,
        family: this._config.family
      });
      uri = `https://${this.getRemoteHostname()}:${this.getPort()}`;
    } else {
      options = Object.assign({}, options, {
        family: this._config.family
      });
      uri = `http://${this.getRemoteHostname()}:${this.getPort()}`;
    }

    const socket = new (_ReliableSocket().ReliableSocket)(uri, _NuclideServer().HEARTBEAT_CHANNEL, options, _utils().protocolLogger);

    const client = _nuclideRpc().RpcConnection.createRemote(socket, (0, _nuclideMarshalersAtom().getAtomSideMarshalers)(this.getRemoteHostname()), _servicesConfig().default, // Track calls with a sampling rate of 1/10.
    {
      trackSampleRate: 10
    }, _config().SERVICE_FRAMEWORK3_PROTOCOL, socket.id, _utils().protocolLogger);

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
  } // exposes an Observable of all the ServerConnection additions,
  // including those that have already connected


  static connectionAdded() {
    return _RxMin.Observable.concat(_RxMin.Observable.from(ServerConnection._connections.values()), (0, _event().observableFromSubscribeFunction)(ServerConnection.onDidAddServerConnection));
  }

  static onDidCancelServerConnection(handler) {
    return ServerConnection._emitter.on('did-cancel', handler);
  }

  static connectionAddedToHost(hostname) {
    const addEvents = ServerConnection.connectionAdded().filter(sc => sc.getRemoteHostname() === hostname);
    const cancelEvents = (0, _event().observableFromSubscribeFunction)(ServerConnection.onDidCancelServerConnection).filter(canceledHostname => canceledHostname === hostname);
    return _RxMin.Observable.merge(addEvents, cancelEvents.map(x => {
      throw new Error('Cancelled server connection to ' + hostname);
    }));
  }

  static onDidCloseServerConnection(handler) {
    return ServerConnection._emitter.on('did-close', handler);
  }

  static getForUri(uri) {
    if (!_nuclideUri().default.isRemote(uri)) {
      return null;
    }

    return ServerConnection.getByHostname(_nuclideUri().default.getHostname(uri));
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
    const {
      path
    } = _nuclideUri().default.parse(uri);

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
    if (serviceName === 'FileSystemService') {
      if ((0, _passesGK().isGkEnabled)(THRIFT_RFS_GK)) {
        return this._getFileSystemProxy(serviceName);
      }

      return this._genRpcRfsProxy(serviceName);
    }

    return this.getClient().getService(serviceName);
  }

  _genRpcRfsProxy(serviceName) {
    const rpcService = this.getClient().getService(serviceName);
    const handler = {
      get: (target, propKey, receiver) => {
        if (_createRfsClientAdapter().SUPPORTED_THRIFT_RFS_FUNCTIONS.has(propKey)) {
          return (...args) => {
            return (0, _nuclideAnalytics().trackTimingSampled)(`file-system-service:${propKey}`, // eslint-disable-next-line prefer-spread
            () => target[propKey].apply(target, args), FILE_SYSTEM_PERFORMANCE_SAMPLE_RATE, {
              serviceProvider: 'rpc'
            });
          };
        }

        return target[propKey];
      }
    };
    return new Proxy(rpcService, handler);
  }

  _getFileSystemProxy(serviceName) {
    const rpcService = this.getClient().getService(serviceName);
    const handler = {
      get: (target, propKey, receiver) => {
        if (_createRfsClientAdapter().SUPPORTED_THRIFT_RFS_FUNCTIONS.has(propKey)) {
          return (...args) => {
            return this._makeThriftRfsCall(rpcService, propKey, args);
          };
        }

        return target[propKey];
      }
    };
    return new Proxy(rpcService, handler);
  }

  async _makeThriftRfsCall(rpcService, fname, args) {
    try {
      return await (0, _nuclideAnalytics().trackTimingSampled)(`file-system-service:${fname}`, async () => {
        const serviceAdapter = await (0, _createRfsClientAdapter().getOrCreateRfsClientAdapter)(this.getBigDigClient()); // $FlowFixMe: suppress 'indexer property is missing warning'

        const method = serviceAdapter[fname];
        return method.apply(serviceAdapter, args);
      }, FILE_SYSTEM_PERFORMANCE_SAMPLE_RATE, {
        serviceProvider: 'thrift'
      });
    } catch (err) {
      if (err instanceof _util().FallbackToRpcError) {
        logger.error(`Thrift RFS method ${fname} exception, use RPC fallback`, err);
        const func = rpcService[fname];
        return func.apply(rpcService, args);
      } // Otherwise throw legit file system errors


      throw err;
    }
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
      await (0, _promise().timeoutPromise)(this._getInfoService().closeConnection(shutdown), 5000);
    } catch (e) {
      (0, _log4js().getLogger)('nuclide-remote-connection').error('Failed to close Nuclide server connection.');
    } finally {
      if (shutdown) {
        // Clear the saved connection config so we don't try it again at startup.
        (0, _RemoteConnectionConfigurationManager().clearConnectionConfig)(this._config.host);
      }
    }
  }

  static observeRemoteConnections() {
    const emitter = ServerConnection._emitter;
    return _RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(cb => emitter.on('did-add', cb)), (0, _event().observableFromSubscribeFunction)(cb => emitter.on('did-close', cb)), _RxMin.Observable.of(null) // so subscribers get a full list immediately
    ).map(() => Array.from(ServerConnection._connections.values()));
  }

  static getAllConnections() {
    return Array.from(ServerConnection._connections.values());
  }

}

exports.ServerConnection = ServerConnection;
ServerConnection._connections = new Map();
ServerConnection._emitter = new (_eventKit().Emitter)();
const __test__ = {
  connections: ServerConnection._connections
};
exports.__test__ = __test__;