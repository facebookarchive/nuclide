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

var _nuclideServerLibServiceframeworkClientComponent = require('../../nuclide-server/lib/serviceframework/ClientComponent');

var _nuclideServerLibServiceframeworkClientComponent2 = _interopRequireDefault(_nuclideServerLibServiceframeworkClientComponent);

var _nuclideServerLibServiceframeworkConfig = require('../../nuclide-server/lib/serviceframework/config');

var _nuclideServiceParser = require('../../nuclide-service-parser');

var _nuclideServerLibServiceframeworkIndex = require('../../nuclide-server/lib/serviceframework/index');

var _nuclideServerLibServiceframeworkIndex2 = _interopRequireDefault(_nuclideServerLibServiceframeworkIndex);

var _RemoteConnectionConfigurationManager = require('./RemoteConnectionConfigurationManager');

var _ConnectionHealthNotifier = require('./ConnectionHealthNotifier');

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

      var socket = new _nuclideServerLibNuclideSocket2['default'](uri, options);
      var client = new _nuclideServerLibServiceframeworkClientComponent2['default'](socket, (0, _nuclideServerLibServiceframeworkConfig.loadServicesConfig)());

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
      return (0, _nuclideServiceParser.getProxy)(serviceConfig.name, serviceConfig.definition, this.getClient());
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
//# sourceMappingURL=data:application/json;base64,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O09BQ0osQ0FBQztBQUNGLFVBQU0sVUFBVSxHQUFHLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEQsWUFBTSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDOUIsYUFBTyxVQUFVLENBQUM7S0FDbkI7OztXQStIOEIsa0NBQUMsT0FBK0MsRUFBYztBQUMzRixjQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQyxhQUFPLHFCQUFlLFlBQU07QUFDMUIsZ0JBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQzdDLENBQUMsQ0FBQztLQUNKOzs7V0FFZ0Msb0NBQUMsT0FBK0MsRUFBYztBQUM3RixjQUFRLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNsQyxhQUFPLHFCQUFlLFlBQU07QUFDMUIsZ0JBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQy9DLENBQUMsQ0FBQztLQUNKOzs7V0FFbUIsdUJBQUMsUUFBZ0IsRUFBcUI7QUFDeEQsYUFBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3BEOzs7U0FuTUcsZ0JBQWdCOzs7QUFvTnRCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLFVBQVEsRUFBRTtBQUNSLGVBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxZQUFZO0dBQzNDO0NBQ0YsQ0FBQyIsImZpbGUiOiJTZXJ2ZXJDb25uZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBDbGllbnRDb21wb25lbnQgZnJvbSAnLi4vLi4vbnVjbGlkZS1zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvQ2xpZW50Q29tcG9uZW50JztcbmltcG9ydCB7bG9hZFNlcnZpY2VzQ29uZmlnfSBmcm9tICcuLi8uLi9udWNsaWRlLXNlcnZlci9saWIvc2VydmljZWZyYW1ld29yay9jb25maWcnO1xuaW1wb3J0IHtnZXRQcm94eX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLXBhcnNlcic7XG5pbXBvcnQgU2VydmljZUZyYW1ld29yayBmcm9tICcuLi8uLi9udWNsaWRlLXNlcnZlci9saWIvc2VydmljZWZyYW1ld29yay9pbmRleCc7XG5pbXBvcnQge3NldENvbm5lY3Rpb25Db25maWd9IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb25NYW5hZ2VyJztcbmltcG9ydCB7Q29ubmVjdGlvbkhlYWx0aE5vdGlmaWVyfSBmcm9tICcuL0Nvbm5lY3Rpb25IZWFsdGhOb3RpZmllcic7XG5cbmltcG9ydCB7RGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlUmVtb3RlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCBOdWNsaWRlU29ja2V0IGZyb20gJy4uLy4uL251Y2xpZGUtc2VydmVyL2xpYi9OdWNsaWRlU29ja2V0JztcbmltcG9ydCB7Z2V0VmVyc2lvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS12ZXJzaW9uJztcblxuY29uc3QgbmV3U2VydmljZXMgPSBTZXJ2aWNlRnJhbWV3b3JrLmxvYWRTZXJ2aWNlc0NvbmZpZygpO1xuXG5leHBvcnQgdHlwZSBTZXJ2ZXJDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nOyAvLyBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb24uXG4gIHBvcnQ6IG51bWJlcjsgLy8gcG9ydCB0byBjb25uZWN0IHRvLlxuICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlPzogQnVmZmVyOyAvLyBjZXJ0aWZpY2F0ZSBvZiBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXG4gIGNsaWVudENlcnRpZmljYXRlPzogQnVmZmVyOyAvLyBjbGllbnQgY2VydGlmaWNhdGUgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG4gIGNsaWVudEtleT86IEJ1ZmZlcjsgLy8ga2V5IGZvciBodHRwcyBjb25uZWN0aW9uLlxufTtcblxuY29uc3QgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuLy8gU2VydmVyQ29ubmVjdGlvbiByZXByZXNlbnRzIHRoZSBjbGllbnQgc2lkZSBvZiBhIGNvbm5lY3Rpb24gdG8gYSByZW1vdGUgbWFjaGluZS5cbi8vIFRoZXJlIGNhbiBiZSBhdCBtb3N0IG9uZSBjb25uZWN0aW9uIHRvIGEgZ2l2ZW4gcmVtb3RlIG1hY2hpbmUgYXQgYSB0aW1lLiBDbGllbnRzIHNob3VsZFxuLy8gZ2V0IGEgU2VydmVyQ29ubmVjdGlvbiB2aWEgU2VydmVyQ29ubmVjdGlvbi5nZXRPckNyZWF0ZSgpIGFuZCBzaG91bGQgbmV2ZXIgY2FsbCB0aGVcbi8vIGNvbnN0cnVjdG9yIGRpcmVjdGx5LiBBbHRlcm5hdGVseSBleGlzdGluZyBjb25uZWN0aW9ucyBjYW4gYmUgcXVlcmllZCB3aXRoIGdldEJ5SG9zdG5hbWUoKS5cbi8vXG4vLyBnZXRTZXJ2aWNlKCkgcmV0dXJucyB0eXBlZCBSUEMgc2VydmljZXMgdmlhIHRoZSBzZXJ2aWNlIGZyYW1ld29yay5cbi8vXG4vLyBBIFNlcnZlckNvbm5lY3Rpb24ga2VlcHMgYSBsaXN0IG9mIFJlbW90ZUNvbm5lY3Rpb25zIC0gb25lIGZvciBlYWNoIG9wZW4gZGlyZWN0b3J5IG9uIHRoZSByZW1vdGVcbi8vIG1hY2hpbmUuIE9uY2UgYWxsIFJlbW90ZUNvbm5lY3Rpb25zIGhhdmUgYmVlbiBjbG9zZWQsIHRoZW4gdGhlIFNlcnZlckNvbm5lY3Rpb24gd2lsbCBjbG9zZS5cbmNsYXNzIFNlcnZlckNvbm5lY3Rpb24ge1xuICBfY29uZmlnOiBTZXJ2ZXJDb25uZWN0aW9uQ29uZmlndXJhdGlvbjtcbiAgX2Nsb3NlZDogYm9vbGVhbjtcbiAgX2hlYWx0aE5vdGlmaWVyOiA/Q29ubmVjdGlvbkhlYWx0aE5vdGlmaWVyO1xuICBfY2xpZW50OiA/Q2xpZW50Q29tcG9uZW50O1xuICBfY29ubmVjdGlvbnM6IEFycmF5PFJlbW90ZUNvbm5lY3Rpb24+O1xuXG4gIHN0YXRpYyBfY29ubmVjdGlvbnM6IE1hcDxzdHJpbmcsIFNlcnZlckNvbm5lY3Rpb24+ID0gbmV3IE1hcCgpO1xuXG4gIHN0YXRpYyBhc3luYyBnZXRPckNyZWF0ZShjb25maWc6IFNlcnZlckNvbm5lY3Rpb25Db25maWd1cmF0aW9uKTogUHJvbWlzZTxTZXJ2ZXJDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgZXhpc3RpbmdDb25uZWN0aW9uID0gU2VydmVyQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lKGNvbmZpZy5ob3N0KTtcbiAgICBpZiAoZXhpc3RpbmdDb25uZWN0aW9uICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBleGlzdGluZ0Nvbm5lY3Rpb247XG4gICAgfVxuXG4gICAgY29uc3QgbmV3Q29ubmVjdGlvbiA9IG5ldyBTZXJ2ZXJDb25uZWN0aW9uKGNvbmZpZyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG5ld0Nvbm5lY3Rpb24uaW5pdGlhbGl6ZSgpO1xuICAgICAgcmV0dXJuIG5ld0Nvbm5lY3Rpb247XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbmV3Q29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvLyBEbyBOT1QgY2FsbCB0aGlzIGZyb20gb3V0c2lkZSB0aGlzIGNsYXNzLiBVc2UgU2VydmVyQ29ubmVjdGlvbi5nZXRPckNyZWF0ZSgpIGluc3RlYWQuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogU2VydmVyQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fY2xvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5faGVhbHRoTm90aWZpZXIgPSBudWxsO1xuICAgIHRoaXMuX2NsaWVudCA9IG51bGw7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMgPSBbXTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2hlYWx0aE5vdGlmaWVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2hlYWx0aE5vdGlmaWVyLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgX2NyZWF0ZUluc2VjdXJlQ29ubmVjdGlvbkZvclRlc3RpbmcoXG4gICAgY3dkOiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICApOiBQcm9taXNlPD9TZXJ2ZXJDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICBwb3J0LFxuICAgICAgY3dkLFxuICAgIH07XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IG5ldyBTZXJ2ZXJDb25uZWN0aW9uKGNvbmZpZyk7XG4gICAgYXdhaXQgY29ubmVjdGlvbi5pbml0aWFsaXplKCk7XG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICBfbW9uaXRvckNvbm5lY3Rpb25IZWFydGJlYXQoKSB7XG4gICAgaW52YXJpYW50KHRoaXMuX2hlYWx0aE5vdGlmaWVyID09IG51bGwpO1xuICAgIHRoaXMuX2hlYWx0aE5vdGlmaWVyID0gbmV3IENvbm5lY3Rpb25IZWFsdGhOb3RpZmllcih0aGlzLl9jb25maWcuaG9zdCwgdGhpcy5nZXRTb2NrZXQoKSk7XG4gIH1cblxuICBnZXRVcmlPZlJlbW90ZVBhdGgocmVtb3RlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG51Y2xpZGU6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfSR7cmVtb3RlUGF0aH1gO1xuICB9XG5cbiAgZ2V0UGF0aE9mVXJpKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGFyc2VSZW1vdGVVcmkodXJpKS5wYXRoO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zdGFydFJwYygpO1xuICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuZ2V0Q2xpZW50KCk7XG5cbiAgICAvLyBUZXN0IGNvbm5lY3Rpb24gZmlyc3QuIEZpcnN0IHRpbWUgd2UgZ2V0IGhlcmUgd2UncmUgY2hlY2tpbmcgdG8gcmVlc3RhYmxpc2hcbiAgICAvLyBjb25uZWN0aW9uIHVzaW5nIGNhY2hlZCBjcmVkZW50aWFscy4gVGhpcyB3aWxsIGZhaWwgZmFzdCAoZmFzdGVyIHRoYW4gaW5mb1NlcnZpY2UpXG4gICAgLy8gd2hlbiB3ZSBkb24ndCBoYXZlIGNhY2hlZCBjcmVkZW50aWFscyB5ZXQuXG4gICAgYXdhaXQgY2xpZW50LnRlc3RDb25uZWN0aW9uKCk7XG5cbiAgICAvLyBEbyB2ZXJzaW9uIGNoZWNrLlxuICAgIGNvbnN0IGluZm9TZXJ2aWNlID0gdGhpcy5nZXRTZXJ2aWNlKCdJbmZvU2VydmljZScpO1xuICAgIGNvbnN0IHNlcnZlclZlcnNpb24gPSBhd2FpdCBpbmZvU2VydmljZS5nZXRTZXJ2ZXJWZXJzaW9uKCk7XG5cbiAgICBjb25zdCBjbGllbnRWZXJzaW9uID0gZ2V0VmVyc2lvbigpO1xuICAgIGlmIChjbGllbnRWZXJzaW9uICE9PSBzZXJ2ZXJWZXJzaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBWZXJzaW9uIG1pc21hdGNoLiBDbGllbnQgYXQgJHtjbGllbnRWZXJzaW9ufSB3aGlsZSBzZXJ2ZXIgYXQgJHtzZXJ2ZXJWZXJzaW9ufS5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb25pdG9yQ29ubmVjdGlvbkhlYXJ0YmVhdCgpO1xuXG4gICAgU2VydmVyQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuc2V0KHRoaXMuZ2V0UmVtb3RlSG9zdG5hbWUoKSwgdGhpcyk7XG4gICAgc2V0Q29ubmVjdGlvbkNvbmZpZyh0aGlzLl9jb25maWcpO1xuICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1hZGQnLCB0aGlzKTtcbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jbG9zZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGdXR1cmUgZ2V0Q2xpZW50IGNhbGxzIHNob3VsZCBmYWlsLCBpZiBpdCBoYXMgYSBjYWNoZWQgU2VydmVyQ29ubmVjdGlvbiBpbnN0YW5jZS5cbiAgICB0aGlzLl9jbG9zZWQgPSB0cnVlO1xuXG4gICAgLy8gVGhlIFJwYyBjaGFubmVsIG93bnMgdGhlIHNvY2tldC5cbiAgICBpZiAodGhpcy5fY2xpZW50ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2NsaWVudC5jbG9zZSgpO1xuICAgICAgdGhpcy5fY2xpZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSBfY29ubmVjdGlvbnMgdG8gbm90IGJlIGNvbnNpZGVyZWQgaW4gZnV0dXJlIGNvbm5lY3Rpb24gcXVlcmllcy5cbiAgICBpZiAoU2VydmVyQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuZGVsZXRlKHRoaXMuZ2V0UmVtb3RlSG9zdG5hbWUoKSkpIHtcbiAgICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1jbG9zZScsIHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldENsaWVudCgpOiBDbGllbnRDb21wb25lbnQge1xuICAgIGludmFyaWFudCghdGhpcy5fY2xvc2VkICYmIHRoaXMuX2NsaWVudCAhPSBudWxsLCAnU2VydmVyIGNvbm5lY3Rpb24gaGFzIGJlZW4gY2xvc2VkLicpO1xuICAgIHJldHVybiB0aGlzLl9jbGllbnQ7XG4gIH1cblxuICBfc3RhcnRScGMoKTogdm9pZCB7XG4gICAgbGV0IHVyaTtcbiAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICAvLyBVc2UgaHR0cHMgaWYgd2UgaGF2ZSBrZXksIGNlcnQsIGFuZCBjYVxuICAgIGlmICh0aGlzLl9pc1NlY3VyZSgpKSB7XG4gICAgICBvcHRpb25zLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgPSB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTtcbiAgICAgIG9wdGlvbnMuY2xpZW50Q2VydGlmaWNhdGUgPSB0aGlzLl9jb25maWcuY2xpZW50Q2VydGlmaWNhdGU7XG4gICAgICBvcHRpb25zLmNsaWVudEtleSA9IHRoaXMuX2NvbmZpZy5jbGllbnRLZXk7XG4gICAgICB1cmkgPSBgaHR0cHM6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVyaSA9IGBodHRwOi8vJHt0aGlzLmdldFJlbW90ZUhvc3QoKX1gO1xuICAgIH1cblxuICAgIGNvbnN0IHNvY2tldCA9IG5ldyBOdWNsaWRlU29ja2V0KHVyaSwgb3B0aW9ucyk7XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudENvbXBvbmVudChzb2NrZXQsIGxvYWRTZXJ2aWNlc0NvbmZpZygpKTtcblxuICAgIC8vIFJlZ2lzdGVyIE51Y2xpZGVVcmkgdHlwZSBjb252ZXJzaW9ucy5cbiAgICBjbGllbnQucmVnaXN0ZXJUeXBlKCdOdWNsaWRlVXJpJyxcbiAgICAgIHJlbW90ZVVyaSA9PiB0aGlzLmdldFBhdGhPZlVyaShyZW1vdGVVcmkpLCBwYXRoID0+IHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHBhdGgpKTtcblxuICAgIHRoaXMuX2NsaWVudCA9IGNsaWVudDtcbiAgfVxuXG4gIF9pc1NlY3VyZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEoXG4gICAgICAgIHRoaXMuX2NvbmZpZy5jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NvbmZpZy5jbGllbnRDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jb25maWcuY2xpZW50S2V5XG4gICAgKTtcbiAgfVxuXG4gIGdldFJlbW90ZUhvc3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fY29uZmlnLmhvc3R9OiR7dGhpcy5fY29uZmlnLnBvcnR9YDtcbiAgfVxuXG4gIGdldFBvcnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLnBvcnQ7XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0bmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcuaG9zdDtcbiAgfVxuXG4gIGdldENvbmZpZygpOiBTZXJ2ZXJDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgfVxuXG4gIGFkZENvbm5lY3Rpb24oY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLnB1c2goY29ubmVjdGlvbik7XG4gIH1cblxuICByZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fY29ubmVjdGlvbnMuaW5kZXhPZihjb25uZWN0aW9uKSAhPT0gLTEsXG4gICAgICAnQXR0ZW1wdCB0byByZW1vdmUgYSBub24tZXhpc3RlbnQgUmVtb3RlQ29ubmVjdGlvbicpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLnNwbGljZSh0aGlzLl9jb25uZWN0aW9ucy5pbmRleE9mKGNvbm5lY3Rpb24pLCAxKTtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG9uRGlkQWRkU2VydmVyQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogU2VydmVyQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgb25EaWRDbG9zZVNlcnZlckNvbm5lY3Rpb24oaGFuZGxlcjogKGNvbm5lY3Rpb246IFNlcnZlckNvbm5lY3Rpb24pID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBfZW1pdHRlci5vbignZGlkLWNsb3NlJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRCeUhvc3RuYW1lKGhvc3RuYW1lOiBzdHJpbmcpOiA/U2VydmVyQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIFNlcnZlckNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmdldChob3N0bmFtZSk7XG4gIH1cblxuICBnZXRDb25uZWN0aW9ucygpOiBBcnJheTxSZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb25zO1xuICB9XG5cbiAgZ2V0U2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBbc2VydmljZUNvbmZpZ10gPSBuZXdTZXJ2aWNlcy5maWx0ZXIoY29uZmlnID0+IGNvbmZpZy5uYW1lID09PSBzZXJ2aWNlTmFtZSk7XG4gICAgaW52YXJpYW50KHNlcnZpY2VDb25maWcgIT0gbnVsbCwgYE5vIGNvbmZpZyBmb3VuZCBmb3Igc2VydmljZSAke3NlcnZpY2VOYW1lfWApO1xuICAgIHJldHVybiBnZXRQcm94eShzZXJ2aWNlQ29uZmlnLm5hbWUsIHNlcnZpY2VDb25maWcuZGVmaW5pdGlvbiwgdGhpcy5nZXRDbGllbnQoKSk7XG4gIH1cblxuICBnZXRTb2NrZXQoKTogTnVjbGlkZVNvY2tldCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xpZW50KCkuZ2V0U29ja2V0KCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFNlcnZlckNvbm5lY3Rpb24sXG4gIF9fdGVzdF9fOiB7XG4gICAgY29ubmVjdGlvbnM6IFNlcnZlckNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLFxuICB9LFxufTtcbiJdfQ==