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

var _serverLibServiceframeworkClientComponent = require('../../server/lib/serviceframework/ClientComponent');

var _serverLibServiceframeworkClientComponent2 = _interopRequireDefault(_serverLibServiceframeworkClientComponent);

var _serverLibServiceframeworkConfig = require('../../server/lib/serviceframework/config');

var _serviceParser = require('../../service-parser');

var _serverLibServiceframework = require('../../server/lib/serviceframework');

var _serverLibServiceframework2 = _interopRequireDefault(_serverLibServiceframework);

var _RemoteConnectionConfigurationManager = require('./RemoteConnectionConfigurationManager');

var _ConnectionHealthNotifier = require('./ConnectionHealthNotifier');

var _atom = require('atom');

var _remoteUri = require('../../remote-uri');

var _events = require('events');

var _serverLibNuclideSocket = require('../../server/lib/NuclideSocket');

var _serverLibNuclideSocket2 = _interopRequireDefault(_serverLibNuclideSocket);

var _version = require('../../version');

var newServices = _serverLibServiceframework2['default'].loadServicesConfig();

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
      return (0, _remoteUri.parse)(uri).path;
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
      var infoService = this.getService('InfoService');
      var serverVersion = yield infoService.getServerVersion();

      var clientVersion = (0, _version.getVersion)();
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
      var _this = this;

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

      var socket = new _serverLibNuclideSocket2['default'](uri, options);
      var client = new _serverLibServiceframeworkClientComponent2['default'](socket, (0, _serverLibServiceframeworkConfig.loadServicesConfig)());

      // Register NuclideUri type conversions.
      client.registerType('NuclideUri', function (remoteUri) {
        return _this.getPathOfUri(remoteUri);
      }, function (path) {
        return _this.getUriOfRemotePath(path);
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
    value: function removeConnection(connection) {
      (0, _assert2['default'])(this._connections.indexOf(connection) !== -1, 'Attempt to remove a non-existent RemoteConnection');
      this._connections.splice(this._connections.indexOf(connection), 1);
      if (this._connections.length === 0) {
        this.close();
      }
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
      return (0, _serviceParser.getProxy)(serviceConfig.name, serviceConfig.definition, this.getClient());
    }
  }, {
    key: 'getSocket',
    value: function getSocket() {
      return this.getClient().getSocket();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZlckNvbm5lY3Rpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7Ozt3REFDRixtREFBbUQ7Ozs7K0NBQzlDLDBDQUEwQzs7NkJBQ3BELHNCQUFzQjs7eUNBQ2hCLG1DQUFtQzs7OztvREFDOUIsd0NBQXdDOzt3Q0FDbkMsNEJBQTRCOztvQkFFMUMsTUFBTTs7eUJBQ08sa0JBQWtCOztzQkFDN0IsUUFBUTs7c0NBRVQsZ0NBQWdDOzs7O3VCQUNqQyxlQUFlOztBQUV4QyxJQUFNLFdBQVcsR0FBRyx1Q0FBaUIsa0JBQWtCLEVBQUUsQ0FBQzs7OztBQVUxRCxJQUFNLFFBQXNCLEdBQUcsMEJBQWtCLENBQUM7Ozs7Ozs7Ozs7OztJQVc1QyxnQkFBZ0I7ZUFBaEIsZ0JBQWdCOzs2QkFTSSxXQUFDLE1BQXFDLEVBQTZCO0FBQ3pGLFVBQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2RSxVQUFJLGtCQUFrQixJQUFJLElBQUksRUFBRTtBQUM5QixlQUFPLGtCQUFrQixDQUFDO09BQzNCOztBQUVELFVBQU0sYUFBYSxHQUFHLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkQsVUFBSTtBQUNGLGNBQU0sYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2pDLGVBQU8sYUFBYSxDQUFDO09BQ3RCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixxQkFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCLGNBQU0sQ0FBQyxDQUFDO09BQ1Q7S0FDRjs7Ozs7V0FoQm9ELElBQUksR0FBRyxFQUFFOzs7O0FBbUJuRCxXQTFCUCxnQkFBZ0IsQ0EwQlIsTUFBcUMsRUFBRTswQkExQi9DLGdCQUFnQjs7QUEyQmxCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FB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QUNKLENBQUM7QUFDRixVQUFNLFVBQVUsR0FBRyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hELFlBQU0sVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzlCLGFBQU8sVUFBVSxDQUFDO0tBQ25COzs7V0ErSDhCLGtDQUFDLE9BQStDLEVBQWM7QUFDM0YsY0FBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEMsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLGdCQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUM3QyxDQUFDLENBQUM7S0FDSjs7O1dBRWdDLG9DQUFDLE9BQStDLEVBQWM7QUFDN0YsY0FBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbEMsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLGdCQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUMvQyxDQUFDLENBQUM7S0FDSjs7O1dBRW1CLHVCQUFDLFFBQWdCLEVBQXFCO0FBQ3hELGFBQU8sZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNwRDs7O1NBbk1HLGdCQUFnQjs7O0FBb050QixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Ysa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixVQUFRLEVBQUU7QUFDUixlQUFXLEVBQUUsZ0JBQWdCLENBQUMsWUFBWTtHQUMzQztDQUNGLENBQUMiLCJmaWxlIjoiU2VydmVyQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuL1JlbW90ZUNvbm5lY3Rpb24nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgQ2xpZW50Q29tcG9uZW50IGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZWZyYW1ld29yay9DbGllbnRDb21wb25lbnQnO1xuaW1wb3J0IHtsb2FkU2VydmljZXNDb25maWd9IGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZWZyYW1ld29yay9jb25maWcnO1xuaW1wb3J0IHtnZXRQcm94eX0gZnJvbSAnLi4vLi4vc2VydmljZS1wYXJzZXInO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlZnJhbWV3b3JrJztcbmltcG9ydCB7c2V0Q29ubmVjdGlvbkNvbmZpZ30gZnJvbSAnLi9SZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbk1hbmFnZXInO1xuaW1wb3J0IHtDb25uZWN0aW9uSGVhbHRoTm90aWZpZXJ9IGZyb20gJy4vQ29ubmVjdGlvbkhlYWx0aE5vdGlmaWVyJztcblxuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VSZW1vdGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCBOdWNsaWRlU29ja2V0IGZyb20gJy4uLy4uL3NlcnZlci9saWIvTnVjbGlkZVNvY2tldCc7XG5pbXBvcnQge2dldFZlcnNpb259IGZyb20gJy4uLy4uL3ZlcnNpb24nO1xuXG5jb25zdCBuZXdTZXJ2aWNlcyA9IFNlcnZpY2VGcmFtZXdvcmsubG9hZFNlcnZpY2VzQ29uZmlnKCk7XG5cbmV4cG9ydCB0eXBlIFNlcnZlckNvbm5lY3Rpb25Db25maWd1cmF0aW9uID0ge1xuICBob3N0OiBzdHJpbmc7IC8vIGhvc3QgbnVjbGlkZSBzZXJ2ZXIgaXMgcnVubmluZyBvbi5cbiAgcG9ydDogbnVtYmVyOyAvLyBwb3J0IHRvIGNvbm5lY3QgdG8uXG4gIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNlcnRpZmljYXRlIG9mIGNlcnRpZmljYXRlIGF1dGhvcml0eS5cbiAgY2xpZW50Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNsaWVudCBjZXJ0aWZpY2F0ZSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbiAgY2xpZW50S2V5PzogQnVmZmVyOyAvLyBrZXkgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG59O1xuXG5jb25zdCBfZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4vLyBTZXJ2ZXJDb25uZWN0aW9uIHJlcHJlc2VudHMgdGhlIGNsaWVudCBzaWRlIG9mIGEgY29ubmVjdGlvbiB0byBhIHJlbW90ZSBtYWNoaW5lLlxuLy8gVGhlcmUgY2FuIGJlIGF0IG1vc3Qgb25lIGNvbm5lY3Rpb24gdG8gYSBnaXZlbiByZW1vdGUgbWFjaGluZSBhdCBhIHRpbWUuIENsaWVudHMgc2hvdWxkXG4vLyBnZXQgYSBTZXJ2ZXJDb25uZWN0aW9uIHZpYSBTZXJ2ZXJDb25uZWN0aW9uLmdldE9yQ3JlYXRlKCkgYW5kIHNob3VsZCBuZXZlciBjYWxsIHRoZVxuLy8gY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsdGVybmF0ZWx5IGV4aXN0aW5nIGNvbm5lY3Rpb25zIGNhbiBiZSBxdWVyaWVkIHdpdGggZ2V0QnlIb3N0bmFtZSgpLlxuLy9cbi8vIGdldFNlcnZpY2UoKSByZXR1cm5zIHR5cGVkIFJQQyBzZXJ2aWNlcyB2aWEgdGhlIHNlcnZpY2UgZnJhbWV3b3JrLlxuLy9cbi8vIEEgU2VydmVyQ29ubmVjdGlvbiBrZWVwcyBhIGxpc3Qgb2YgUmVtb3RlQ29ubmVjdGlvbnMgLSBvbmUgZm9yIGVhY2ggb3BlbiBkaXJlY3Rvcnkgb24gdGhlIHJlbW90ZVxuLy8gbWFjaGluZS4gT25jZSBhbGwgUmVtb3RlQ29ubmVjdGlvbnMgaGF2ZSBiZWVuIGNsb3NlZCwgdGhlbiB0aGUgU2VydmVyQ29ubmVjdGlvbiB3aWxsIGNsb3NlLlxuY2xhc3MgU2VydmVyQ29ubmVjdGlvbiB7XG4gIF9jb25maWc6IFNlcnZlckNvbm5lY3Rpb25Db25maWd1cmF0aW9uO1xuICBfY2xvc2VkOiBib29sZWFuO1xuICBfaGVhbHRoTm90aWZpZXI6ID9Db25uZWN0aW9uSGVhbHRoTm90aWZpZXI7XG4gIF9jbGllbnQ6ID9DbGllbnRDb21wb25lbnQ7XG4gIF9jb25uZWN0aW9uczogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj47XG5cbiAgc3RhdGljIF9jb25uZWN0aW9uczogTWFwPHN0cmluZywgU2VydmVyQ29ubmVjdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgc3RhdGljIGFzeW5jIGdldE9yQ3JlYXRlKGNvbmZpZzogU2VydmVyQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pOiBQcm9taXNlPFNlcnZlckNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb24gPSBTZXJ2ZXJDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoY29uZmlnLmhvc3QpO1xuICAgIGlmIChleGlzdGluZ0Nvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGV4aXN0aW5nQ29ubmVjdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdDb25uZWN0aW9uID0gbmV3IFNlcnZlckNvbm5lY3Rpb24oY29uZmlnKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgbmV3Q29ubmVjdGlvbi5pbml0aWFsaXplKCk7XG4gICAgICByZXR1cm4gbmV3Q29ubmVjdGlvbjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBuZXdDb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8vIERvIE5PVCBjYWxsIHRoaXMgZnJvbSBvdXRzaWRlIHRoaXMgY2xhc3MuIFVzZSBTZXJ2ZXJDb25uZWN0aW9uLmdldE9yQ3JlYXRlKCkgaW5zdGVhZC5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBTZXJ2ZXJDb25uZWN0aW9uQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9jbG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9oZWFsdGhOb3RpZmllciA9IG51bGw7XG4gICAgdGhpcy5fY2xpZW50ID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0aW9ucyA9IFtdO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faGVhbHRoTm90aWZpZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5faGVhbHRoTm90aWZpZXIuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBfY3JlYXRlSW5zZWN1cmVDb25uZWN0aW9uRm9yVGVzdGluZyhcbiAgICBjd2Q6IHN0cmluZyxcbiAgICBwb3J0OiBudW1iZXIsXG4gICk6IFByb21pc2U8P1NlcnZlckNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgIHBvcnQsXG4gICAgICBjd2QsXG4gICAgfTtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFNlcnZlckNvbm5lY3Rpb24oY29uZmlnKTtcbiAgICBhd2FpdCBjb25uZWN0aW9uLmluaXRpYWxpemUoKTtcbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxuXG4gIF9tb25pdG9yQ29ubmVjdGlvbkhlYXJ0YmVhdCgpIHtcbiAgICBpbnZhcmlhbnQodGhpcy5faGVhbHRoTm90aWZpZXIgPT0gbnVsbCk7XG4gICAgdGhpcy5faGVhbHRoTm90aWZpZXIgPSBuZXcgQ29ubmVjdGlvbkhlYWx0aE5vdGlmaWVyKHRoaXMuX2NvbmZpZy5ob3N0LCB0aGlzLmdldFNvY2tldCgpKTtcbiAgfVxuXG4gIGdldFVyaU9mUmVtb3RlUGF0aChyZW1vdGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbnVjbGlkZTovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9JHtyZW1vdGVQYXRofWA7XG4gIH1cblxuICBnZXRQYXRoT2ZVcmkodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXJzZVJlbW90ZVVyaSh1cmkpLnBhdGg7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3N0YXJ0UnBjKCk7XG4gICAgY29uc3QgY2xpZW50ID0gdGhpcy5nZXRDbGllbnQoKTtcblxuICAgIC8vIFRlc3QgY29ubmVjdGlvbiBmaXJzdC4gRmlyc3QgdGltZSB3ZSBnZXQgaGVyZSB3ZSdyZSBjaGVja2luZyB0byByZWVzdGFibGlzaFxuICAgIC8vIGNvbm5lY3Rpb24gdXNpbmcgY2FjaGVkIGNyZWRlbnRpYWxzLiBUaGlzIHdpbGwgZmFpbCBmYXN0IChmYXN0ZXIgdGhhbiBpbmZvU2VydmljZSlcbiAgICAvLyB3aGVuIHdlIGRvbid0IGhhdmUgY2FjaGVkIGNyZWRlbnRpYWxzIHlldC5cbiAgICBhd2FpdCBjbGllbnQudGVzdENvbm5lY3Rpb24oKTtcblxuICAgIC8vIERvIHZlcnNpb24gY2hlY2suXG4gICAgY29uc3QgaW5mb1NlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoJ0luZm9TZXJ2aWNlJyk7XG4gICAgY29uc3Qgc2VydmVyVmVyc2lvbiA9IGF3YWl0IGluZm9TZXJ2aWNlLmdldFNlcnZlclZlcnNpb24oKTtcblxuICAgIGNvbnN0IGNsaWVudFZlcnNpb24gPSBnZXRWZXJzaW9uKCk7XG4gICAgaWYgKGNsaWVudFZlcnNpb24gIT09IHNlcnZlclZlcnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFZlcnNpb24gbWlzbWF0Y2guIENsaWVudCBhdCAke2NsaWVudFZlcnNpb259IHdoaWxlIHNlcnZlciBhdCAke3NlcnZlclZlcnNpb259LmApO1xuICAgIH1cblxuICAgIHRoaXMuX21vbml0b3JDb25uZWN0aW9uSGVhcnRiZWF0KCk7XG5cbiAgICBTZXJ2ZXJDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5zZXQodGhpcy5nZXRSZW1vdGVIb3N0bmFtZSgpLCB0aGlzKTtcbiAgICBzZXRDb25uZWN0aW9uQ29uZmlnKHRoaXMuX2NvbmZpZyk7XG4gICAgX2VtaXR0ZXIuZW1pdCgnZGlkLWFkZCcsIHRoaXMpO1xuICB9XG5cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nsb3NlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZ1dHVyZSBnZXRDbGllbnQgY2FsbHMgc2hvdWxkIGZhaWwsIGlmIGl0IGhhcyBhIGNhY2hlZCBTZXJ2ZXJDb25uZWN0aW9uIGluc3RhbmNlLlxuICAgIHRoaXMuX2Nsb3NlZCA9IHRydWU7XG5cbiAgICAvLyBUaGUgUnBjIGNoYW5uZWwgb3ducyB0aGUgc29ja2V0LlxuICAgIGlmICh0aGlzLl9jbGllbnQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2xpZW50LmNsb3NlKCk7XG4gICAgICB0aGlzLl9jbGllbnQgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIF9jb25uZWN0aW9ucyB0byBub3QgYmUgY29uc2lkZXJlZCBpbiBmdXR1cmUgY29ubmVjdGlvbiBxdWVyaWVzLlxuICAgIGlmIChTZXJ2ZXJDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5kZWxldGUodGhpcy5nZXRSZW1vdGVIb3N0bmFtZSgpKSkge1xuICAgICAgX2VtaXR0ZXIuZW1pdCgnZGlkLWNsb3NlJywgdGhpcyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q2xpZW50KCk6IENsaWVudENvbXBvbmVudCB7XG4gICAgaW52YXJpYW50KCF0aGlzLl9jbG9zZWQgJiYgdGhpcy5fY2xpZW50ICE9IG51bGwsICdTZXJ2ZXIgY29ubmVjdGlvbiBoYXMgYmVlbiBjbG9zZWQuJyk7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudDtcbiAgfVxuXG4gIF9zdGFydFJwYygpOiB2b2lkIHtcbiAgICBsZXQgdXJpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICAgIC8vIFVzZSBodHRwcyBpZiB3ZSBoYXZlIGtleSwgY2VydCwgYW5kIGNhXG4gICAgaWYgKHRoaXMuX2lzU2VjdXJlKCkpIHtcbiAgICAgIG9wdGlvbnMuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSA9IHRoaXMuX2NvbmZpZy5jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlO1xuICAgICAgb3B0aW9ucy5jbGllbnRDZXJ0aWZpY2F0ZSA9IHRoaXMuX2NvbmZpZy5jbGllbnRDZXJ0aWZpY2F0ZTtcbiAgICAgIG9wdGlvbnMuY2xpZW50S2V5ID0gdGhpcy5fY29uZmlnLmNsaWVudEtleTtcbiAgICAgIHVyaSA9IGBodHRwczovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdXJpID0gYGh0dHA6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfWA7XG4gICAgfVxuXG4gICAgY29uc3Qgc29ja2V0ID0gbmV3IE51Y2xpZGVTb2NrZXQodXJpLCBvcHRpb25zKTtcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50Q29tcG9uZW50KHNvY2tldCwgbG9hZFNlcnZpY2VzQ29uZmlnKCkpO1xuXG4gICAgLy8gUmVnaXN0ZXIgTnVjbGlkZVVyaSB0eXBlIGNvbnZlcnNpb25zLlxuICAgIGNsaWVudC5yZWdpc3RlclR5cGUoJ051Y2xpZGVVcmknLFxuICAgICAgcmVtb3RlVXJpID0+IHRoaXMuZ2V0UGF0aE9mVXJpKHJlbW90ZVVyaSksIHBhdGggPT4gdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgocGF0aCkpO1xuXG4gICAgdGhpcy5fY2xpZW50ID0gY2xpZW50O1xuICB9XG5cbiAgX2lzU2VjdXJlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShcbiAgICAgICAgdGhpcy5fY29uZmlnLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY29uZmlnLmNsaWVudENlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NvbmZpZy5jbGllbnRLZXlcbiAgICApO1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLl9jb25maWcuaG9zdH06JHt0aGlzLl9jb25maWcucG9ydH1gO1xuICB9XG5cbiAgZ2V0UG9ydCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcucG9ydDtcbiAgfVxuXG4gIGdldFJlbW90ZUhvc3RuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5ob3N0O1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IFNlcnZlckNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9XG5cbiAgYWRkQ29ubmVjdGlvbihjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMucHVzaChjb25uZWN0aW9uKTtcbiAgfVxuXG4gIHJlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9jb25uZWN0aW9ucy5pbmRleE9mKGNvbm5lY3Rpb24pICE9PSAtMSxcbiAgICAgICdBdHRlbXB0IHRvIHJlbW92ZSBhIG5vbi1leGlzdGVudCBSZW1vdGVDb25uZWN0aW9uJyk7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMuc3BsaWNlKHRoaXMuX2Nvbm5lY3Rpb25zLmluZGV4T2YoY29ubmVjdGlvbiksIDEpO1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgb25EaWRBZGRTZXJ2ZXJDb25uZWN0aW9uKGhhbmRsZXI6IChjb25uZWN0aW9uOiBTZXJ2ZXJDb25uZWN0aW9uKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgX2VtaXR0ZXIub24oJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBvbkRpZENsb3NlU2VydmVyQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogU2VydmVyQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1jbG9zZScsIGhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGdldEJ5SG9zdG5hbWUoaG9zdG5hbWU6IHN0cmluZyk6ID9TZXJ2ZXJDb25uZWN0aW9uIHtcbiAgICByZXR1cm4gU2VydmVyQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuZ2V0KGhvc3RuYW1lKTtcbiAgfVxuXG4gIGdldENvbm5lY3Rpb25zKCk6IEFycmF5PFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbnM7XG4gIH1cblxuICBnZXRTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIGNvbnN0IFtzZXJ2aWNlQ29uZmlnXSA9IG5ld1NlcnZpY2VzLmZpbHRlcihjb25maWcgPT4gY29uZmlnLm5hbWUgPT09IHNlcnZpY2VOYW1lKTtcbiAgICBpbnZhcmlhbnQoc2VydmljZUNvbmZpZyAhPSBudWxsLCBgTm8gY29uZmlnIGZvdW5kIGZvciBzZXJ2aWNlICR7c2VydmljZU5hbWV9YCk7XG4gICAgcmV0dXJuIGdldFByb3h5KHNlcnZpY2VDb25maWcubmFtZSwgc2VydmljZUNvbmZpZy5kZWZpbml0aW9uLCB0aGlzLmdldENsaWVudCgpKTtcbiAgfVxuXG4gIGdldFNvY2tldCgpOiBOdWNsaWRlU29ja2V0IHtcbiAgICByZXR1cm4gdGhpcy5nZXRDbGllbnQoKS5nZXRTb2NrZXQoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgU2VydmVyQ29ubmVjdGlvbixcbiAgX190ZXN0X186IHtcbiAgICBjb25uZWN0aW9uczogU2VydmVyQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMsXG4gIH0sXG59O1xuIl19