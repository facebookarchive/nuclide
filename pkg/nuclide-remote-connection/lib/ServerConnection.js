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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nuclideServerLibServiceframeworkClientComponent = require('../../nuclide-server/lib/serviceframework/ClientComponent');

var _nuclideServerLibServiceframeworkClientComponent2 = _interopRequireDefault(_nuclideServerLibServiceframeworkClientComponent);

var _nuclideServerLibServiceframeworkConfig = require('../../nuclide-server/lib/serviceframework/config');

var _nuclideServiceParser = require('../../nuclide-service-parser');

var _nuclideServerLibServiceframeworkIndex = require('../../nuclide-server/lib/serviceframework/index');

var _nuclideServerLibServiceframeworkIndex2 = _interopRequireDefault(_nuclideServerLibServiceframeworkIndex);

var _RemoteConnectionConfigurationManager = require('./RemoteConnectionConfigurationManager');

var _ConnectionHealthNotifier = require('./ConnectionHealthNotifier');

var _RemoteFile = require('./RemoteFile');

var _RemoteDirectory = require('./RemoteDirectory');

var _atom = require('atom');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _events = require('events');

var _nuclideServerLibNuclideSocket = require('../../nuclide-server/lib/NuclideSocket');

var _nuclideServerLibNuclideSocket2 = _interopRequireDefault(_nuclideServerLibNuclideSocket);

var _nuclideVersion = require('../../nuclide-version');

var newServices = _nuclideServerLibServiceframeworkIndex2['default'].loadServicesConfig();

// key for https connection.

