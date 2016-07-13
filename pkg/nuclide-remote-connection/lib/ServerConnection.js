Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _nuclideServerLibServicesConfig2;

function _nuclideServerLibServicesConfig() {
  return _nuclideServerLibServicesConfig2 = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _RemoteConnectionConfigurationManager2;

function _RemoteConnectionConfigurationManager() {
  return _RemoteConnectionConfigurationManager2 = require('./RemoteConnectionConfigurationManager');
}

var _ConnectionHealthNotifier2;

function _ConnectionHealthNotifier() {
  return _ConnectionHealthNotifier2 = require('./ConnectionHealthNotifier');
}

var _RemoteFile2;

function _RemoteFile() {
  return _RemoteFile2 = require('./RemoteFile');
}

var _RemoteDirectory2;

function _RemoteDirectory() {
  return _RemoteDirectory2 = require('./RemoteDirectory');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _nuclideServerLibNuclideSocket2;

function _nuclideServerLibNuclideSocket() {
  return _nuclideServerLibNuclideSocket2 = require('../../nuclide-server/lib/NuclideSocket');
}

var _nuclideVersion2;

function _nuclideVersion() {
  return _nuclideVersion2 = require('../../nuclide-version');
}

// key for https connection.

var _emitter = new (_events2 || _events()).EventEmitter();

// ServerConnection represents the client side of a connection to a remote machine.
// There can be at most one connection to a given remote machine at a time. Clients should
// get a ServerConnection via ServerConnection.getOrCreate() and should never call the
// constructor directly. Alternately existing connections can be queried with getByHostname().
//
// getService() returns typed RPC services via the service framework.
//
// A ServerConnection keeps a list of RemoteConnections - one for each open directory on the remote
// machine. Once all RemoteConnections have been closed, then the ServerConnection will close.

var ServerConnection = (function () {
  _createClass(ServerConnection, null, [{
    key: 'getOrCreate',
    value: _asyncToGenerator(function* (config) {
      var existingConnection = ServerConnection.getByHostname(config.host);
      if (existingConnection != null) {
        return existingConnection;
      }

      var newConnection = new ServerConnection(config);
      try {
        yield newConnection.initialize();
        return newConnection;
      } catch (e) {
        newConnection.close();
        throw e;
      }
    })

    // WARNING: This shuts down all Nuclide servers _without_ closing their
    // RemoteConnections first! This is extremely unsafe and
    // should only be used to forcibly kill Nuclide servers before restarting.
  }, {
    key: 'forceShutdownAllServers',
    value: _asyncToGenerator(function* () {
      yield Promise.all(Array.from(ServerConnection._connections).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var _ = _ref2[0];
        var connection = _ref2[1];

        return connection._getInfoService().closeConnection(true);
      }));
    })

    // Do NOT call this from outside this class. Use ServerConnection.getOrCreate() instead.
  }, {
    key: '_connections',
    value: new Map(),
    enumerable: true
  }]);

  function ServerConnection(config) {
    _classCallCheck(this, ServerConnection);

    this._entries = {};
    this._config = config;
    this._closed = false;
    this._healthNotifier = null;
    this._client = null;
    this._connections = [];
  }

  _createClass(ServerConnection, [{
    key: 'dispose',
    value: function dispose() {
      if (this._healthNotifier != null) {
        this._healthNotifier.dispose();
      }
    }
  }, {
    key: '_monitorConnectionHeartbeat',
    value: function _monitorConnectionHeartbeat() {
      (0, (_assert2 || _assert()).default)(this._healthNotifier == null);
      this._healthNotifier = new (_ConnectionHealthNotifier2 || _ConnectionHealthNotifier()).ConnectionHealthNotifier(this._config.host, this.getSocket());
    }
  }, {
    key: 'getUriOfRemotePath',
    value: function getUriOfRemotePath(remotePath) {
      return 'nuclide://' + this.getRemoteHostname() + remotePath;
    }
  }, {
    key: 'getPathOfUri',
    value: function getPathOfUri(uri) {
      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(uri).path;
    }
  }, {
    key: 'createDirectory',
    value: function createDirectory(uri, hgRepositoryDescription) {
      var symlink = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var _default$parse = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(uri);

      var path = _default$parse.path;

      path = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.normalize(path);

      var entry = this._entries[path];
      if (!entry || entry.getLocalPath() !== path || entry.isSymbolicLink() !== symlink) {
        this._entries[path] = entry = new (_RemoteDirectory2 || _RemoteDirectory()).RemoteDirectory(this, this.getUriOfRemotePath(path), symlink, { hgRepositoryDescription: hgRepositoryDescription });
        this._addHandlersForEntry(entry);
      }

      (0, (_assert2 || _assert()).default)(entry instanceof (_RemoteDirectory2 || _RemoteDirectory()).RemoteDirectory);
      if (!entry.isDirectory()) {
        throw new Error('Path is not a directory:' + uri);
      }

      return entry;
    }
  }, {
    key: 'createFile',
    value: function createFile(uri) {
      var symlink = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var _default$parse2 = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(uri);

      var path = _default$parse2.path;

      path = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.normalize(path);

      var entry = this._entries[path];
      if (!entry || entry.getLocalPath() !== path || entry.isSymbolicLink() !== symlink) {
        this._entries[path] = entry = new (_RemoteFile2 || _RemoteFile()).RemoteFile(this, this.getUriOfRemotePath(path), symlink);
        this._addHandlersForEntry(entry);
      }

      (0, (_assert2 || _assert()).default)(entry instanceof (_RemoteFile2 || _RemoteFile()).RemoteFile);
      if (entry.isDirectory()) {
        throw new Error('Path is not a file');
      }

      return entry;
    }
  }, {
    key: '_addHandlersForEntry',
    value: function _addHandlersForEntry(entry) {
      var _this = this;

      // TODO(most): Subscribe to rename events when they're implemented.
      var deleteSubscription = entry.onDidDelete(function () {
        delete _this._entries[entry.getLocalPath()];
        deleteSubscription.dispose();
      });
    }
  }, {
    key: 'initialize',
    value: _asyncToGenerator(function* () {
      this._startRpc();
      var client = this.getClient();
      var clientVersion = (0, (_nuclideVersion2 || _nuclideVersion()).getVersion)();

      // Test connection first. First time we get here we're checking to reestablish
      // connection using cached credentials. This will fail fast (faster than infoService)
      // when we don't have cached credentials yet.
      var heartbeatVersion = yield client.getTransport().testConnection();
      if (clientVersion !== heartbeatVersion) {
        throw new Error('Version mismatch. Client at ' + clientVersion + ' while server at ' + heartbeatVersion + '.');
      }

      // Do another version check over the RPC framework.
      var serverVersion = yield this._getInfoService().getServerVersion();

      if (clientVersion !== serverVersion) {
        throw new Error('Version mismatch. Client at ' + clientVersion + ' while server at ' + serverVersion + '.');
      }

      this._monitorConnectionHeartbeat();

      ServerConnection._connections.set(this.getRemoteHostname(), this);
      (0, (_RemoteConnectionConfigurationManager2 || _RemoteConnectionConfigurationManager()).setConnectionConfig)(this._config);
      _emitter.emit('did-add', this);
    })
  }, {
    key: 'close',
    value: function close() {
      var _this2 = this;

      if (this._closed) {
        return;
      }

      // Future getClient calls should fail, if it has a cached ServerConnection instance.
      this._closed = true;

      Object.keys(this._entries).forEach(function (path) {
        _this2._entries[path].dispose();
      });
      this._entries = {};

      // The Rpc channel owns the socket.
      if (this._client != null) {
        this._client.dispose();
        this._client = null;
      }

      // Remove from _connections to not be considered in future connection queries.
      if (ServerConnection._connections.delete(this.getRemoteHostname())) {
        _emitter.emit('did-close', this);
      }
    }
  }, {
    key: 'getClient',
    value: function getClient() {
      (0, (_assert2 || _assert()).default)(!this._closed && this._client != null, 'Server connection has been closed.');
      return this._client;
    }
  }, {
    key: '_startRpc',
    value: function _startRpc() {
      var uri = undefined;
      var options = undefined;

      // Use https if we have key, cert, and ca
      if (this._isSecure()) {
        (0, (_assert2 || _assert()).default)(this._config.certificateAuthorityCertificate != null);
        (0, (_assert2 || _assert()).default)(this._config.clientCertificate != null);
        (0, (_assert2 || _assert()).default)(this._config.clientKey != null);
        options = {
          ca: this._config.certificateAuthorityCertificate,
          cert: this._config.clientCertificate,
          key: this._config.clientKey
        };
        uri = 'https://' + this.getRemoteHostname() + ':' + this.getPort();
      } else {
        options = null;
        uri = 'http://' + this.getRemoteHostname() + ':' + this.getPort();
      }

      var socket = new (_nuclideServerLibNuclideSocket2 || _nuclideServerLibNuclideSocket()).NuclideSocket(uri, options);
      var client = (_nuclideRpc2 || _nuclideRpc()).RpcConnection.createRemote(this.getRemoteHostname(), socket, (_nuclideServerLibServicesConfig2 || _nuclideServerLibServicesConfig()).default);

      this._client = client;
    }
  }, {
    key: '_isSecure',
    value: function _isSecure() {
      return Boolean(this._config.certificateAuthorityCertificate && this._config.clientCertificate && this._config.clientKey);
    }
  }, {
    key: 'getPort',
    value: function getPort() {
      return this._config.port;
    }
  }, {
    key: 'getRemoteHostname',
    value: function getRemoteHostname() {
      return this._config.host;
    }
  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this._config;
    }
  }, {
    key: 'addConnection',
    value: function addConnection(connection) {
      this._connections.push(connection);
    }
  }, {
    key: 'removeConnection',
    value: _asyncToGenerator(function* (connection, shutdownIfLast) {
      (0, (_assert2 || _assert()).default)(this._connections.indexOf(connection) !== -1, 'Attempt to remove a non-existent RemoteConnection');
      this._connections.splice(this._connections.indexOf(connection), 1);
      if (this._connections.length === 0) {
        // The await here is subtle, it ensures that the shutdown call is sent
        // on the socket before the socket is closed on the next line.
        yield this._getInfoService().closeConnection(shutdownIfLast);
        this.close();
      }
    })
  }, {
    key: 'getRemoteConnectionForUri',
    value: function getRemoteConnectionForUri(uri) {
      var _default$parse3 = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(uri);

      var path = _default$parse3.path;

      return this.getConnections().filter(function (connection) {
        return path.startsWith(connection.getPathForInitialWorkingDirectory());
      })[0];
    }
  }, {
    key: 'getConnections',
    value: function getConnections() {
      return this._connections;
    }
  }, {
    key: 'getService',
    value: function getService(serviceName) {
      return this.getClient().getService(serviceName);
    }
  }, {
    key: 'getSocket',
    value: function getSocket() {
      return this.getClient().getTransport();
    }
  }, {
    key: '_getInfoService',
    value: function _getInfoService() {
      return this.getService('InfoService');
    }
  }], [{
    key: '_createInsecureConnectionForTesting',
    value: _asyncToGenerator(function* (cwd, port) {
      var config = {
        host: 'localhost',
        port: port,
        cwd: cwd
      };
      var connection = new ServerConnection(config);
      yield connection.initialize();
      return connection;
    })
  }, {
    key: 'onDidAddServerConnection',
    value: function onDidAddServerConnection(handler) {
      _emitter.on('did-add', handler);
      return new (_atom2 || _atom()).Disposable(function () {
        _emitter.removeListener('did-add', handler);
      });
    }
  }, {
    key: 'onDidCloseServerConnection',
    value: function onDidCloseServerConnection(handler) {
      _emitter.on('did-close', handler);
      return new (_atom2 || _atom()).Disposable(function () {
        _emitter.removeListener('did-close', handler);
      });
    }
  }, {
    key: 'getForUri',
    value: function getForUri(uri) {
      var _default$parse4 = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(uri);

      var hostname = _default$parse4.hostname;

      if (hostname == null) {
        return null;
      }
      return ServerConnection.getByHostname(hostname);
    }
  }, {
    key: 'getByHostname',
    value: function getByHostname(hostname) {
      return ServerConnection._connections.get(hostname);
    }
  }]);

  return ServerConnection;
})();

module.exports = {
  ServerConnection: ServerConnection,
  __test__: {
    connections: ServerConnection._connections
  }
};
// host nuclide server is running on.
// port to connect to.
// certificate of certificate authority.
// client certificate for https connection.