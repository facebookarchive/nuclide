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

var _analytics = require('../../analytics');

var _serverLibServiceframeworkClientComponent = require('../../server/lib/serviceframework/ClientComponent');

var _serverLibServiceframeworkClientComponent2 = _interopRequireDefault(_serverLibServiceframeworkClientComponent);

var _serverLibServiceframeworkConfig = require('../../server/lib/serviceframework/config');

var _serviceParser = require('../../service-parser');

var _serverLibServiceframework = require('../../server/lib/serviceframework');

var _serverLibServiceframework2 = _interopRequireDefault(_serverLibServiceframework);

var _RemoteConnectionConfigurationManager = require('./RemoteConnectionConfigurationManager');

var _atom = require('atom');

var _remoteUri = require('../../remote-uri');

var _logging = require('../../logging');

var _events = require('events');

var _serverLibNuclideSocket = require('../../server/lib/NuclideSocket');

var _serverLibNuclideSocket2 = _interopRequireDefault(_serverLibNuclideSocket);

var _version = require('../../version');

var logger = (0, _logging.getLogger)();
var newServices = _serverLibServiceframework2['default'].loadServicesConfig();

var HEARTBEAT_AWAY_REPORT_COUNT = 3;
var HEARTBEAT_NOTIFICATION_ERROR = 1;
var HEARTBEAT_NOTIFICATION_WARNING = 2;

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
    this._subscriptions = new _atom.CompositeDisposable();
    this._heartbeatNetworkAwayCount = 0;
    this._lastHeartbeatNotification = null;
    this._client = null;
    this._connections = [];
  }

  _createClass(ServerConnection, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }, {
    key: '_monitorConnectionHeartbeat',
    value: function _monitorConnectionHeartbeat() {
      var _this = this;

      var socket = this.getSocket();
      var serverUri = socket.getServerUri();

      /**
       * Adds an Atom notification for the detected heartbeat network status
       * The function makes sure not to add many notifications for the same event and prioritize
       * new events.
       */
      var addHeartbeatNotification = function addHeartbeatNotification(type, errorCode, message, dismissable, askToReload) {
        var _ref = _this._lastHeartbeatNotification || {};

        var code = _ref.code;
        var existingNotification = _ref.notification;

        if (code && code === errorCode && dismissable) {
          // A dismissible heartbeat notification with this code is already active.
          return;
        }
        var notification = null;
        var options = { dismissable: dismissable, buttons: [] };
        if (askToReload) {
          options.buttons.push({
            className: 'icon icon-zap',
            onDidClick: function onDidClick() {
              atom.reload();
            },
            text: 'Reload Atom'
          });
        }
        switch (type) {
          case HEARTBEAT_NOTIFICATION_ERROR:
            notification = atom.notifications.addError(message, options);
            break;
          case HEARTBEAT_NOTIFICATION_WARNING:
            notification = atom.notifications.addWarning(message, options);
            break;
          default:
            throw new Error('Unrecongnized heartbeat notification type');
        }
        if (existingNotification) {
          existingNotification.dismiss();
        }
        (0, _assert2['default'])(notification);
        _this._lastHeartbeatNotification = {
          notification: notification,
          code: errorCode
        };
      };

      var onHeartbeat = function onHeartbeat() {
        if (_this._lastHeartbeatNotification) {
          // If there has been existing heartbeat error/warning,
          // that means connection has been lost and we shall show a message about connection
          // being restored without a reconnect prompt.
          var _notification = _this._lastHeartbeatNotification.notification;

          _notification.dismiss();
          atom.notifications.addSuccess('Connection restored to Nuclide Server at: ' + serverUri);
          _this._heartbeatNetworkAwayCount = 0;
          _this._lastHeartbeatNotification = null;
        }
      };

      var notifyNetworkAway = function notifyNetworkAway(code) {
        _this._heartbeatNetworkAwayCount++;
        if (_this._heartbeatNetworkAwayCount >= HEARTBEAT_AWAY_REPORT_COUNT) {
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_WARNING, code, 'Nuclide server can not be reached at "' + serverUri + '".<br/>' + 'Check your network connection.',
          /*dismissable*/true,
          /*askToReload*/false);
        }
      };

      var onHeartbeatError = function onHeartbeatError(error) {
        var code = error.code;
        var message = error.message;
        var originalCode = error.originalCode;

        (0, _analytics.trackEvent)({
          type: 'heartbeat-error',
          data: {
            code: code || '',
            message: message || '',
            host: _this._config.host
          }
        });
        logger.info('Heartbeat network error:', code, originalCode, message);
        switch (code) {
          case 'NETWORK_AWAY':
            // Notify switching networks, disconnected, timeout, unreachable server or fragile
            // connection.
            notifyNetworkAway(code);
            break;
          case 'SERVER_CRASHED':
            // Server shut down or port no longer accessible.
            // Notify the server was there, but now gone.
            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Nuclide Server Crashed**<br/>' + 'Please reload Atom to restore your remote project connection.',
            /*dismissable*/true,
            /*askToReload*/true);
            // TODO(most) reconnect ServerConnection, restore the current project state,
            // and finally change dismissable to false and type to 'WARNING'.
            break;
          case 'PORT_NOT_ACCESSIBLE':
            // Notify never heard a heartbeat from the server.

            var _parseRemoteUri = (0, _remoteUri.parse)(serverUri),
                port = _parseRemoteUri.port;

            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Nuclide Server Is Not Reachable**<br/>' + ('It could be running on a port that is not accessible: ' + port + '.'),
            /*dismissable*/true,
            /*askToReload*/false);
            break;
          case 'INVALID_CERTIFICATE':
            // Notify the client certificate is not accepted by nuclide server
            // (certificate mismatch).
            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Connection Reset Error**<br/>' + 'This could be caused by the client certificate mismatching the ' + 'server certificate.<br/>' + 'Please reload Atom to restore your remote project connection.',
            /*dismissable*/true,
            /*askToReload*/true);
            // TODO(most): reconnect ServerConnection, restore the current project state.
            // and finally change dismissable to false and type to 'WARNING'.
            break;
          default:
            notifyNetworkAway(code);
            logger.error('Unrecongnized heartbeat error code: ' + code, message);
            break;
        }
      };
      socket.on('heartbeat', onHeartbeat);
      socket.on('heartbeat.error', onHeartbeatError);

      this._subscriptions.add(new _atom.Disposable(function () {
        socket.removeListener('heartbeat', onHeartbeat);
        socket.removeListener('heartbeat.error', onHeartbeatError);
      }));
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

      var socket = new _serverLibNuclideSocket2['default'](uri, options);
      var client = new _serverLibServiceframeworkClientComponent2['default'](socket, (0, _serverLibServiceframeworkConfig.loadServicesConfig)());

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
//# sourceMappingURL=data:application/json;base64,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QixFQUFoQixnQkFBZ0I7QUFDaEIsVUFBUSxFQUFFO0FBQ1IsZUFBVyxFQUFFLGdCQUFnQixDQUFDLFlBQVk7R0FDM0M7Q0FDRixDQUFDIiwiZmlsZSI6IlNlcnZlckNvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi9SZW1vdGVDb25uZWN0aW9uJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja0V2ZW50fSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IENsaWVudENvbXBvbmVudCBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvQ2xpZW50Q29tcG9uZW50JztcbmltcG9ydCB7bG9hZFNlcnZpY2VzQ29uZmlnfSBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvY29uZmlnJztcbmltcG9ydCB7Z2V0UHJveHl9IGZyb20gJy4uLy4uL3NlcnZpY2UtcGFyc2VyJztcbmltcG9ydCBTZXJ2aWNlRnJhbWV3b3JrIGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZWZyYW1ld29yayc7XG5pbXBvcnQge3NldENvbm5lY3Rpb25Db25maWd9IGZyb20gJy4vUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb25NYW5hZ2VyJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VSZW1vdGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCBOdWNsaWRlU29ja2V0IGZyb20gJy4uLy4uL3NlcnZlci9saWIvTnVjbGlkZVNvY2tldCc7XG5pbXBvcnQge2dldFZlcnNpb259IGZyb20gJy4uLy4uL3ZlcnNpb24nO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IG5ld1NlcnZpY2VzID0gU2VydmljZUZyYW1ld29yay5sb2FkU2VydmljZXNDb25maWcoKTtcblxuY29uc3QgSEVBUlRCRUFUX0FXQVlfUkVQT1JUX0NPVU5UID0gMztcbmNvbnN0IEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IgPSAxO1xuY29uc3QgSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HID0gMjtcblxudHlwZSBIZWFydGJlYXROb3RpZmljYXRpb24gPSB7XG4gIG5vdGlmaWNhdGlvbjogYXRvbSROb3RpZmljYXRpb247XG4gIGNvZGU6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFNlcnZlckNvbm5lY3Rpb25Db25maWd1cmF0aW9uID0ge1xuICBob3N0OiBzdHJpbmc7IC8vIGhvc3QgbnVjbGlkZSBzZXJ2ZXIgaXMgcnVubmluZyBvbi5cbiAgcG9ydDogbnVtYmVyOyAvLyBwb3J0IHRvIGNvbm5lY3QgdG8uXG4gIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNlcnRpZmljYXRlIG9mIGNlcnRpZmljYXRlIGF1dGhvcml0eS5cbiAgY2xpZW50Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNsaWVudCBjZXJ0aWZpY2F0ZSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbiAgY2xpZW50S2V5PzogQnVmZmVyOyAvLyBrZXkgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG59O1xuXG5jb25zdCBfZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4vLyBTZXJ2ZXJDb25uZWN0aW9uIHJlcHJlc2VudHMgdGhlIGNsaWVudCBzaWRlIG9mIGEgY29ubmVjdGlvbiB0byBhIHJlbW90ZSBtYWNoaW5lLlxuLy8gVGhlcmUgY2FuIGJlIGF0IG1vc3Qgb25lIGNvbm5lY3Rpb24gdG8gYSBnaXZlbiByZW1vdGUgbWFjaGluZSBhdCBhIHRpbWUuIENsaWVudHMgc2hvdWxkXG4vLyBnZXQgYSBTZXJ2ZXJDb25uZWN0aW9uIHZpYSBTZXJ2ZXJDb25uZWN0aW9uLmdldE9yQ3JlYXRlKCkgYW5kIHNob3VsZCBuZXZlciBjYWxsIHRoZVxuLy8gY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsdGVybmF0ZWx5IGV4aXN0aW5nIGNvbm5lY3Rpb25zIGNhbiBiZSBxdWVyaWVkIHdpdGggZ2V0QnlIb3N0bmFtZSgpLlxuLy9cbi8vIGdldFNlcnZpY2UoKSByZXR1cm5zIHR5cGVkIFJQQyBzZXJ2aWNlcyB2aWEgdGhlIHNlcnZpY2UgZnJhbWV3b3JrLlxuLy9cbi8vIEEgU2VydmVyQ29ubmVjdGlvbiBrZWVwcyBhIGxpc3Qgb2YgUmVtb3RlQ29ubmVjdGlvbnMgLSBvbmUgZm9yIGVhY2ggb3BlbiBkaXJlY3Rvcnkgb24gdGhlIHJlbW90ZVxuLy8gbWFjaGluZS4gT25jZSBhbGwgUmVtb3RlQ29ubmVjdGlvbnMgaGF2ZSBiZWVuIGNsb3NlZCwgdGhlbiB0aGUgU2VydmVyQ29ubmVjdGlvbiB3aWxsIGNsb3NlLlxuY2xhc3MgU2VydmVyQ29ubmVjdGlvbiB7XG4gIF9jb25maWc6IFNlcnZlckNvbm5lY3Rpb25Db25maWd1cmF0aW9uO1xuICBfY2xvc2VkOiBib29sZWFuO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQ6IG51bWJlcjtcbiAgX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb246ID9IZWFydGJlYXROb3RpZmljYXRpb247XG4gIF9jbGllbnQ6ID9DbGllbnRDb21wb25lbnQ7XG4gIF9jb25uZWN0aW9uczogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj47XG5cbiAgc3RhdGljIF9jb25uZWN0aW9uczogTWFwPHN0cmluZywgU2VydmVyQ29ubmVjdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgc3RhdGljIGFzeW5jIGdldE9yQ3JlYXRlKGNvbmZpZzogU2VydmVyQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pOiBQcm9taXNlPFNlcnZlckNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb24gPSBTZXJ2ZXJDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoY29uZmlnLmhvc3QpO1xuICAgIGlmIChleGlzdGluZ0Nvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGV4aXN0aW5nQ29ubmVjdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdDb25uZWN0aW9uID0gbmV3IFNlcnZlckNvbm5lY3Rpb24oY29uZmlnKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgbmV3Q29ubmVjdGlvbi5pbml0aWFsaXplKCk7XG4gICAgICByZXR1cm4gbmV3Q29ubmVjdGlvbjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBuZXdDb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8vIERvIE5PVCBjYWxsIHRoaXMgZnJvbSBvdXRzaWRlIHRoaXMgY2xhc3MuIFVzZSBTZXJ2ZXJDb25uZWN0aW9uLmdldE9yQ3JlYXRlKCkgaW5zdGVhZC5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBTZXJ2ZXJDb25uZWN0aW9uQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9jbG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID0gMDtcbiAgICB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9jbGllbnQgPSBudWxsO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gW107XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIF9jcmVhdGVJbnNlY3VyZUNvbm5lY3Rpb25Gb3JUZXN0aW5nKFxuICAgIGN3ZDogc3RyaW5nLFxuICAgIHBvcnQ6IG51bWJlcixcbiAgKTogUHJvbWlzZTw/U2VydmVyQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgcG9ydCxcbiAgICAgIGN3ZCxcbiAgICB9O1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgU2VydmVyQ29ubmVjdGlvbihjb25maWcpO1xuICAgIGF3YWl0IGNvbm5lY3Rpb24uaW5pdGlhbGl6ZSgpO1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgX21vbml0b3JDb25uZWN0aW9uSGVhcnRiZWF0KCkge1xuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuZ2V0U29ja2V0KCk7XG4gICAgY29uc3Qgc2VydmVyVXJpID0gc29ja2V0LmdldFNlcnZlclVyaSgpO1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBBdG9tIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRldGVjdGVkIGhlYXJ0YmVhdCBuZXR3b3JrIHN0YXR1c1xuICAgICAqIFRoZSBmdW5jdGlvbiBtYWtlcyBzdXJlIG5vdCB0byBhZGQgbWFueSBub3RpZmljYXRpb25zIGZvciB0aGUgc2FtZSBldmVudCBhbmQgcHJpb3JpdGl6ZVxuICAgICAqIG5ldyBldmVudHMuXG4gICAgICovXG4gICAgY29uc3QgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uID0gKFxuICAgICAgdHlwZTogbnVtYmVyLFxuICAgICAgZXJyb3JDb2RlOiBzdHJpbmcsXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICBkaXNtaXNzYWJsZTogYm9vbGVhbixcbiAgICAgIGFza1RvUmVsb2FkOiBib29sZWFuXG4gICAgKSA9PiB7XG4gICAgICBjb25zdCB7Y29kZSwgbm90aWZpY2F0aW9uOiBleGlzdGluZ05vdGlmaWNhdGlvbn0gPSB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uIHx8IHt9O1xuICAgICAgaWYgKGNvZGUgJiYgY29kZSA9PT0gZXJyb3JDb2RlICYmIGRpc21pc3NhYmxlKSB7XG4gICAgICAgIC8vIEEgZGlzbWlzc2libGUgaGVhcnRiZWF0IG5vdGlmaWNhdGlvbiB3aXRoIHRoaXMgY29kZSBpcyBhbHJlYWR5IGFjdGl2ZS5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IG51bGw7XG4gICAgICBjb25zdCBvcHRpb25zID0ge2Rpc21pc3NhYmxlLCBidXR0b25zOiBbXX07XG4gICAgICBpZiAoYXNrVG9SZWxvYWQpIHtcbiAgICAgICAgb3B0aW9ucy5idXR0b25zLnB1c2goe1xuICAgICAgICAgIGNsYXNzTmFtZTogJ2ljb24gaWNvbi16YXAnLFxuICAgICAgICAgIG9uRGlkQ2xpY2soKSB7IGF0b20ucmVsb2FkKCk7IH0sXG4gICAgICAgICAgdGV4dDogJ1JlbG9hZCBBdG9tJyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SOlxuICAgICAgICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX1dBUk5JTkc6XG4gICAgICAgICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29uZ25pemVkIGhlYXJ0YmVhdCBub3RpZmljYXRpb24gdHlwZScpO1xuICAgICAgfVxuICAgICAgaWYgKGV4aXN0aW5nTm90aWZpY2F0aW9uKSB7XG4gICAgICAgIGV4aXN0aW5nTm90aWZpY2F0aW9uLmRpc21pc3MoKTtcbiAgICAgIH1cbiAgICAgIGludmFyaWFudChub3RpZmljYXRpb24pO1xuICAgICAgdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IHtcbiAgICAgICAgbm90aWZpY2F0aW9uLFxuICAgICAgICBjb2RlOiBlcnJvckNvZGUsXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCBvbkhlYXJ0YmVhdCA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uKSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGhhcyBiZWVuIGV4aXN0aW5nIGhlYXJ0YmVhdCBlcnJvci93YXJuaW5nLFxuICAgICAgICAvLyB0aGF0IG1lYW5zIGNvbm5lY3Rpb24gaGFzIGJlZW4gbG9zdCBhbmQgd2Ugc2hhbGwgc2hvdyBhIG1lc3NhZ2UgYWJvdXQgY29ubmVjdGlvblxuICAgICAgICAvLyBiZWluZyByZXN0b3JlZCB3aXRob3V0IGEgcmVjb25uZWN0IHByb21wdC5cbiAgICAgICAgY29uc3Qge25vdGlmaWNhdGlvbn0gPSB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uO1xuICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnQ29ubmVjdGlvbiByZXN0b3JlZCB0byBOdWNsaWRlIFNlcnZlciBhdDogJyArIHNlcnZlclVyaSk7XG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQgPSAwO1xuICAgICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgbm90aWZ5TmV0d29ya0F3YXkgPSAoY29kZTogc3RyaW5nKSA9PiB7XG4gICAgICB0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50Kys7XG4gICAgICBpZiAodGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCA+PSBIRUFSVEJFQVRfQVdBWV9SRVBPUlRfQ09VTlQpIHtcbiAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fV0FSTklORywgY29kZSxcbiAgICAgICAgICBgTnVjbGlkZSBzZXJ2ZXIgY2FuIG5vdCBiZSByZWFjaGVkIGF0IFwiJHtzZXJ2ZXJVcml9XCIuPGJyLz5gICtcbiAgICAgICAgICAnQ2hlY2sgeW91ciBuZXR3b3JrIGNvbm5lY3Rpb24uJyxcbiAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSxcbiAgICAgICAgICAvKmFza1RvUmVsb2FkKi8gZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbkhlYXJ0YmVhdEVycm9yID0gKGVycm9yOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHtjb2RlLCBtZXNzYWdlLCBvcmlnaW5hbENvZGV9ID0gZXJyb3I7XG4gICAgICB0cmFja0V2ZW50KHtcbiAgICAgICAgdHlwZTogJ2hlYXJ0YmVhdC1lcnJvcicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBjb2RlOiBjb2RlIHx8ICcnLFxuICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UgfHwgJycsXG4gICAgICAgICAgaG9zdDogdGhpcy5fY29uZmlnLmhvc3QsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci5pbmZvKCdIZWFydGJlYXQgbmV0d29yayBlcnJvcjonLCBjb2RlLCBvcmlnaW5hbENvZGUsIG1lc3NhZ2UpO1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgJ05FVFdPUktfQVdBWSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgc3dpdGNoaW5nIG5ldHdvcmtzLCBkaXNjb25uZWN0ZWQsIHRpbWVvdXQsIHVucmVhY2hhYmxlIHNlcnZlciBvciBmcmFnaWxlXG4gICAgICAgICAgICAvLyBjb25uZWN0aW9uLlxuICAgICAgICAgIG5vdGlmeU5ldHdvcmtBd2F5KGNvZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdTRVJWRVJfQ1JBU0hFRCc6XG4gICAgICAgICAgICAvLyBTZXJ2ZXIgc2h1dCBkb3duIG9yIHBvcnQgbm8gbG9uZ2VyIGFjY2Vzc2libGUuXG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHNlcnZlciB3YXMgdGhlcmUsIGJ1dCBub3cgZ29uZS5cbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnKipOdWNsaWRlIFNlcnZlciBDcmFzaGVkKio8YnIvPicgK1xuICAgICAgICAgICAgICAgICdQbGVhc2UgcmVsb2FkIEF0b20gdG8gcmVzdG9yZSB5b3VyIHJlbW90ZSBwcm9qZWN0IGNvbm5lY3Rpb24uJyxcbiAgICAgICAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAvKmFza1RvUmVsb2FkKi8gdHJ1ZSk7XG4gICAgICAgICAgICAvLyBUT0RPKG1vc3QpIHJlY29ubmVjdCBTZXJ2ZXJDb25uZWN0aW9uLCByZXN0b3JlIHRoZSBjdXJyZW50IHByb2plY3Qgc3RhdGUsXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSBjaGFuZ2UgZGlzbWlzc2FibGUgdG8gZmFsc2UgYW5kIHR5cGUgdG8gJ1dBUk5JTkcnLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdQT1JUX05PVF9BQ0NFU1NJQkxFJzpcbiAgICAgICAgICAgIC8vIE5vdGlmeSBuZXZlciBoZWFyZCBhIGhlYXJ0YmVhdCBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgY29uc3Qge3BvcnR9ID0gcGFyc2VSZW1vdGVVcmkoc2VydmVyVXJpKTtcbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnKipOdWNsaWRlIFNlcnZlciBJcyBOb3QgUmVhY2hhYmxlKio8YnIvPicgK1xuICAgICAgICAgICAgICAgIGBJdCBjb3VsZCBiZSBydW5uaW5nIG9uIGEgcG9ydCB0aGF0IGlzIG5vdCBhY2Nlc3NpYmxlOiAke3BvcnR9LmAsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgICAgICAgLyphc2tUb1JlbG9hZCovIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnSU5WQUxJRF9DRVJUSUZJQ0FURSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBpcyBub3QgYWNjZXB0ZWQgYnkgbnVjbGlkZSBzZXJ2ZXJcbiAgICAgICAgICAgIC8vIChjZXJ0aWZpY2F0ZSBtaXNtYXRjaCkuXG4gICAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IsIGNvZGUsXG4gICAgICAgICAgICAgICAgJyoqQ29ubmVjdGlvbiBSZXNldCBFcnJvcioqPGJyLz4nICtcbiAgICAgICAgICAgICAgICAnVGhpcyBjb3VsZCBiZSBjYXVzZWQgYnkgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBtaXNtYXRjaGluZyB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAnc2VydmVyIGNlcnRpZmljYXRlLjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSByZWxvYWQgQXRvbSB0byByZXN0b3JlIHlvdXIgcmVtb3RlIHByb2plY3QgY29ubmVjdGlvbi4nLFxuICAgICAgICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyB0cnVlKTtcbiAgICAgICAgICAgIC8vIFRPRE8obW9zdCk6IHJlY29ubmVjdCBTZXJ2ZXJDb25uZWN0aW9uLCByZXN0b3JlIHRoZSBjdXJyZW50IHByb2plY3Qgc3RhdGUuXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSBjaGFuZ2UgZGlzbWlzc2FibGUgdG8gZmFsc2UgYW5kIHR5cGUgdG8gJ1dBUk5JTkcnLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG5vdGlmeU5ldHdvcmtBd2F5KGNvZGUpO1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignVW5yZWNvbmduaXplZCBoZWFydGJlYXQgZXJyb3IgY29kZTogJyArIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9uKCdoZWFydGJlYXQnLCBvbkhlYXJ0YmVhdCk7XG4gICAgc29ja2V0Lm9uKCdoZWFydGJlYXQuZXJyb3InLCBvbkhlYXJ0YmVhdEVycm9yKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignaGVhcnRiZWF0Jywgb25IZWFydGJlYXQpO1xuICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdoZWFydGJlYXQuZXJyb3InLCBvbkhlYXJ0YmVhdEVycm9yKTtcbiAgICB9KSk7XG4gIH1cblxuICBnZXRVcmlPZlJlbW90ZVBhdGgocmVtb3RlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG51Y2xpZGU6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfSR7cmVtb3RlUGF0aH1gO1xuICB9XG5cbiAgZ2V0UGF0aE9mVXJpKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGFyc2VSZW1vdGVVcmkodXJpKS5wYXRoO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9zdGFydFJwYygpO1xuICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuZ2V0Q2xpZW50KCk7XG5cbiAgICAvLyBUZXN0IGNvbm5lY3Rpb24gZmlyc3QuIEZpcnN0IHRpbWUgd2UgZ2V0IGhlcmUgd2UncmUgY2hlY2tpbmcgdG8gcmVlc3RhYmxpc2hcbiAgICAvLyBjb25uZWN0aW9uIHVzaW5nIGNhY2hlZCBjcmVkZW50aWFscy4gVGhpcyB3aWxsIGZhaWwgZmFzdCAoZmFzdGVyIHRoYW4gaW5mb1NlcnZpY2UpXG4gICAgLy8gd2hlbiB3ZSBkb24ndCBoYXZlIGNhY2hlZCBjcmVkZW50aWFscyB5ZXQuXG4gICAgYXdhaXQgY2xpZW50LnRlc3RDb25uZWN0aW9uKCk7XG5cbiAgICAvLyBEbyB2ZXJzaW9uIGNoZWNrLlxuICAgIGNvbnN0IGluZm9TZXJ2aWNlID0gdGhpcy5nZXRTZXJ2aWNlKCdJbmZvU2VydmljZScpO1xuICAgIGNvbnN0IHNlcnZlclZlcnNpb24gPSBhd2FpdCBpbmZvU2VydmljZS5nZXRTZXJ2ZXJWZXJzaW9uKCk7XG5cbiAgICBjb25zdCBjbGllbnRWZXJzaW9uID0gZ2V0VmVyc2lvbigpO1xuICAgIGlmIChjbGllbnRWZXJzaW9uICE9PSBzZXJ2ZXJWZXJzaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBWZXJzaW9uIG1pc21hdGNoLiBDbGllbnQgYXQgJHtjbGllbnRWZXJzaW9ufSB3aGlsZSBzZXJ2ZXIgYXQgJHtzZXJ2ZXJWZXJzaW9ufS5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb25pdG9yQ29ubmVjdGlvbkhlYXJ0YmVhdCgpO1xuXG4gICAgU2VydmVyQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuc2V0KHRoaXMuZ2V0UmVtb3RlSG9zdG5hbWUoKSwgdGhpcyk7XG4gICAgc2V0Q29ubmVjdGlvbkNvbmZpZyh0aGlzLl9jb25maWcpO1xuICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1hZGQnLCB0aGlzKTtcbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jbG9zZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGdXR1cmUgZ2V0Q2xpZW50IGNhbGxzIHNob3VsZCBmYWlsLCBpZiBpdCBoYXMgYSBjYWNoZWQgU2VydmVyQ29ubmVjdGlvbiBpbnN0YW5jZS5cbiAgICB0aGlzLl9jbG9zZWQgPSB0cnVlO1xuXG4gICAgLy8gVGhlIFJwYyBjaGFubmVsIG93bnMgdGhlIHNvY2tldC5cbiAgICBpZiAodGhpcy5fY2xpZW50ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2NsaWVudC5jbG9zZSgpO1xuICAgICAgdGhpcy5fY2xpZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSBfY29ubmVjdGlvbnMgdG8gbm90IGJlIGNvbnNpZGVyZWQgaW4gZnV0dXJlIGNvbm5lY3Rpb24gcXVlcmllcy5cbiAgICBpZiAoU2VydmVyQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuZGVsZXRlKHRoaXMuZ2V0UmVtb3RlSG9zdG5hbWUoKSkpIHtcbiAgICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1jbG9zZScsIHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldENsaWVudCgpOiBDbGllbnRDb21wb25lbnQge1xuICAgIGludmFyaWFudCghdGhpcy5fY2xvc2VkICYmIHRoaXMuX2NsaWVudCAhPSBudWxsLCAnU2VydmVyIGNvbm5lY3Rpb24gaGFzIGJlZW4gY2xvc2VkLicpO1xuICAgIHJldHVybiB0aGlzLl9jbGllbnQ7XG4gIH1cblxuICBfc3RhcnRScGMoKTogdm9pZCB7XG4gICAgbGV0IHVyaTtcbiAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICAvLyBVc2UgaHR0cHMgaWYgd2UgaGF2ZSBrZXksIGNlcnQsIGFuZCBjYVxuICAgIGlmICh0aGlzLl9pc1NlY3VyZSgpKSB7XG4gICAgICBvcHRpb25zLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgPSB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTtcbiAgICAgIG9wdGlvbnMuY2xpZW50Q2VydGlmaWNhdGUgPSB0aGlzLl9jb25maWcuY2xpZW50Q2VydGlmaWNhdGU7XG4gICAgICBvcHRpb25zLmNsaWVudEtleSA9IHRoaXMuX2NvbmZpZy5jbGllbnRLZXk7XG4gICAgICB1cmkgPSBgaHR0cHM6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVyaSA9IGBodHRwOi8vJHt0aGlzLmdldFJlbW90ZUhvc3QoKX1gO1xuICAgIH1cblxuICAgIGNvbnN0IHNvY2tldCA9IG5ldyBOdWNsaWRlU29ja2V0KHVyaSwgb3B0aW9ucyk7XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudENvbXBvbmVudChzb2NrZXQsIGxvYWRTZXJ2aWNlc0NvbmZpZygpKTtcblxuICAgIC8vIFJlZ2lzdGVyIE51Y2xpZGVVcmkgdHlwZSBjb252ZXJzaW9ucy5cbiAgICBjbGllbnQucmVnaXN0ZXJUeXBlKCdOdWNsaWRlVXJpJyxcbiAgICAgIHJlbW90ZVVyaSA9PiB0aGlzLmdldFBhdGhPZlVyaShyZW1vdGVVcmkpLCBwYXRoID0+IHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHBhdGgpKTtcblxuICAgIHRoaXMuX2NsaWVudCA9IGNsaWVudDtcbiAgfVxuXG4gIF9pc1NlY3VyZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEoXG4gICAgICAgIHRoaXMuX2NvbmZpZy5jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NvbmZpZy5jbGllbnRDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jb25maWcuY2xpZW50S2V5XG4gICAgKTtcbiAgfVxuXG4gIGdldFJlbW90ZUhvc3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fY29uZmlnLmhvc3R9OiR7dGhpcy5fY29uZmlnLnBvcnR9YDtcbiAgfVxuXG4gIGdldFBvcnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLnBvcnQ7XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0bmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcuaG9zdDtcbiAgfVxuXG4gIGdldENvbmZpZygpOiBTZXJ2ZXJDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgfVxuXG4gIGFkZENvbm5lY3Rpb24oY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLnB1c2goY29ubmVjdGlvbik7XG4gIH1cblxuICByZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fY29ubmVjdGlvbnMuaW5kZXhPZihjb25uZWN0aW9uKSAhPT0gLTEsXG4gICAgICAnQXR0ZW1wdCB0byByZW1vdmUgYSBub24tZXhpc3RlbnQgUmVtb3RlQ29ubmVjdGlvbicpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLnNwbGljZSh0aGlzLl9jb25uZWN0aW9ucy5pbmRleE9mKGNvbm5lY3Rpb24pLCAxKTtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG9uRGlkQWRkU2VydmVyQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogU2VydmVyQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgb25EaWRDbG9zZVNlcnZlckNvbm5lY3Rpb24oaGFuZGxlcjogKGNvbm5lY3Rpb246IFNlcnZlckNvbm5lY3Rpb24pID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBfZW1pdHRlci5vbignZGlkLWNsb3NlJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRCeUhvc3RuYW1lKGhvc3RuYW1lOiBzdHJpbmcpOiA/U2VydmVyQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIFNlcnZlckNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmdldChob3N0bmFtZSk7XG4gIH1cblxuICBnZXRDb25uZWN0aW9ucygpOiBBcnJheTxSZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb25zO1xuICB9XG5cbiAgZ2V0U2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBbc2VydmljZUNvbmZpZ10gPSBuZXdTZXJ2aWNlcy5maWx0ZXIoY29uZmlnID0+IGNvbmZpZy5uYW1lID09PSBzZXJ2aWNlTmFtZSk7XG4gICAgaW52YXJpYW50KHNlcnZpY2VDb25maWcgIT0gbnVsbCwgYE5vIGNvbmZpZyBmb3VuZCBmb3Igc2VydmljZSAke3NlcnZpY2VOYW1lfWApO1xuICAgIHJldHVybiBnZXRQcm94eShzZXJ2aWNlQ29uZmlnLm5hbWUsIHNlcnZpY2VDb25maWcuZGVmaW5pdGlvbiwgdGhpcy5nZXRDbGllbnQoKSk7XG4gIH1cblxuICBnZXRTb2NrZXQoKTogTnVjbGlkZVNvY2tldCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xpZW50KCkuZ2V0U29ja2V0KCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFNlcnZlckNvbm5lY3Rpb24sXG4gIF9fdGVzdF9fOiB7XG4gICAgY29ubmVjdGlvbnM6IFNlcnZlckNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLFxuICB9LFxufTtcbiJdfQ==