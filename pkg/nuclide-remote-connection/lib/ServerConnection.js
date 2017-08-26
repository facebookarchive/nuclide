'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = exports.ServerConnection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
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

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _SharedObservableCache;

function _load_SharedObservableCache() {
  return _SharedObservableCache = _interopRequireDefault(require('../../commons-node/SharedObservableCache'));
}

var _NuclideSocket;

function _load_NuclideSocket() {
  return _NuclideSocket = require('../../nuclide-server/lib/NuclideSocket');
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ServerConnection represents the client side of a connection to a remote machine.
// There can be at most one connection to a given remote machine at a time. Clients should
// get a ServerConnection via ServerConnection.getOrCreate() and should never call the
// constructor directly. Alternately existing connections can be queried with getByHostname().
//
// getService() returns typed RPC services via the service framework.
//
// A ServerConnection keeps a list of RemoteConnections - one for each open directory on the remote
// machine. Once all RemoteConnections have been closed, then the ServerConnection will close.
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

class ServerConnection {

  static getOrCreate(config) {
    return (0, _asyncToGenerator.default)(function* () {
      const existingConnection = ServerConnection.getByHostname(config.host);
      if (existingConnection != null) {
        return existingConnection;
      }

      const newConnection = new ServerConnection(config);
      try {
        yield newConnection.initialize();
        return newConnection;
      } catch (e) {
        newConnection.close();
        throw e;
      }
    })();
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
  static closeAll(shutdown) {
    return (0, _asyncToGenerator.default)(function* () {
      yield Promise.all(Array.from(ServerConnection._connections).map(function ([_, connection]) {
        return connection._closeServerConnection(shutdown);
      }));
    })();
  }

  // Do NOT call this from outside this class. Use ServerConnection.getOrCreate() instead.
  constructor(config) {
    this._config = config;
    this._closed = false;
    this._healthNotifier = null;
    this._client = null;
    this._connections = [];
    this._fileWatches = new (_SharedObservableCache || _load_SharedObservableCache()).default(path => {
      const fileWatcherService = this.getService('FileWatcherService');
      return fileWatcherService.watchFile(path).refCount();
    });
    this._directoryWatches = new (_SharedObservableCache || _load_SharedObservableCache()).default(path => {
      const fileWatcherService = this.getService('FileWatcherService');
      return fileWatcherService.watchDirectory(path).refCount();
    });
  }

  dispose() {
    if (this._healthNotifier != null) {
      this._healthNotifier.dispose();
    }
  }

  static _createInsecureConnectionForTesting(cwd, port) {
    return (0, _asyncToGenerator.default)(function* () {
      const config = {
        host: 'localhost',
        port,
        cwd
      };
      const connection = new ServerConnection(config);
      yield connection.initialize();
      return connection;
    })();
  }

  _monitorConnectionHeartbeat() {
    if (!(this._healthNotifier == null)) {
      throw new Error('Invariant violation: "this._healthNotifier == null"');
    }

    this._healthNotifier = new (_ConnectionHealthNotifier || _load_ConnectionHealthNotifier()).ConnectionHealthNotifier(this._config.host, this.getSocket());
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

  getPathOfUri(uri) {
    return (_nuclideUri || _load_nuclideUri()).default.parse(uri).path;
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

  getFileWatch(path) {
    return this._fileWatches.get(path);
  }

  getDirectoryWatch(path) {
    return this._directoryWatches.get(path);
  }

  initialize() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._startRpc();
      const client = _this.getClient();
      const clientVersion = (0, (_nuclideVersion || _load_nuclideVersion()).getVersion)();

      function throwVersionMismatch(version) {
        const err = new Error(`Version mismatch. Client at ${clientVersion} while server at ${version}.`);
        err.name = 'VersionMismatchError';
        throw err;
      }

      // Test connection first. First time we get here we're checking to reestablish
      // connection using cached credentials. This will fail fast (faster than infoService)
      // when we don't have cached credentials yet.
      const [heartbeatVersion, ip] = yield Promise.all([client.getTransport().testConnection(), (0, (_lookupPreferIpV || _load_lookupPreferIpV()).default)(_this._config.host)]);
      if (clientVersion !== heartbeatVersion) {
        throwVersionMismatch(heartbeatVersion);
      }

      // Do another version check over the RPC framework.
      const serverVersion = yield _this._getInfoService().getServerVersion();
      if (clientVersion !== serverVersion) {
        throwVersionMismatch(serverVersion);
      }

      _this._monitorConnectionHeartbeat();

      ServerConnection._connections.set(_this.getRemoteHostname(), _this);
      (0, (_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).setConnectionConfig)(_this._config, ip.address);
      ServerConnection._emitter.emit('did-add', _this);
    })();
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
    }

    // Remove from _connections to not be considered in future connection queries.
    if (ServerConnection._connections.delete(this.getRemoteHostname())) {
      ServerConnection._emitter.emit('did-close', this);
    }
  }

  getClient() {
    if (!(!this._closed && this._client != null)) {
      throw new Error('Server connection has been closed.');
    }

    return this._client;
  }

  _startRpc() {
    let uri;
    let options;

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

      options = {
        ca: this._config.certificateAuthorityCertificate,
        cert: this._config.clientCertificate,
        key: this._config.clientKey,
        family: this._config.family
      };
      uri = `https://${this.getRemoteHostname()}:${this.getPort()}`;
    } else {
      options = { family: this._config.family };
      uri = `http://${this.getRemoteHostname()}:${this.getPort()}`;
    }

    const socket = new (_NuclideSocket || _load_NuclideSocket()).NuclideSocket(uri, options);
    const client = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createRemote(socket, (0, (_nuclideMarshalersAtom || _load_nuclideMarshalersAtom()).getAtomSideMarshalers)(this.getRemoteHostname()), (_servicesConfig || _load_servicesConfig()).default,
    // Track calls with a sampling rate of 1/10.
    { trackSampleRate: 10 });

    this._client = client;
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

  removeConnection(connection, shutdownIfLast) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(_this2._connections.indexOf(connection) !== -1)) {
        throw new Error('Attempt to remove a non-existent RemoteConnection');
      }

      _this2._connections.splice(_this2._connections.indexOf(connection), 1);
      if (_this2._connections.length === 0) {
        // The await here is subtle, it ensures that the shutdown call is sent
        // on the socket before the socket is closed on the next line.
        yield _this2._closeServerConnection(shutdownIfLast);
        _this2.close();
      }
    })();
  }

  static onDidAddServerConnection(handler) {
    return ServerConnection._emitter.on('did-add', handler);
  }

  static onDidCloseServerConnection(handler) {
    return ServerConnection._emitter.on('did-close', handler);
  }

  static getForUri(uri) {
    const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
    if (hostname == null) {
      return null;
    }
    return ServerConnection.getByHostname(hostname);
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
      return path.startsWith(connection.getPathForInitialWorkingDirectory());
    })[0];
  }

  getConnections() {
    return this._connections;
  }

  getService(serviceName) {
    return this.getClient().getService(serviceName);
  }

  getSocket() {
    return this.getClient().getTransport();
  }

  _getInfoService() {
    return this.getService('InfoService');
  }

  _closeServerConnection(shutdown) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        // If the Nuclide server has already been shutdown or has crashed,
        // the closeConnection() call will attempt to disconnect from the Nuclide
        // server forever. This sets a 5 second timeout for it so that the rest
        // of this function and anything calling it can complete.
        yield (0, (_promise || _load_promise()).timeoutPromise)(_this3._getInfoService().closeConnection(shutdown), 5000);
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection').error('Failed to close Nuclide server connection.');
      } finally {
        if (shutdown) {
          // Clear the saved connection config so we don't try it again at startup.
          (0, (_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).clearConnectionConfig)(_this3._config.host);
        }
      }
    })();
  }

  static observeRemoteConnections() {
    const emitter = ServerConnection._emitter;
    return _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => emitter.on('did-add', cb)), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => emitter.on('did-close', cb)), _rxjsBundlesRxMinJs.Observable.of(null)).map(() => Array.from(ServerConnection._connections.values()));
  }
}

exports.ServerConnection = ServerConnection;
ServerConnection._connections = new Map();
ServerConnection._emitter = new _atom.Emitter();
const __test__ = exports.__test__ = {
  connections: ServerConnection._connections
};