var _emitter = new _events.EventEmitter();

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
      (0, _assert2['default'])(this._healthNotifier == null);
      this._healthNotifier = new _ConnectionHealthNotifier.ConnectionHealthNotifier(this._config.host, this.getSocket());
    }
  }, {
    key: 'getUriOfRemotePath',
    value: function getUriOfRemotePath(remotePath) {
      return 'nuclide://' + this.getRemoteHost() + remotePath;
    }
  }, {
    key: 'getPathOfUri',
    value: function getPathOfUri(uri) {
      return (0, _nuclideRemoteUri.parse)(uri).path;
    }
  }, {
    key: 'createDirectory',
    value: function createDirectory(uri, hgRepositoryDescription) {
      var symlink = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var _parseRemoteUri = (0, _nuclideRemoteUri.parse)(uri);

      var path = _parseRemoteUri.path;

      path = _path2['default'].normalize(path);

      var entry = this._entries[path];
      if (!entry || entry.getLocalPath() !== path || entry.isSymbolicLink() !== symlink) {
        this._entries[path] = entry = new _RemoteDirectory.RemoteDirectory(this, this.getUriOfRemotePath(path), symlink, { hgRepositoryDescription: hgRepositoryDescription });
        // TODO: We should add the following line to keep the cache up-to-date.
        // We need to implement onDidRename and onDidDelete in RemoteDirectory
        // first. It's ok that we don't add the handlers for now since we have
        // the check `entry.getLocalPath() !== path` above.
        //
        // this._addHandlersForEntry(entry);
      }

      (0, _assert2['default'])(entry instanceof _RemoteDirectory.RemoteDirectory);
      if (!entry.isDirectory()) {
        throw new Error('Path is not a directory:' + uri);
      }

      return entry;
    }
  }, {
    key: 'createFile',
    value: function createFile(uri) {
      var symlink = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var _parseRemoteUri2 = (0, _nuclideRemoteUri.parse)(uri);

      var path = _parseRemoteUri2.path;

      path = _path2['default'].normalize(path);

      var entry = this._entries[path];
      if (!entry || entry.getLocalPath() !== path || entry.isSymbolicLink() !== symlink) {
        this._entries[path] = entry = new _RemoteFile.RemoteFile(this, this.getUriOfRemotePath(path), symlink);
        this._addHandlersForEntry(entry);
      }

      (0, _assert2['default'])(entry instanceof _RemoteFile.RemoteFile);
      if (entry.isDirectory()) {
        throw new Error('Path is not a file');
      }

      return entry;
    }
  }, {
    key: '_addHandlersForEntry',
    value: function _addHandlersForEntry(entry) {
      var _this = this;

      var oldPath = entry.getLocalPath();
      /* $FlowFixMe */
      var renameSubscription = entry.onDidRename(function () {
        delete _this._entries[oldPath];
        _this._entries[entry.getLocalPath()] = entry;
      });
      /* $FlowFixMe */
      var deleteSubscription = entry.onDidDelete(function () {
        delete _this._entries[entry.getLocalPath()];
        renameSubscription.dispose();
        deleteSubscription.dispose();
      });
    }
  }, {
    key: 'initialize',
    value: _asyncToGenerator(function* () {
      this._startRpc();
      var client = this.getClient();

      // Test connection first. First time we get here we're checking to reestablish
      // connection using cached credentials. This will fail fast (faster than infoService)
      // when we don't have cached credentials yet.
      yield client.testConnection();

      // Do version check.
      var serverVersion = yield this._getInfoService().getServerVersion();

      var clientVersion = (0, _nuclideVersion.getVersion)();
      if (clientVersion !== serverVersion) {
        throw new Error('Version mismatch. Client at ' + clientVersion + ' while server at ' + serverVersion + '.');
      }

      this._monitorConnectionHeartbeat();

      ServerConnection._connections.set(this.getRemoteHostname(), this);
      (0, _RemoteConnectionConfigurationManager.setConnectionConfig)(this._config);
      _emitter.emit('did-add', this);
    })
  }, {
    key: 'close',
    value: function close() {
      if (this._closed) {
        return;
      }

      // Future getClient calls should fail, if it has a cached ServerConnection instance.
      this._closed = true;

      // The Rpc channel owns the socket.
      if (this._client != null) {
        this._client.close();
        this._client = null;
      }

      // Remove from _connections to not be considered in future connection queries.
      if (ServerConnection._connections['delete'](this.getRemoteHostname())) {
        _emitter.emit('did-close', this);
      }
    }
  }, {
    key: 'getClient',
    value: function getClient() {
      (0, _assert2['default'])(!this._closed && this._client != null, 'Server connection has been closed.');
      return this._client;
    }
  }, {
    key: '_startRpc',
    value: function _startRpc() {
      var _this2 = this;

      var uri = undefined;
      var options = {};

      // Use https if we have key, cert, and ca
      if (this._isSecure()) {
        options.certificateAuthorityCertificate = this._config.certificateAuthorityCertificate;
        options.clientCertificate = this._config.clientCertificate;
        options.clientKey = this._config.clientKey;
        uri = 'https://' + this.getRemoteHost();
      } else {
        uri = 'http://' + this.getRemoteHost();
      }

      var socket = new _nuclideServerLibNuclideSocket2['default'](uri, options);
      var client = new _nuclideServerLibServiceframeworkClientComponent2['default'](socket, (0, _nuclideServerLibServiceframeworkConfig.loadServicesConfig)());

      // Register NuclideUri type conversions.
      client.registerType('NuclideUri', function (remoteUri) {
        return _this2.getPathOfUri(remoteUri);
      }, function (path) {
        return _this2.getUriOfRemotePath(path);
      });

      this._client = client;
    }
  }, {
    key: '_isSecure',
    value: function _isSecure() {
      return !!(this._config.certificateAuthorityCertificate && this._config.clientCertificate && this._config.clientKey);
    }
  }, {
    key: 'getRemoteHost',
    value: function getRemoteHost() {
      return this._config.host + ':' + this._config.port;
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
      (0, _assert2['default'])(this._connections.indexOf(connection) !== -1, 'Attempt to remove a non-existent RemoteConnection');
      this._connections.splice(this._connections.indexOf(connection), 1);
      if (this._connections.length === 0) {
        // The await here is subtle, it ensures that the shutdown call is sent
        // on the socket before the socket is closed on the next line.
        // TODO: Ideally we'd not Promise.all() for argument lists which do not
        // contain any remote interfaces rather than await here.
        yield this._getInfoService().closeConnection(shutdownIfLast);
        this.close();
      }
    })
  }, {
    key: 'getRemoteConnectionForUri',
    value: function getRemoteConnectionForUri(uri) {
      var _parseRemoteUri3 = (0, _nuclideRemoteUri.parse)(uri);

      var path = _parseRemoteUri3.path;

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
      var _newServices$filter = newServices.filter(function (config) {
        return config.name === serviceName;
      });

      var _newServices$filter2 = _slicedToArray(_newServices$filter, 1);

      var serviceConfig = _newServices$filter2[0];

      (0, _assert2['default'])(serviceConfig != null, 'No config found for service ' + serviceName);
      return (0, _nuclideServiceParser.getProxy)(serviceConfig.name, serviceConfig.definition, this.getClient());
    }
  }, {
    key: 'getSocket',
    value: function getSocket() {
      return this.getClient().getSocket();
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
      return new _atom.Disposable(function () {
        _emitter.removeListener('did-add', handler);
      });
    }
  }, {
    key: 'onDidCloseServerConnection',
    value: function onDidCloseServerConnection(handler) {
      _emitter.on('did-close', handler);
      return new _atom.Disposable(function () {
        _emitter.removeListener('did-close', handler);
      });
    }
  }, {
    key: 'getForUri',
    value: function getForUri(uri) {
      var _parseRemoteUri4 = (0, _nuclideRemoteUri.parse)(uri);

      var hostname = _parseRemoteUri4.hostname;

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