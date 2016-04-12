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
//# sourceMappingURL=data:application/json;base64,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QUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNqRDs7O1dBRW1CLHVCQUFDLFFBQWdCLEVBQXFCO0FBQ3hELGFBQU8sZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNwRDs7O1NBOVJHLGdCQUFnQjs7O0FBMFR0QixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Ysa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixVQUFRLEVBQUU7QUFDUixlQUFXLEVBQUUsZ0JBQWdCLENBQUMsWUFBWTtHQUMzQztDQUNGLENBQUMiLCJmaWxlIjoiU2VydmVyQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbic7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5RGVzY3JpcHRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtc291cmNlLWNvbnRyb2wtaGVscGVycyc7XG5pbXBvcnQgdHlwZW9mICogYXMgSW5mb1NlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1zZXJ2ZXIvbGliL3NlcnZpY2VzL0luZm9TZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGhNb2R1bGUgZnJvbSAncGF0aCc7XG5pbXBvcnQgQ2xpZW50Q29tcG9uZW50IGZyb20gJy4uLy4uL251Y2xpZGUtc2VydmVyL2xpYi9zZXJ2aWNlZnJhbWV3b3JrL0NsaWVudENvbXBvbmVudCc7XG5pbXBvcnQge2xvYWRTZXJ2aWNlc0NvbmZpZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvY29uZmlnJztcbmltcG9ydCB7Z2V0UHJveHl9IGZyb20gJy4uLy4uL251Y2xpZGUtc2VydmljZS1wYXJzZXInO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi4vLi4vbnVjbGlkZS1zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvaW5kZXgnO1xuaW1wb3J0IHtzZXRDb25uZWN0aW9uQ29uZmlnfSBmcm9tICcuL1JlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uTWFuYWdlcic7XG5pbXBvcnQge0Nvbm5lY3Rpb25IZWFsdGhOb3RpZmllcn0gZnJvbSAnLi9Db25uZWN0aW9uSGVhbHRoTm90aWZpZXInO1xuaW1wb3J0IHtSZW1vdGVGaWxlfSBmcm9tICcuL1JlbW90ZUZpbGUnO1xuaW1wb3J0IHtSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4vUmVtb3RlRGlyZWN0b3J5JztcblxuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VSZW1vdGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxuaW1wb3J0IE51Y2xpZGVTb2NrZXQgZnJvbSAnLi4vLi4vbnVjbGlkZS1zZXJ2ZXIvbGliL051Y2xpZGVTb2NrZXQnO1xuaW1wb3J0IHtnZXRWZXJzaW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXZlcnNpb24nO1xuXG5jb25zdCBuZXdTZXJ2aWNlcyA9IFNlcnZpY2VGcmFtZXdvcmsubG9hZFNlcnZpY2VzQ29uZmlnKCk7XG5cbmV4cG9ydCB0eXBlIFNlcnZlckNvbm5lY3Rpb25Db25maWd1cmF0aW9uID0ge1xuICBob3N0OiBzdHJpbmc7IC8vIGhvc3QgbnVjbGlkZSBzZXJ2ZXIgaXMgcnVubmluZyBvbi5cbiAgcG9ydDogbnVtYmVyOyAvLyBwb3J0IHRvIGNvbm5lY3QgdG8uXG4gIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNlcnRpZmljYXRlIG9mIGNlcnRpZmljYXRlIGF1dGhvcml0eS5cbiAgY2xpZW50Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNsaWVudCBjZXJ0aWZpY2F0ZSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbiAgY2xpZW50S2V5PzogQnVmZmVyOyAvLyBrZXkgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG59O1xuXG5jb25zdCBfZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4vLyBTZXJ2ZXJDb25uZWN0aW9uIHJlcHJlc2VudHMgdGhlIGNsaWVudCBzaWRlIG9mIGEgY29ubmVjdGlvbiB0byBhIHJlbW90ZSBtYWNoaW5lLlxuLy8gVGhlcmUgY2FuIGJlIGF0IG1vc3Qgb25lIGNvbm5lY3Rpb24gdG8gYSBnaXZlbiByZW1vdGUgbWFjaGluZSBhdCBhIHRpbWUuIENsaWVudHMgc2hvdWxkXG4vLyBnZXQgYSBTZXJ2ZXJDb25uZWN0aW9uIHZpYSBTZXJ2ZXJDb25uZWN0aW9uLmdldE9yQ3JlYXRlKCkgYW5kIHNob3VsZCBuZXZlciBjYWxsIHRoZVxuLy8gY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsdGVybmF0ZWx5IGV4aXN0aW5nIGNvbm5lY3Rpb25zIGNhbiBiZSBxdWVyaWVkIHdpdGggZ2V0QnlIb3N0bmFtZSgpLlxuLy9cbi8vIGdldFNlcnZpY2UoKSByZXR1cm5zIHR5cGVkIFJQQyBzZXJ2aWNlcyB2aWEgdGhlIHNlcnZpY2UgZnJhbWV3b3JrLlxuLy9cbi8vIEEgU2VydmVyQ29ubmVjdGlvbiBrZWVwcyBhIGxpc3Qgb2YgUmVtb3RlQ29ubmVjdGlvbnMgLSBvbmUgZm9yIGVhY2ggb3BlbiBkaXJlY3Rvcnkgb24gdGhlIHJlbW90ZVxuLy8gbWFjaGluZS4gT25jZSBhbGwgUmVtb3RlQ29ubmVjdGlvbnMgaGF2ZSBiZWVuIGNsb3NlZCwgdGhlbiB0aGUgU2VydmVyQ29ubmVjdGlvbiB3aWxsIGNsb3NlLlxuY2xhc3MgU2VydmVyQ29ubmVjdGlvbiB7XG4gIF9lbnRyaWVzOiB7W3BhdGg6IHN0cmluZ106IFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3Rvcnl9O1xuICBfY29uZmlnOiBTZXJ2ZXJDb25uZWN0aW9uQ29uZmlndXJhdGlvbjtcbiAgX2Nsb3NlZDogYm9vbGVhbjtcbiAgX2hlYWx0aE5vdGlmaWVyOiA/Q29ubmVjdGlvbkhlYWx0aE5vdGlmaWVyO1xuICBfY2xpZW50OiA/Q2xpZW50Q29tcG9uZW50O1xuICBfY29ubmVjdGlvbnM6IEFycmF5PFJlbW90ZUNvbm5lY3Rpb24+O1xuXG4gIHN0YXRpYyBfY29ubmVjdGlvbnM6IE1hcDxzdHJpbmcsIFNlcnZlckNvbm5lY3Rpb24+ID0gbmV3IE1hcCgpO1xuXG4gIHN0YXRpYyBhc3luYyBnZXRPckNyZWF0ZShjb25maWc6IFNlcnZlckNvbm5lY3Rpb25Db25maWd1cmF0aW9uKTogUHJvbWlzZTxTZXJ2ZXJDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgZXhpc3RpbmdDb25uZWN0aW9uID0gU2VydmVyQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lKGNvbmZpZy5ob3N0KTtcbiAgICBpZiAoZXhpc3RpbmdDb25uZWN0aW9uICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBleGlzdGluZ0Nvbm5lY3Rpb247XG4gICAgfVxuXG4gICAgY29uc3QgbmV3Q29ubmVjdGlvbiA9IG5ldyBTZXJ2ZXJDb25uZWN0aW9uKGNvbmZpZyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG5ld0Nvbm5lY3Rpb24uaW5pdGlhbGl6ZSgpO1xuICAgICAgcmV0dXJuIG5ld0Nvbm5lY3Rpb247XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbmV3Q29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvLyBEbyBOT1QgY2FsbCB0aGlzIGZyb20gb3V0c2lkZSB0aGlzIGNsYXNzLiBVc2UgU2VydmVyQ29ubmVjdGlvbi5nZXRPckNyZWF0ZSgpIGluc3RlYWQuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogU2VydmVyQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLl9lbnRyaWVzID0ge307XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX2Nsb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2hlYWx0aE5vdGlmaWVyID0gbnVsbDtcbiAgICB0aGlzLl9jbGllbnQgPSBudWxsO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gW107XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9oZWFsdGhOb3RpZmllciAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9oZWFsdGhOb3RpZmllci5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGFzeW5jIF9jcmVhdGVJbnNlY3VyZUNvbm5lY3Rpb25Gb3JUZXN0aW5nKFxuICAgIGN3ZDogc3RyaW5nLFxuICAgIHBvcnQ6IG51bWJlcixcbiAgKTogUHJvbWlzZTw/U2VydmVyQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgcG9ydCxcbiAgICAgIGN3ZCxcbiAgICB9O1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgU2VydmVyQ29ubmVjdGlvbihjb25maWcpO1xuICAgIGF3YWl0IGNvbm5lY3Rpb24uaW5pdGlhbGl6ZSgpO1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgX21vbml0b3JDb25uZWN0aW9uSGVhcnRiZWF0KCkge1xuICAgIGludmFyaWFudCh0aGlzLl9oZWFsdGhOb3RpZmllciA9PSBudWxsKTtcbiAgICB0aGlzLl9oZWFsdGhOb3RpZmllciA9IG5ldyBDb25uZWN0aW9uSGVhbHRoTm90aWZpZXIodGhpcy5fY29uZmlnLmhvc3QsIHRoaXMuZ2V0U29ja2V0KCkpO1xuICB9XG5cbiAgZ2V0VXJpT2ZSZW1vdGVQYXRoKHJlbW90ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBudWNsaWRlOi8vJHt0aGlzLmdldFJlbW90ZUhvc3QoKX0ke3JlbW90ZVBhdGh9YDtcbiAgfVxuXG4gIGdldFBhdGhPZlVyaSh1cmk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhcnNlUmVtb3RlVXJpKHVyaSkucGF0aDtcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdG9yeShcbiAgICB1cmk6IE51Y2xpZGVVcmksXG4gICAgaGdSZXBvc2l0b3J5RGVzY3JpcHRpb246ID9IZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbixcbiAgICBzeW1saW5rOiBib29sZWFuID0gZmFsc2VcbiAgKTogUmVtb3RlRGlyZWN0b3J5IHtcbiAgICBsZXQge3BhdGh9ID0gcGFyc2VSZW1vdGVVcmkodXJpKTtcbiAgICBwYXRoID0gcGF0aE1vZHVsZS5ub3JtYWxpemUocGF0aCk7XG5cbiAgICBsZXQgZW50cnkgPSB0aGlzLl9lbnRyaWVzW3BhdGhdO1xuICAgIGlmIChcbiAgICAgICFlbnRyeSB8fFxuICAgICAgZW50cnkuZ2V0TG9jYWxQYXRoKCkgIT09IHBhdGggfHxcbiAgICAgIGVudHJ5LmlzU3ltYm9saWNMaW5rKCkgIT09IHN5bWxpbmtcbiAgICApIHtcbiAgICAgIHRoaXMuX2VudHJpZXNbcGF0aF0gPSBlbnRyeSA9IG5ldyBSZW1vdGVEaXJlY3RvcnkoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHBhdGgpLFxuICAgICAgICBzeW1saW5rLFxuICAgICAgICB7aGdSZXBvc2l0b3J5RGVzY3JpcHRpb259LFxuICAgICAgKTtcbiAgICAgIC8vIFRPRE86IFdlIHNob3VsZCBhZGQgdGhlIGZvbGxvd2luZyBsaW5lIHRvIGtlZXAgdGhlIGNhY2hlIHVwLXRvLWRhdGUuXG4gICAgICAvLyBXZSBuZWVkIHRvIGltcGxlbWVudCBvbkRpZFJlbmFtZSBhbmQgb25EaWREZWxldGUgaW4gUmVtb3RlRGlyZWN0b3J5XG4gICAgICAvLyBmaXJzdC4gSXQncyBvayB0aGF0IHdlIGRvbid0IGFkZCB0aGUgaGFuZGxlcnMgZm9yIG5vdyBzaW5jZSB3ZSBoYXZlXG4gICAgICAvLyB0aGUgY2hlY2sgYGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoYCBhYm92ZS5cbiAgICAgIC8vXG4gICAgICAvLyB0aGlzLl9hZGRIYW5kbGVyc0ZvckVudHJ5KGVudHJ5KTtcbiAgICB9XG5cbiAgICBpbnZhcmlhbnQoZW50cnkgaW5zdGFuY2VvZiBSZW1vdGVEaXJlY3RvcnkpO1xuICAgIGlmICghZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGlzIG5vdCBhIGRpcmVjdG9yeTonICsgdXJpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICBjcmVhdGVGaWxlKHVyaTogTnVjbGlkZVVyaSwgc3ltbGluazogYm9vbGVhbiA9IGZhbHNlKTogUmVtb3RlRmlsZSB7XG4gICAgbGV0IHtwYXRofSA9IHBhcnNlUmVtb3RlVXJpKHVyaSk7XG4gICAgcGF0aCA9IHBhdGhNb2R1bGUubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoXG4gICAgICAhZW50cnkgfHxcbiAgICAgIGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoIHx8XG4gICAgICBlbnRyeS5pc1N5bWJvbGljTGluaygpICE9PSBzeW1saW5rXG4gICAgKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRmlsZShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgocGF0aCksXG4gICAgICAgIHN5bWxpbmssXG4gICAgICApO1xuICAgICAgdGhpcy5fYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeSk7XG4gICAgfVxuXG4gICAgaW52YXJpYW50KGVudHJ5IGluc3RhbmNlb2YgUmVtb3RlRmlsZSk7XG4gICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGF0aCBpcyBub3QgYSBmaWxlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgX2FkZEhhbmRsZXJzRm9yRW50cnkoZW50cnk6IFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3RvcnkpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRQYXRoID0gZW50cnkuZ2V0TG9jYWxQYXRoKCk7XG4gICAgLyogJEZsb3dGaXhNZSAqL1xuICAgIGNvbnN0IHJlbmFtZVN1YnNjcmlwdGlvbiA9IGVudHJ5Lm9uRGlkUmVuYW1lKCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9lbnRyaWVzW29sZFBhdGhdO1xuICAgICAgdGhpcy5fZW50cmllc1tlbnRyeS5nZXRMb2NhbFBhdGgoKV0gPSBlbnRyeTtcbiAgICB9KTtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgY29uc3QgZGVsZXRlU3Vic2NyaXB0aW9uID0gZW50cnkub25EaWREZWxldGUoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2VudHJpZXNbZW50cnkuZ2V0TG9jYWxQYXRoKCldO1xuICAgICAgcmVuYW1lU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGRlbGV0ZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3N0YXJ0UnBjKCk7XG4gICAgY29uc3QgY2xpZW50ID0gdGhpcy5nZXRDbGllbnQoKTtcblxuICAgIC8vIFRlc3QgY29ubmVjdGlvbiBmaXJzdC4gRmlyc3QgdGltZSB3ZSBnZXQgaGVyZSB3ZSdyZSBjaGVja2luZyB0byByZWVzdGFibGlzaFxuICAgIC8vIGNvbm5lY3Rpb24gdXNpbmcgY2FjaGVkIGNyZWRlbnRpYWxzLiBUaGlzIHdpbGwgZmFpbCBmYXN0IChmYXN0ZXIgdGhhbiBpbmZvU2VydmljZSlcbiAgICAvLyB3aGVuIHdlIGRvbid0IGhhdmUgY2FjaGVkIGNyZWRlbnRpYWxzIHlldC5cbiAgICBhd2FpdCBjbGllbnQudGVzdENvbm5lY3Rpb24oKTtcblxuICAgIC8vIERvIHZlcnNpb24gY2hlY2suXG4gICAgY29uc3Qgc2VydmVyVmVyc2lvbiA9IGF3YWl0IHRoaXMuX2dldEluZm9TZXJ2aWNlKCkuZ2V0U2VydmVyVmVyc2lvbigpO1xuXG4gICAgY29uc3QgY2xpZW50VmVyc2lvbiA9IGdldFZlcnNpb24oKTtcbiAgICBpZiAoY2xpZW50VmVyc2lvbiAhPT0gc2VydmVyVmVyc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVmVyc2lvbiBtaXNtYXRjaC4gQ2xpZW50IGF0ICR7Y2xpZW50VmVyc2lvbn0gd2hpbGUgc2VydmVyIGF0ICR7c2VydmVyVmVyc2lvbn0uYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbW9uaXRvckNvbm5lY3Rpb25IZWFydGJlYXQoKTtcblxuICAgIFNlcnZlckNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLnNldCh0aGlzLmdldFJlbW90ZUhvc3RuYW1lKCksIHRoaXMpO1xuICAgIHNldENvbm5lY3Rpb25Db25maWcodGhpcy5fY29uZmlnKTtcbiAgICBfZW1pdHRlci5lbWl0KCdkaWQtYWRkJywgdGhpcyk7XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY2xvc2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRnV0dXJlIGdldENsaWVudCBjYWxscyBzaG91bGQgZmFpbCwgaWYgaXQgaGFzIGEgY2FjaGVkIFNlcnZlckNvbm5lY3Rpb24gaW5zdGFuY2UuXG4gICAgdGhpcy5fY2xvc2VkID0gdHJ1ZTtcblxuICAgIC8vIFRoZSBScGMgY2hhbm5lbCBvd25zIHRoZSBzb2NrZXQuXG4gICAgaWYgKHRoaXMuX2NsaWVudCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9jbGllbnQuY2xvc2UoKTtcbiAgICAgIHRoaXMuX2NsaWVudCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gX2Nvbm5lY3Rpb25zIHRvIG5vdCBiZSBjb25zaWRlcmVkIGluIGZ1dHVyZSBjb25uZWN0aW9uIHF1ZXJpZXMuXG4gICAgaWYgKFNlcnZlckNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmRlbGV0ZSh0aGlzLmdldFJlbW90ZUhvc3RuYW1lKCkpKSB7XG4gICAgICBfZW1pdHRlci5lbWl0KCdkaWQtY2xvc2UnLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXRDbGllbnQoKTogQ2xpZW50Q29tcG9uZW50IHtcbiAgICBpbnZhcmlhbnQoIXRoaXMuX2Nsb3NlZCAmJiB0aGlzLl9jbGllbnQgIT0gbnVsbCwgJ1NlcnZlciBjb25uZWN0aW9uIGhhcyBiZWVuIGNsb3NlZC4nKTtcbiAgICByZXR1cm4gdGhpcy5fY2xpZW50O1xuICB9XG5cbiAgX3N0YXJ0UnBjKCk6IHZvaWQge1xuICAgIGxldCB1cmk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gICAgLy8gVXNlIGh0dHBzIGlmIHdlIGhhdmUga2V5LCBjZXJ0LCBhbmQgY2FcbiAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgb3B0aW9ucy5jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlID0gdGhpcy5fY29uZmlnLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU7XG4gICAgICBvcHRpb25zLmNsaWVudENlcnRpZmljYXRlID0gdGhpcy5fY29uZmlnLmNsaWVudENlcnRpZmljYXRlO1xuICAgICAgb3B0aW9ucy5jbGllbnRLZXkgPSB0aGlzLl9jb25maWcuY2xpZW50S2V5O1xuICAgICAgdXJpID0gYGh0dHBzOi8vJHt0aGlzLmdldFJlbW90ZUhvc3QoKX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICB1cmkgPSBgaHR0cDovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9YDtcbiAgICB9XG5cbiAgICBjb25zdCBzb2NrZXQgPSBuZXcgTnVjbGlkZVNvY2tldCh1cmksIG9wdGlvbnMpO1xuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnRDb21wb25lbnQoc29ja2V0LCBsb2FkU2VydmljZXNDb25maWcoKSk7XG5cbiAgICAvLyBSZWdpc3RlciBOdWNsaWRlVXJpIHR5cGUgY29udmVyc2lvbnMuXG4gICAgY2xpZW50LnJlZ2lzdGVyVHlwZSgnTnVjbGlkZVVyaScsXG4gICAgICByZW1vdGVVcmkgPT4gdGhpcy5nZXRQYXRoT2ZVcmkocmVtb3RlVXJpKSwgcGF0aCA9PiB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSk7XG5cbiAgICB0aGlzLl9jbGllbnQgPSBjbGllbnQ7XG4gIH1cblxuICBfaXNTZWN1cmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKFxuICAgICAgICB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jb25maWcuY2xpZW50Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY29uZmlnLmNsaWVudEtleVxuICAgICk7XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuX2NvbmZpZy5ob3N0fToke3RoaXMuX2NvbmZpZy5wb3J0fWA7XG4gIH1cblxuICBnZXRQb3J0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5wb3J0O1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmhvc3Q7XG4gIH1cblxuICBnZXRDb25maWcoKTogU2VydmVyQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24ge1xuICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gIH1cblxuICBhZGRDb25uZWN0aW9uKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9jb25uZWN0aW9ucy5wdXNoKGNvbm5lY3Rpb24pO1xuICB9XG5cbiAgYXN5bmMgcmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBzaHV0ZG93bklmTGFzdDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGludmFyaWFudCh0aGlzLl9jb25uZWN0aW9ucy5pbmRleE9mKGNvbm5lY3Rpb24pICE9PSAtMSxcbiAgICAgICdBdHRlbXB0IHRvIHJlbW92ZSBhIG5vbi1leGlzdGVudCBSZW1vdGVDb25uZWN0aW9uJyk7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMuc3BsaWNlKHRoaXMuX2Nvbm5lY3Rpb25zLmluZGV4T2YoY29ubmVjdGlvbiksIDEpO1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIFRoZSBhd2FpdCBoZXJlIGlzIHN1YnRsZSwgaXQgZW5zdXJlcyB0aGF0IHRoZSBzaHV0ZG93biBjYWxsIGlzIHNlbnRcbiAgICAgIC8vIG9uIHRoZSBzb2NrZXQgYmVmb3JlIHRoZSBzb2NrZXQgaXMgY2xvc2VkIG9uIHRoZSBuZXh0IGxpbmUuXG4gICAgICAvLyBUT0RPOiBJZGVhbGx5IHdlJ2Qgbm90IFByb21pc2UuYWxsKCkgZm9yIGFyZ3VtZW50IGxpc3RzIHdoaWNoIGRvIG5vdFxuICAgICAgLy8gY29udGFpbiBhbnkgcmVtb3RlIGludGVyZmFjZXMgcmF0aGVyIHRoYW4gYXdhaXQgaGVyZS5cbiAgICAgIGF3YWl0IHRoaXMuX2dldEluZm9TZXJ2aWNlKCkuY2xvc2VDb25uZWN0aW9uKHNodXRkb3duSWZMYXN0KTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgb25EaWRBZGRTZXJ2ZXJDb25uZWN0aW9uKGhhbmRsZXI6IChjb25uZWN0aW9uOiBTZXJ2ZXJDb25uZWN0aW9uKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgX2VtaXR0ZXIub24oJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBvbkRpZENsb3NlU2VydmVyQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogU2VydmVyQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1jbG9zZScsIGhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGdldEZvclVyaSh1cmk6IE51Y2xpZGVVcmkpOiA/U2VydmVyQ29ubmVjdGlvbiB7XG4gICAgY29uc3Qge2hvc3RuYW1lfSA9IHBhcnNlUmVtb3RlVXJpKHVyaSk7XG4gICAgaWYgKGhvc3RuYW1lID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gU2VydmVyQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lKGhvc3RuYW1lKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRCeUhvc3RuYW1lKGhvc3RuYW1lOiBzdHJpbmcpOiA/U2VydmVyQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIFNlcnZlckNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmdldChob3N0bmFtZSk7XG4gIH1cblxuICBnZXRSZW1vdGVDb25uZWN0aW9uRm9yVXJpKHVyaTogTnVjbGlkZVVyaSk6ID9SZW1vdGVDb25uZWN0aW9uIHtcbiAgICBjb25zdCB7cGF0aH0gPSBwYXJzZVJlbW90ZVVyaSh1cmkpO1xuICAgIHJldHVybiB0aGlzLmdldENvbm5lY3Rpb25zKCkuZmlsdGVyKGNvbm5lY3Rpb24gPT4ge1xuICAgICAgcmV0dXJuIHBhdGguc3RhcnRzV2l0aChjb25uZWN0aW9uLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKTtcbiAgICB9KVswXTtcbiAgfVxuXG4gIGdldENvbm5lY3Rpb25zKCk6IEFycmF5PFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbnM7XG4gIH1cblxuICBnZXRTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIGNvbnN0IFtzZXJ2aWNlQ29uZmlnXSA9IG5ld1NlcnZpY2VzLmZpbHRlcihjb25maWcgPT4gY29uZmlnLm5hbWUgPT09IHNlcnZpY2VOYW1lKTtcbiAgICBpbnZhcmlhbnQoc2VydmljZUNvbmZpZyAhPSBudWxsLCBgTm8gY29uZmlnIGZvdW5kIGZvciBzZXJ2aWNlICR7c2VydmljZU5hbWV9YCk7XG4gICAgcmV0dXJuIGdldFByb3h5KHNlcnZpY2VDb25maWcubmFtZSwgc2VydmljZUNvbmZpZy5kZWZpbml0aW9uLCB0aGlzLmdldENsaWVudCgpKTtcbiAgfVxuXG4gIGdldFNvY2tldCgpOiBOdWNsaWRlU29ja2V0IHtcbiAgICByZXR1cm4gdGhpcy5nZXRDbGllbnQoKS5nZXRTb2NrZXQoKTtcbiAgfVxuXG4gIF9nZXRJbmZvU2VydmljZSgpOiBJbmZvU2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VydmljZSgnSW5mb1NlcnZpY2UnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgU2VydmVyQ29ubmVjdGlvbixcbiAgX190ZXN0X186IHtcbiAgICBjb25uZWN0aW9uczogU2VydmVyQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMsXG4gIH0sXG59O1xuIl19