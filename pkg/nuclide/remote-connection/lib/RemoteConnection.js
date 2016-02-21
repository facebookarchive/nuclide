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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _analytics = require('../../analytics');

var _serverLibServiceframeworkClientComponent = require('../../server/lib/serviceframework/ClientComponent');

var _serverLibServiceframeworkClientComponent2 = _interopRequireDefault(_serverLibServiceframeworkClientComponent);

var _RemoteDirectory = require('./RemoteDirectory');

var _RemoteFile = require('./RemoteFile');

var _serverLibServiceframeworkConfig = require('../../server/lib/serviceframework/config');

var _serviceParser = require('../../service-parser');

var _serverLibServiceframework = require('../../server/lib/serviceframework');

var _serverLibServiceframework2 = _interopRequireDefault(_serverLibServiceframework);

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var remoteUri = require('../../remote-uri');
var logger = require('../../logging').getLogger();

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var NuclideSocket = require('../../server/lib/NuclideSocket');

var _require3 = require('./RemoteConnectionConfigurationManager');

var getConnectionConfig = _require3.getConnectionConfig;
var setConnectionConfig = _require3.setConnectionConfig;

var _require4 = require('../../version');

var getVersion = _require4.getVersion;

var newServices = _serverLibServiceframework2['default'].loadServicesConfig();

var HEARTBEAT_AWAY_REPORT_COUNT = 3;
var HEARTBEAT_NOTIFICATION_ERROR = 1;
var HEARTBEAT_NOTIFICATION_WARNING = 2;

var FILE_WATCHER_SERVICE = 'FileWatcherService';
var FILE_SYSTEM_SERVICE = 'FileSystemService';

// key for https connection.

var _emitter = new EventEmitter();

var RemoteConnection = (function () {
  _createClass(RemoteConnection, null, [{
    key: 'findOrCreate',
    value: function findOrCreate(config) {
      var connection = new RemoteConnection(config);
      return connection._initialize();
    }

    // Do NOT call this directly. Use findOrCreate instead.
  }, {
    key: '_connections',
    value: [],
    enumerable: true
  }]);

  function RemoteConnection(config) {
    _classCallCheck(this, RemoteConnection);

    this._subscriptions = new CompositeDisposable();
    this._entries = {};
    this._config = config;
    this._heartbeatNetworkAwayCount = 0;
    this._closed = false;
  }

  _createClass(RemoteConnection, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }, {
    key: '_setHgRepoInfo',

    // A workaround before Atom 2.0: Atom's Project::setPaths currently uses
    // ::repositoryForDirectorySync, so we need the repo information to already be
    // available when the new path is added. t6913624 tracks cleanup of this.
    value: _asyncToGenerator(function* () {
      var remotePath = this.getPathForInitialWorkingDirectory();

      var _ref = this.getService('SourceControlService');

      var getHgRepository = _ref.getHgRepository;

      this._setHgRepositoryDescription((yield getHgRepository(remotePath)));
    })
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
        var _ref2 = _this._lastHeartbeatNotification || {};

        var code = _ref2.code;
        var existingNotification = _ref2.notification;

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
            // TODO(most) reconnect RemoteConnection, restore the current project state,
            // and finally change dismissable to false and type to 'WARNING'.
            break;
          case 'PORT_NOT_ACCESSIBLE':
            // Notify never heard a heartbeat from the server.

            var _remoteUri$parse = remoteUri.parse(serverUri),
                port = _remoteUri$parse.port;

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
            // TODO(most): reconnect RemoteConnection, restore the current project state.
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

      this._subscriptions.add(new Disposable(function () {
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
      return remoteUri.parse(uri).path;
    }
  }, {
    key: 'createDirectory',
    value: function createDirectory(uri) {
      var _remoteUri$parse2 = remoteUri.parse(uri);

      var path = _remoteUri$parse2.path;

      path = require('path').normalize(path);

      var entry = this._entries[path];
      if (!entry || entry.getLocalPath() !== path) {
        this._entries[path] = entry = new _RemoteDirectory.RemoteDirectory(this, this.getUriOfRemotePath(path), { hgRepositoryDescription: this._hgRepositoryDescription });
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

    // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
  }, {
    key: '_setHgRepositoryDescription',
    value: function _setHgRepositoryDescription(hgRepositoryDescription) {
      this._hgRepositoryDescription = hgRepositoryDescription;
    }
  }, {
    key: 'createFile',
    value: function createFile(uri) {
      var _remoteUri$parse3 = remoteUri.parse(uri);

      var path = _remoteUri$parse3.path;

      path = require('path').normalize(path);

      var entry = this._entries[path];
      if (!entry || entry.getLocalPath() !== path) {
        this._entries[path] = entry = new _RemoteFile.RemoteFile(this, this.getUriOfRemotePath(path));
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
      var _this2 = this;

      var oldPath = entry.getLocalPath();
      /* $FlowFixMe */
      var renameSubscription = entry.onDidRename(function () {
        delete _this2._entries[oldPath];
        _this2._entries[entry.getLocalPath()] = entry;
      });
      /* $FlowFixMe */
      var deleteSubscription = entry.onDidDelete(function () {
        delete _this2._entries[entry.getLocalPath()];
        renameSubscription.dispose();
        deleteSubscription.dispose();
      });
    }
  }, {
    key: '_initialize',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      // Right now we don't re-handshake.
      if (this._initialized === undefined) {
        this._initialized = false;
        var client = this._getClient();

        // Test connection first. First time we get here we're checking to reestablish
        // connection using cached credentials. This will fail fast (faster than infoService)
        // when we don't have cached credentials yet.
        try {
          yield client.testConnection();

          // Do version check.
          var serverVersion = undefined;

          // Need to set initialized to true optimistically so that we can get the InfoService.
          // TODO: We shouldn't need the client to get a service.
          this._initialized = true;
          var infoService = this.getService('InfoService');
          serverVersion = yield infoService.getServerVersion();

          var clientVersion = getVersion();
          if (clientVersion !== serverVersion) {
            throw new Error('Version mismatch. Client at ' + clientVersion + ' while server at ' + serverVersion + '.');
          }

          var FileSystemService = this.getService(FILE_SYSTEM_SERVICE);
          this._config.cwd = yield FileSystemService.resolveRealPath(this._config.cwd);

          // Now that we know the real path, it's possible this collides with an existing connection.
          // If so, we should just stop immediately.
          var existingConnection = RemoteConnection.getByHostnameAndPath(this._config.host, this._config.cwd);
          if (existingConnection != null) {
            return existingConnection;
          }
        } catch (e) {
          client.close();
          this._initialized = false;
          throw e;
        }

        // Store the configuration for future usage.
        setConnectionConfig(this._config);

        this._monitorConnectionHeartbeat();

        // A workaround before Atom 2.0: see ::getHgRepoInfo.
        yield this._setHgRepoInfo();

        // Register NuclideUri type conversions.
        client.registerType('NuclideUri', function (uri) {
          return _this3.getPathOfUri(uri);
        }, function (path) {
          return _this3.getUriOfRemotePath(path);
        });

        // Save to cache.
        this._addConnection();
        this._watchRootProjectDirectory();
      }

      return this;
    })
  }, {
    key: '_addConnection',
    value: function _addConnection() {
      RemoteConnection._connections.push(this);
      _emitter.emit('did-add', this);
    }
  }, {
    key: '_watchRootProjectDirectory',
    value: function _watchRootProjectDirectory() {
      var _this4 = this;

      var rootDirectoryUri = this.getUriForInitialWorkingDirectory();
      var rootDirectotyPath = this.getPathForInitialWorkingDirectory();
      var FileWatcherService = this.getService(FILE_WATCHER_SERVICE);
      (0, _assert2['default'])(FileWatcherService);
      var watchDirectoryRecursive = FileWatcherService.watchDirectoryRecursive;

      // Start watching the project for changes and initialize the root watcher
      // for next calls to `watchFile` and `watchDirectory`.
      var watchStream = watchDirectoryRecursive(rootDirectoryUri);
      var subscription = watchStream.subscribe(function (watchUpdate) {
        // Nothing needs to be done if the root directory was watched correctly.
        // Let's just console log it anyway.
        logger.info('Watcher Features Initialized for project: ' + rootDirectoryUri, watchUpdate);
      }, _asyncToGenerator(function* (error) {
        var warningMessageToUser = 'You just connected to a remote project ' + ('`' + rootDirectotyPath + '` but we recommend you remove this directory now ') + 'because crucial features like synced remote file editing, file search, ' + 'and Mercurial-related updates will not work.<br/>';

        var loggedErrorMessage = error.message || error;
        logger.error('Watcher failed to start - watcher features disabled! Error: ' + loggedErrorMessage);

        var FileSystemService = _this4.getService(FILE_SYSTEM_SERVICE);
        if (yield FileSystemService.isNfs(rootDirectotyPath)) {
          warningMessageToUser += 'This project directory: `' + rootDirectotyPath + '` is on <b>`NFS`</b> filesystem. ' + 'Nuclide works best with local (non-NFS) root directory.' + 'e.g. `/data/users/$USER`';
        } else {
          warningMessageToUser += '<b><a href=\'https://facebook.github.io/watchman/\'>Watchman</a> Error:</b>' + loggedErrorMessage;
        }
        // Add a persistent warning message to make sure the user sees it before dismissing.
        atom.notifications.addWarning(warningMessageToUser, { dismissable: true });
      }), function () {
        // Nothing needs to be done if the root directory watch has ended.
        logger.info('Watcher Features Ended for project: ' + rootDirectoryUri);
      });
      this._subscriptions.add(subscription);
    }
  }, {
    key: 'close',
    value: function close() {
      // Close the eventbus that will stop the heartbeat interval, websocket reconnect trials, ..etc.
      if (this._client) {
        this._client.close();
        this._client = null;
      }
      if (!this._closed) {
        // Future getClient calls should fail, if it has a cached RemoteConnection instance.
        this._closed = true;
        // Remove from _connections to not be considered in future connection queries.
        RemoteConnection._connections.splice(RemoteConnection._connections.indexOf(this), 1);
        _emitter.emit('did-close', this);
      }
    }
  }, {
    key: 'getClient',
    value: function getClient() {
      if (!this._initialized) {
        throw new Error('Remote connection has not been initialized.');
      } else if (this._closed) {
        throw new Error('Remote connection has been closed.');
      } else {
        return this._getClient();
      }
    }
  }, {
    key: '_getClient',
    value: function _getClient() {
      if (!this._client) {
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

        // The remote connection and client are identified by both the remote host and the inital
        // working directory.
        var socket = new NuclideSocket(uri, options);
        this._client = new _serverLibServiceframeworkClientComponent2['default'](socket, (0, _serverLibServiceframeworkConfig.loadServicesConfig)());
      }
      (0, _assert2['default'])(this._client);
      return this._client;
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
    key: 'getUriForInitialWorkingDirectory',
    value: function getUriForInitialWorkingDirectory() {
      return this.getUriOfRemotePath(this.getPathForInitialWorkingDirectory());
    }
  }, {
    key: 'getPathForInitialWorkingDirectory',
    value: function getPathForInitialWorkingDirectory() {
      return this._config.cwd;
    }
  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this._config;
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
    value: function _createInsecureConnectionForTesting(cwd, port) {
      var config = {
        host: 'localhost',
        port: port,
        cwd: cwd
      };
      return RemoteConnection.findOrCreate(config);
    }

    /**
     * Create a connection by reusing the configuration of last successful connection associated with
     * given host. If the server's certs has been updated or there is no previous successful
     * connection, null (resolved by promise) is returned.
     */
  }, {
    key: 'createConnectionBySavedConfig',
    value: _asyncToGenerator(function* (host, cwd) {
      var connectionConfig = getConnectionConfig(host);
      if (!connectionConfig) {
        return null;
      }
      try {
        var config = _extends({}, connectionConfig, { cwd: cwd });
        return yield RemoteConnection.findOrCreate(config);
      } catch (e) {
        logger.warn('Failed to reuse connectionConfiguration for ' + host, e);
        return null;
      }
    })
  }, {
    key: 'onDidAddRemoteConnection',
    value: function onDidAddRemoteConnection(handler) {
      _emitter.on('did-add', handler);
      return new Disposable(function () {
        _emitter.removeListener('did-add', handler);
      });
    }
  }, {
    key: 'onDidCloseRemoteConnection',
    value: function onDidCloseRemoteConnection(handler) {
      _emitter.on('did-close', handler);
      return new Disposable(function () {
        _emitter.removeListener('did-close', handler);
      });
    }
  }, {
    key: 'getForUri',
    value: function getForUri(uri) {
      var _remoteUri$parse4 = remoteUri.parse(uri);

      var hostname = _remoteUri$parse4.hostname;
      var path = _remoteUri$parse4.path;

      if (hostname == null) {
        return null;
      }
      return RemoteConnection.getByHostnameAndPath(hostname, path);
    }

    /**
     * Get cached connection match the hostname and the path has the prefix of connection.cwd.
     * @param hostname The connected server host name.
     * @param path The absolute path that's has the prefix of cwd of the connection.
     *   If path is null, empty or undefined, then return the connection which matches
     *   the hostname and ignore the initial working directory.
     */
  }, {
    key: 'getByHostnameAndPath',
    value: function getByHostnameAndPath(hostname, path) {
      return RemoteConnection._connections.filter(function (connection) {
        return connection.getRemoteHostname() === hostname && (!path || path.startsWith(connection.getPathForInitialWorkingDirectory()));
      })[0];
    }
  }, {
    key: 'getByHostname',
    value: function getByHostname(hostname) {
      return RemoteConnection._connections.filter(function (connection) {
        return connection.getRemoteHostname() === hostname;
      });
    }
  }]);

  return RemoteConnection;
})();

module.exports = {
  RemoteConnection: RemoteConnection,
  __test__: {
    connections: RemoteConnection._connections
  }
};
// host nuclide server is running on.
// port to connect to.
// Path to remote directory user should start in upon connection.
// certificate of certificate authority.
// client certificate for https connection.
//# sourceMappingURL=data:application/json;base64,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QkFBZ0I7QUFDaEIsVUFBUSxFQUFFO0FBQ1IsZUFBVyxFQUFFLGdCQUFnQixDQUFDLFlBQVk7R0FDM0M7Q0FDRixDQUFDIiwiZmlsZSI6IlJlbW90ZUNvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5RGVzY3JpcHRpb259IGZyb20gJy4uLy4uL3NvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuXG5pbXBvcnQgdHlwZW9mICogYXMgRmlsZVdhdGNoZXJTZXJ2aWNlVHlwZSBmcm9tICcuLi8uLi9maWxld2F0Y2hlci1iYXNlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTb3VyY2VDb250cm9sU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VzL1NvdXJjZUNvbnRyb2xTZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja0V2ZW50fSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IENsaWVudENvbXBvbmVudCBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvQ2xpZW50Q29tcG9uZW50JztcbmltcG9ydCB7UmVtb3RlRGlyZWN0b3J5fSBmcm9tICcuL1JlbW90ZURpcmVjdG9yeSc7XG5pbXBvcnQge1JlbW90ZUZpbGV9IGZyb20gJy4vUmVtb3RlRmlsZSc7XG5pbXBvcnQge2xvYWRTZXJ2aWNlc0NvbmZpZ30gZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlZnJhbWV3b3JrL2NvbmZpZyc7XG5pbXBvcnQge2dldFByb3h5fSBmcm9tICcuLi8uLi9zZXJ2aWNlLXBhcnNlcic7XG5pbXBvcnQgU2VydmljZUZyYW1ld29yayBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsnO1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtdXJpJyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5jb25zdCB7RXZlbnRFbWl0dGVyfSA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5jb25zdCBOdWNsaWRlU29ja2V0ID0gcmVxdWlyZSgnLi4vLi4vc2VydmVyL2xpYi9OdWNsaWRlU29ja2V0Jyk7XG5jb25zdCB7Z2V0Q29ubmVjdGlvbkNvbmZpZywgc2V0Q29ubmVjdGlvbkNvbmZpZ30gPVxuICByZXF1aXJlKCcuL1JlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uTWFuYWdlcicpO1xuY29uc3Qge2dldFZlcnNpb259ID0gcmVxdWlyZSgnLi4vLi4vdmVyc2lvbicpO1xuXG5jb25zdCBuZXdTZXJ2aWNlcyA9IFNlcnZpY2VGcmFtZXdvcmsubG9hZFNlcnZpY2VzQ29uZmlnKCk7XG5cbmNvbnN0IEhFQVJUQkVBVF9BV0FZX1JFUE9SVF9DT1VOVCA9IDM7XG5jb25zdCBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SID0gMTtcbmNvbnN0IEhFQVJUQkVBVF9OT1RJRklDQVRJT05fV0FSTklORyA9IDI7XG5cbmNvbnN0IEZJTEVfV0FUQ0hFUl9TRVJWSUNFID0gJ0ZpbGVXYXRjaGVyU2VydmljZSc7XG5jb25zdCBGSUxFX1NZU1RFTV9TRVJWSUNFID0gJ0ZpbGVTeXN0ZW1TZXJ2aWNlJztcblxudHlwZSBIZWFydGJlYXROb3RpZmljYXRpb24gPSB7XG4gIG5vdGlmaWNhdGlvbjogYXRvbSROb3RpZmljYXRpb247XG4gIGNvZGU6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG4gIGhvc3Q6IHN0cmluZzsgLy8gaG9zdCBudWNsaWRlIHNlcnZlciBpcyBydW5uaW5nIG9uLlxuICBwb3J0OiBudW1iZXI7IC8vIHBvcnQgdG8gY29ubmVjdCB0by5cbiAgY3dkOiBzdHJpbmc7IC8vIFBhdGggdG8gcmVtb3RlIGRpcmVjdG9yeSB1c2VyIHNob3VsZCBzdGFydCBpbiB1cG9uIGNvbm5lY3Rpb24uXG4gIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNlcnRpZmljYXRlIG9mIGNlcnRpZmljYXRlIGF1dGhvcml0eS5cbiAgY2xpZW50Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNsaWVudCBjZXJ0aWZpY2F0ZSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbiAgY2xpZW50S2V5PzogQnVmZmVyOyAvLyBrZXkgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG59XG5cbmNvbnN0IF9lbWl0dGVyOiBFdmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbmNsYXNzIFJlbW90ZUNvbm5lY3Rpb24ge1xuICBfZW50cmllczoge1twYXRoOiBzdHJpbmddOiBSZW1vdGVGaWxlIHwgUmVtb3RlRGlyZWN0b3J5fTtcbiAgX2NvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb247XG4gIF9pbml0aWFsaXplZDogP2Jvb2w7XG4gIF9jbG9zZWQ6ID9ib29sO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIF9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50OiBudW1iZXI7XG4gIF9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uOiA/SGVhcnRiZWF0Tm90aWZpY2F0aW9uO1xuICBfY2xpZW50OiA/Q2xpZW50Q29tcG9uZW50O1xuXG4gIHN0YXRpYyBfY29ubmVjdGlvbnM6IEFycmF5PFJlbW90ZUNvbm5lY3Rpb24+ID0gW107XG5cbiAgc3RhdGljIGZpbmRPckNyZWF0ZShjb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKTpcbiAgICAgIFByb21pc2U8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgUmVtb3RlQ29ubmVjdGlvbihjb25maWcpO1xuICAgIHJldHVybiBjb25uZWN0aW9uLl9pbml0aWFsaXplKCk7XG4gIH1cblxuICAvLyBEbyBOT1QgY2FsbCB0aGlzIGRpcmVjdGx5LiBVc2UgZmluZE9yQ3JlYXRlIGluc3RlYWQuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9lbnRyaWVzID0ge307XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQgPSAwO1xuICAgIHRoaXMuX2Nsb3NlZCA9IGZhbHNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHN0YXRpYyBfY3JlYXRlSW5zZWN1cmVDb25uZWN0aW9uRm9yVGVzdGluZyhcbiAgICBjd2Q6IHN0cmluZyxcbiAgICBwb3J0OiBudW1iZXIsXG4gICk6IFByb21pc2U8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgcG9ydCxcbiAgICAgIGN3ZCxcbiAgICB9O1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmZpbmRPckNyZWF0ZShjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGNvbm5lY3Rpb24gYnkgcmV1c2luZyB0aGUgY29uZmlndXJhdGlvbiBvZiBsYXN0IHN1Y2Nlc3NmdWwgY29ubmVjdGlvbiBhc3NvY2lhdGVkIHdpdGhcbiAgICogZ2l2ZW4gaG9zdC4gSWYgdGhlIHNlcnZlcidzIGNlcnRzIGhhcyBiZWVuIHVwZGF0ZWQgb3IgdGhlcmUgaXMgbm8gcHJldmlvdXMgc3VjY2Vzc2Z1bFxuICAgKiBjb25uZWN0aW9uLCBudWxsIChyZXNvbHZlZCBieSBwcm9taXNlKSBpcyByZXR1cm5lZC5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBjcmVhdGVDb25uZWN0aW9uQnlTYXZlZENvbmZpZyhcbiAgICBob3N0OiBzdHJpbmcsXG4gICAgY3dkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8P1JlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25uZWN0aW9uQ29uZmlnID0gZ2V0Q29ubmVjdGlvbkNvbmZpZyhob3N0KTtcbiAgICBpZiAoIWNvbm5lY3Rpb25Db25maWcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgY29uZmlnID0gey4uLmNvbm5lY3Rpb25Db25maWcsIGN3ZH07XG4gICAgICByZXR1cm4gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5maW5kT3JDcmVhdGUoY29uZmlnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHJldXNlIGNvbm5lY3Rpb25Db25maWd1cmF0aW9uIGZvciAke2hvc3R9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBBdG9tJ3MgUHJvamVjdDo6c2V0UGF0aHMgY3VycmVudGx5IHVzZXNcbiAgLy8gOjpyZXBvc2l0b3J5Rm9yRGlyZWN0b3J5U3luYywgc28gd2UgbmVlZCB0aGUgcmVwbyBpbmZvcm1hdGlvbiB0byBhbHJlYWR5IGJlXG4gIC8vIGF2YWlsYWJsZSB3aGVuIHRoZSBuZXcgcGF0aCBpcyBhZGRlZC4gdDY5MTM2MjQgdHJhY2tzIGNsZWFudXAgb2YgdGhpcy5cbiAgYXN5bmMgX3NldEhnUmVwb0luZm8oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVtb3RlUGF0aCA9IHRoaXMuZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qge2dldEhnUmVwb3NpdG9yeX0gPSAodGhpcy5nZXRTZXJ2aWNlKCdTb3VyY2VDb250cm9sU2VydmljZScpOiBTb3VyY2VDb250cm9sU2VydmljZSk7XG4gICAgdGhpcy5fc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oYXdhaXQgZ2V0SGdSZXBvc2l0b3J5KHJlbW90ZVBhdGgpKTtcbiAgfVxuXG4gIF9tb25pdG9yQ29ubmVjdGlvbkhlYXJ0YmVhdCgpIHtcbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLmdldFNvY2tldCgpO1xuICAgIGNvbnN0IHNlcnZlclVyaSA9IHNvY2tldC5nZXRTZXJ2ZXJVcmkoKTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gQXRvbSBub3RpZmljYXRpb24gZm9yIHRoZSBkZXRlY3RlZCBoZWFydGJlYXQgbmV0d29yayBzdGF0dXNcbiAgICAgKiBUaGUgZnVuY3Rpb24gbWFrZXMgc3VyZSBub3QgdG8gYWRkIG1hbnkgbm90aWZpY2F0aW9ucyBmb3IgdGhlIHNhbWUgZXZlbnQgYW5kIHByaW9yaXRpemVcbiAgICAgKiBuZXcgZXZlbnRzLlxuICAgICAqL1xuICAgIGNvbnN0IGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IChcbiAgICAgIHR5cGU6IG51bWJlcixcbiAgICAgIGVycm9yQ29kZTogc3RyaW5nLFxuICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgZGlzbWlzc2FibGU6IGJvb2xlYW4sXG4gICAgICBhc2tUb1JlbG9hZDogYm9vbGVhblxuICAgICkgPT4ge1xuICAgICAgY29uc3Qge2NvZGUsIG5vdGlmaWNhdGlvbjogZXhpc3RpbmdOb3RpZmljYXRpb259ID0gdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiB8fCB7fTtcbiAgICAgIGlmIChjb2RlICYmIGNvZGUgPT09IGVycm9yQ29kZSAmJiBkaXNtaXNzYWJsZSkge1xuICAgICAgICAvLyBBIGRpc21pc3NpYmxlIGhlYXJ0YmVhdCBub3RpZmljYXRpb24gd2l0aCB0aGlzIGNvZGUgaXMgYWxyZWFkeSBhY3RpdmUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxldCBub3RpZmljYXRpb24gPSBudWxsO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtkaXNtaXNzYWJsZSwgYnV0dG9uczogW119O1xuICAgICAgaWYgKGFza1RvUmVsb2FkKSB7XG4gICAgICAgIG9wdGlvbnMuYnV0dG9ucy5wdXNoKHtcbiAgICAgICAgICBjbGFzc05hbWU6ICdpY29uIGljb24temFwJyxcbiAgICAgICAgICBvbkRpZENsaWNrKCkgeyBhdG9tLnJlbG9hZCgpOyB9LFxuICAgICAgICAgIHRleHQ6ICdSZWxvYWQgQXRvbScsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUjpcbiAgICAgICAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HOlxuICAgICAgICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5yZWNvbmduaXplZCBoZWFydGJlYXQgbm90aWZpY2F0aW9uIHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIGlmIChleGlzdGluZ05vdGlmaWNhdGlvbikge1xuICAgICAgICBleGlzdGluZ05vdGlmaWNhdGlvbi5kaXNtaXNzKCk7XG4gICAgICB9XG4gICAgICBpbnZhcmlhbnQobm90aWZpY2F0aW9uKTtcbiAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gPSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbixcbiAgICAgICAgY29kZTogZXJyb3JDb2RlLFxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25IZWFydGJlYXQgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbikge1xuICAgICAgICAvLyBJZiB0aGVyZSBoYXMgYmVlbiBleGlzdGluZyBoZWFydGJlYXQgZXJyb3Ivd2FybmluZyxcbiAgICAgICAgLy8gdGhhdCBtZWFucyBjb25uZWN0aW9uIGhhcyBiZWVuIGxvc3QgYW5kIHdlIHNoYWxsIHNob3cgYSBtZXNzYWdlIGFib3V0IGNvbm5lY3Rpb25cbiAgICAgICAgLy8gYmVpbmcgcmVzdG9yZWQgd2l0aG91dCBhIHJlY29ubmVjdCBwcm9tcHQuXG4gICAgICAgIGNvbnN0IHtub3RpZmljYXRpb259ID0gdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbjtcbiAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0Nvbm5lY3Rpb24gcmVzdG9yZWQgdG8gTnVjbGlkZSBTZXJ2ZXIgYXQ6ICcgKyBzZXJ2ZXJVcmkpO1xuICAgICAgICB0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG5vdGlmeU5ldHdvcmtBd2F5ID0gKGNvZGU6IHN0cmluZykgPT4ge1xuICAgICAgdGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCsrO1xuICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQgPj0gSEVBUlRCRUFUX0FXQVlfUkVQT1JUX0NPVU5UKSB7XG4gICAgICAgIGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbihIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX1dBUk5JTkcsIGNvZGUsXG4gICAgICAgICAgYE51Y2xpZGUgc2VydmVyIGNhbiBub3QgYmUgcmVhY2hlZCBhdCBcIiR7c2VydmVyVXJpfVwiLjxici8+YCArXG4gICAgICAgICAgJ0NoZWNrIHlvdXIgbmV0d29yayBjb25uZWN0aW9uLicsXG4gICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgLyphc2tUb1JlbG9hZCovIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25IZWFydGJlYXRFcnJvciA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgICBjb25zdCB7Y29kZSwgbWVzc2FnZSwgb3JpZ2luYWxDb2RlfSA9IGVycm9yO1xuICAgICAgdHJhY2tFdmVudCh7XG4gICAgICAgIHR5cGU6ICdoZWFydGJlYXQtZXJyb3InLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgY29kZTogY29kZSB8fCAnJyxcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8ICcnLFxuICAgICAgICAgIGhvc3Q6IHRoaXMuX2NvbmZpZy5ob3N0LFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBsb2dnZXIuaW5mbygnSGVhcnRiZWF0IG5ldHdvcmsgZXJyb3I6JywgY29kZSwgb3JpZ2luYWxDb2RlLCBtZXNzYWdlKTtcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlICdORVRXT1JLX0FXQVknOlxuICAgICAgICAgICAgLy8gTm90aWZ5IHN3aXRjaGluZyBuZXR3b3JrcywgZGlzY29ubmVjdGVkLCB0aW1lb3V0LCB1bnJlYWNoYWJsZSBzZXJ2ZXIgb3IgZnJhZ2lsZVxuICAgICAgICAgICAgLy8gY29ubmVjdGlvbi5cbiAgICAgICAgICBub3RpZnlOZXR3b3JrQXdheShjb2RlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnU0VSVkVSX0NSQVNIRUQnOlxuICAgICAgICAgICAgLy8gU2VydmVyIHNodXQgZG93biBvciBwb3J0IG5vIGxvbmdlciBhY2Nlc3NpYmxlLlxuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBzZXJ2ZXIgd2FzIHRoZXJlLCBidXQgbm93IGdvbmUuXG4gICAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IsIGNvZGUsXG4gICAgICAgICAgICAgICAgJyoqTnVjbGlkZSBTZXJ2ZXIgQ3Jhc2hlZCoqPGJyLz4nICtcbiAgICAgICAgICAgICAgICAnUGxlYXNlIHJlbG9hZCBBdG9tIHRvIHJlc3RvcmUgeW91ciByZW1vdGUgcHJvamVjdCBjb25uZWN0aW9uLicsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgICAgICAgLyphc2tUb1JlbG9hZCovIHRydWUpO1xuICAgICAgICAgICAgLy8gVE9ETyhtb3N0KSByZWNvbm5lY3QgUmVtb3RlQ29ubmVjdGlvbiwgcmVzdG9yZSB0aGUgY3VycmVudCBwcm9qZWN0IHN0YXRlLFxuICAgICAgICAgICAgLy8gYW5kIGZpbmFsbHkgY2hhbmdlIGRpc21pc3NhYmxlIHRvIGZhbHNlIGFuZCB0eXBlIHRvICdXQVJOSU5HJy5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnUE9SVF9OT1RfQUNDRVNTSUJMRSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgbmV2ZXIgaGVhcmQgYSBoZWFydGJlYXQgZnJvbSB0aGUgc2VydmVyLlxuICAgICAgICAgIGNvbnN0IHtwb3J0fSA9IHJlbW90ZVVyaS5wYXJzZShzZXJ2ZXJVcmkpO1xuICAgICAgICAgIGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbihIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SLCBjb2RlLFxuICAgICAgICAgICAgICAgICcqKk51Y2xpZGUgU2VydmVyIElzIE5vdCBSZWFjaGFibGUqKjxici8+JyArXG4gICAgICAgICAgICAgICAgYEl0IGNvdWxkIGJlIHJ1bm5pbmcgb24gYSBwb3J0IHRoYXQgaXMgbm90IGFjY2Vzc2libGU6ICR7cG9ydH0uYCxcbiAgICAgICAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAvKmFza1RvUmVsb2FkKi8gZmFsc2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdJTlZBTElEX0NFUlRJRklDQVRFJzpcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgY2xpZW50IGNlcnRpZmljYXRlIGlzIG5vdCBhY2NlcHRlZCBieSBudWNsaWRlIHNlcnZlclxuICAgICAgICAgICAgLy8gKGNlcnRpZmljYXRlIG1pc21hdGNoKS5cbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnKipDb25uZWN0aW9uIFJlc2V0IEVycm9yKio8YnIvPicgK1xuICAgICAgICAgICAgICAgICdUaGlzIGNvdWxkIGJlIGNhdXNlZCBieSB0aGUgY2xpZW50IGNlcnRpZmljYXRlIG1pc21hdGNoaW5nIHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICdzZXJ2ZXIgY2VydGlmaWNhdGUuPGJyLz4nICtcbiAgICAgICAgICAgICAgICAnUGxlYXNlIHJlbG9hZCBBdG9tIHRvIHJlc3RvcmUgeW91ciByZW1vdGUgcHJvamVjdCBjb25uZWN0aW9uLicsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgICAgICAgLyphc2tUb1JlbG9hZCovIHRydWUpO1xuICAgICAgICAgICAgLy8gVE9ETyhtb3N0KTogcmVjb25uZWN0IFJlbW90ZUNvbm5lY3Rpb24sIHJlc3RvcmUgdGhlIGN1cnJlbnQgcHJvamVjdCBzdGF0ZS5cbiAgICAgICAgICAgIC8vIGFuZCBmaW5hbGx5IGNoYW5nZSBkaXNtaXNzYWJsZSB0byBmYWxzZSBhbmQgdHlwZSB0byAnV0FSTklORycuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbm90aWZ5TmV0d29ya0F3YXkoY29kZSk7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdVbnJlY29uZ25pemVkIGhlYXJ0YmVhdCBlcnJvciBjb2RlOiAnICsgY29kZSwgbWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfTtcbiAgICBzb2NrZXQub24oJ2hlYXJ0YmVhdCcsIG9uSGVhcnRiZWF0KTtcbiAgICBzb2NrZXQub24oJ2hlYXJ0YmVhdC5lcnJvcicsIG9uSGVhcnRiZWF0RXJyb3IpO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdoZWFydGJlYXQnLCBvbkhlYXJ0YmVhdCk7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2hlYXJ0YmVhdC5lcnJvcicsIG9uSGVhcnRiZWF0RXJyb3IpO1xuICAgIH0pKTtcbiAgfVxuXG4gIGdldFVyaU9mUmVtb3RlUGF0aChyZW1vdGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbnVjbGlkZTovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9JHtyZW1vdGVQYXRofWA7XG4gIH1cblxuICBnZXRQYXRoT2ZVcmkodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiByZW1vdGVVcmkucGFyc2UodXJpKS5wYXRoO1xuICB9XG5cbiAgY3JlYXRlRGlyZWN0b3J5KHVyaTogc3RyaW5nKTogUmVtb3RlRGlyZWN0b3J5IHtcbiAgICBsZXQge3BhdGh9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKS5ub3JtYWxpemUocGF0aCk7XG5cbiAgICBsZXQgZW50cnkgPSB0aGlzLl9lbnRyaWVzW3BhdGhdO1xuICAgIGlmICghZW50cnkgfHwgZW50cnkuZ2V0TG9jYWxQYXRoKCkgIT09IHBhdGgpIHtcbiAgICAgIHRoaXMuX2VudHJpZXNbcGF0aF0gPSBlbnRyeSA9IG5ldyBSZW1vdGVEaXJlY3RvcnkoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHBhdGgpLFxuICAgICAgICB7aGdSZXBvc2l0b3J5RGVzY3JpcHRpb246IHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9ufVxuICAgICAgKTtcbiAgICAgIC8vIFRPRE86IFdlIHNob3VsZCBhZGQgdGhlIGZvbGxvd2luZyBsaW5lIHRvIGtlZXAgdGhlIGNhY2hlIHVwLXRvLWRhdGUuXG4gICAgICAvLyBXZSBuZWVkIHRvIGltcGxlbWVudCBvbkRpZFJlbmFtZSBhbmQgb25EaWREZWxldGUgaW4gUmVtb3RlRGlyZWN0b3J5XG4gICAgICAvLyBmaXJzdC4gSXQncyBvayB0aGF0IHdlIGRvbid0IGFkZCB0aGUgaGFuZGxlcnMgZm9yIG5vdyBzaW5jZSB3ZSBoYXZlXG4gICAgICAvLyB0aGUgY2hlY2sgYGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoYCBhYm92ZS5cbiAgICAgIC8vXG4gICAgICAvLyB0aGlzLl9hZGRIYW5kbGVyc0ZvckVudHJ5KGVudHJ5KTtcbiAgICB9XG5cbiAgICBpbnZhcmlhbnQoZW50cnkgaW5zdGFuY2VvZiBSZW1vdGVEaXJlY3RvcnkpO1xuICAgIGlmICghZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGlzIG5vdCBhIGRpcmVjdG9yeTonICsgdXJpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBzZWUgOjpnZXRIZ1JlcG9JbmZvIG9mIG1haW4uanMuXG4gIF9zZXRIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbihoZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb24gPSBoZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjtcbiAgfVxuXG4gIGNyZWF0ZUZpbGUodXJpOiBzdHJpbmcpOiBSZW1vdGVGaWxlIHtcbiAgICBsZXQge3BhdGh9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKS5ub3JtYWxpemUocGF0aCk7XG5cbiAgICBsZXQgZW50cnkgPSB0aGlzLl9lbnRyaWVzW3BhdGhdO1xuICAgIGlmICghZW50cnkgfHwgZW50cnkuZ2V0TG9jYWxQYXRoKCkgIT09IHBhdGgpIHtcbiAgICAgIHRoaXMuX2VudHJpZXNbcGF0aF0gPSBlbnRyeSA9IG5ldyBSZW1vdGVGaWxlKHRoaXMsIHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHBhdGgpKTtcbiAgICAgIHRoaXMuX2FkZEhhbmRsZXJzRm9yRW50cnkoZW50cnkpO1xuICAgIH1cblxuICAgIGludmFyaWFudChlbnRyeSBpbnN0YW5jZW9mIFJlbW90ZUZpbGUpO1xuICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggaXMgbm90IGEgZmlsZScpO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIF9hZGRIYW5kbGVyc0ZvckVudHJ5KGVudHJ5OiBSZW1vdGVGaWxlIHwgUmVtb3RlRGlyZWN0b3J5KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkUGF0aCA9IGVudHJ5LmdldExvY2FsUGF0aCgpO1xuICAgIC8qICRGbG93Rml4TWUgKi9cbiAgICBjb25zdCByZW5hbWVTdWJzY3JpcHRpb24gPSBlbnRyeS5vbkRpZFJlbmFtZSgoKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5fZW50cmllc1tvbGRQYXRoXTtcbiAgICAgIHRoaXMuX2VudHJpZXNbZW50cnkuZ2V0TG9jYWxQYXRoKCldID0gZW50cnk7XG4gICAgfSk7XG4gICAgLyogJEZsb3dGaXhNZSAqL1xuICAgIGNvbnN0IGRlbGV0ZVN1YnNjcmlwdGlvbiA9IGVudHJ5Lm9uRGlkRGVsZXRlKCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9lbnRyaWVzW2VudHJ5LmdldExvY2FsUGF0aCgpXTtcbiAgICAgIHJlbmFtZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICBkZWxldGVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2luaXRpYWxpemUoKTogUHJvbWlzZTxSZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgLy8gUmlnaHQgbm93IHdlIGRvbid0IHJlLWhhbmRzaGFrZS5cbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuX2dldENsaWVudCgpO1xuXG4gICAgICAvLyBUZXN0IGNvbm5lY3Rpb24gZmlyc3QuIEZpcnN0IHRpbWUgd2UgZ2V0IGhlcmUgd2UncmUgY2hlY2tpbmcgdG8gcmVlc3RhYmxpc2hcbiAgICAgIC8vIGNvbm5lY3Rpb24gdXNpbmcgY2FjaGVkIGNyZWRlbnRpYWxzLiBUaGlzIHdpbGwgZmFpbCBmYXN0IChmYXN0ZXIgdGhhbiBpbmZvU2VydmljZSlcbiAgICAgIC8vIHdoZW4gd2UgZG9uJ3QgaGF2ZSBjYWNoZWQgY3JlZGVudGlhbHMgeWV0LlxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY2xpZW50LnRlc3RDb25uZWN0aW9uKCk7XG5cbiAgICAgICAgLy8gRG8gdmVyc2lvbiBjaGVjay5cbiAgICAgICAgbGV0IHNlcnZlclZlcnNpb247XG5cbiAgICAgICAgLy8gTmVlZCB0byBzZXQgaW5pdGlhbGl6ZWQgdG8gdHJ1ZSBvcHRpbWlzdGljYWxseSBzbyB0aGF0IHdlIGNhbiBnZXQgdGhlIEluZm9TZXJ2aWNlLlxuICAgICAgICAvLyBUT0RPOiBXZSBzaG91bGRuJ3QgbmVlZCB0aGUgY2xpZW50IHRvIGdldCBhIHNlcnZpY2UuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaW5mb1NlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoJ0luZm9TZXJ2aWNlJyk7XG4gICAgICAgIHNlcnZlclZlcnNpb24gPSBhd2FpdCBpbmZvU2VydmljZS5nZXRTZXJ2ZXJWZXJzaW9uKCk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50VmVyc2lvbiA9IGdldFZlcnNpb24oKTtcbiAgICAgICAgaWYgKGNsaWVudFZlcnNpb24gIT09IHNlcnZlclZlcnNpb24pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVmVyc2lvbiBtaXNtYXRjaC4gQ2xpZW50IGF0ICR7Y2xpZW50VmVyc2lvbn0gd2hpbGUgc2VydmVyIGF0ICR7c2VydmVyVmVyc2lvbn0uYCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBGaWxlU3lzdGVtU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1NZU1RFTV9TRVJWSUNFKTtcbiAgICAgICAgdGhpcy5fY29uZmlnLmN3ZCA9IGF3YWl0IEZpbGVTeXN0ZW1TZXJ2aWNlLnJlc29sdmVSZWFsUGF0aCh0aGlzLl9jb25maWcuY3dkKTtcblxuICAgICAgICAvLyBOb3cgdGhhdCB3ZSBrbm93IHRoZSByZWFsIHBhdGgsIGl0J3MgcG9zc2libGUgdGhpcyBjb2xsaWRlcyB3aXRoIGFuIGV4aXN0aW5nIGNvbm5lY3Rpb24uXG4gICAgICAgIC8vIElmIHNvLCB3ZSBzaG91bGQganVzdCBzdG9wIGltbWVkaWF0ZWx5LlxuICAgICAgICBjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb24gPVxuICAgICAgICAgICAgUmVtb3RlQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lQW5kUGF0aCh0aGlzLl9jb25maWcuaG9zdCwgdGhpcy5fY29uZmlnLmN3ZCk7XG4gICAgICAgIGlmIChleGlzdGluZ0Nvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBleGlzdGluZ0Nvbm5lY3Rpb247XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2xpZW50LmNsb3NlKCk7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBjb25maWd1cmF0aW9uIGZvciBmdXR1cmUgdXNhZ2UuXG4gICAgICBzZXRDb25uZWN0aW9uQ29uZmlnKHRoaXMuX2NvbmZpZyk7XG5cbiAgICAgIHRoaXMuX21vbml0b3JDb25uZWN0aW9uSGVhcnRiZWF0KCk7XG5cbiAgICAgIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8uXG4gICAgICBhd2FpdCB0aGlzLl9zZXRIZ1JlcG9JbmZvKCk7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIE51Y2xpZGVVcmkgdHlwZSBjb252ZXJzaW9ucy5cbiAgICAgIGNsaWVudC5yZWdpc3RlclR5cGUoJ051Y2xpZGVVcmknLFxuICAgICAgICB1cmkgPT4gdGhpcy5nZXRQYXRoT2ZVcmkodXJpKSwgcGF0aCA9PiB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSk7XG5cbiAgICAgIC8vIFNhdmUgdG8gY2FjaGUuXG4gICAgICB0aGlzLl9hZGRDb25uZWN0aW9uKCk7XG4gICAgICB0aGlzLl93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfYWRkQ29ubmVjdGlvbigpIHtcbiAgICBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5wdXNoKHRoaXMpO1xuICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1hZGQnLCB0aGlzKTtcbiAgfVxuXG4gIF93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3REaXJlY3RvcnlVcmkgPSB0aGlzLmdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qgcm9vdERpcmVjdG90eVBhdGggPSB0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IEZpbGVXYXRjaGVyU2VydmljZTogRmlsZVdhdGNoZXJTZXJ2aWNlVHlwZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1dBVENIRVJfU0VSVklDRSk7XG4gICAgaW52YXJpYW50KEZpbGVXYXRjaGVyU2VydmljZSk7XG4gICAgY29uc3Qge3dhdGNoRGlyZWN0b3J5UmVjdXJzaXZlfSA9IEZpbGVXYXRjaGVyU2VydmljZTtcbiAgICAvLyBTdGFydCB3YXRjaGluZyB0aGUgcHJvamVjdCBmb3IgY2hhbmdlcyBhbmQgaW5pdGlhbGl6ZSB0aGUgcm9vdCB3YXRjaGVyXG4gICAgLy8gZm9yIG5leHQgY2FsbHMgdG8gYHdhdGNoRmlsZWAgYW5kIGB3YXRjaERpcmVjdG9yeWAuXG4gICAgY29uc3Qgd2F0Y2hTdHJlYW0gPSB3YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZShyb290RGlyZWN0b3J5VXJpKTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB3YXRjaFN0cmVhbS5zdWJzY3JpYmUod2F0Y2hVcGRhdGUgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXMgd2F0Y2hlZCBjb3JyZWN0bHkuXG4gICAgICAvLyBMZXQncyBqdXN0IGNvbnNvbGUgbG9nIGl0IGFueXdheS5cbiAgICAgIGxvZ2dlci5pbmZvKGBXYXRjaGVyIEZlYXR1cmVzIEluaXRpYWxpemVkIGZvciBwcm9qZWN0OiAke3Jvb3REaXJlY3RvcnlVcml9YCwgd2F0Y2hVcGRhdGUpO1xuICAgIH0sIGFzeW5jIGVycm9yID0+IHtcbiAgICAgIGxldCB3YXJuaW5nTWVzc2FnZVRvVXNlciA9IGBZb3UganVzdCBjb25uZWN0ZWQgdG8gYSByZW1vdGUgcHJvamVjdCBgICtcbiAgICAgICAgYFxcYCR7cm9vdERpcmVjdG90eVBhdGh9XFxgIGJ1dCB3ZSByZWNvbW1lbmQgeW91IHJlbW92ZSB0aGlzIGRpcmVjdG9yeSBub3cgYCArXG4gICAgICAgIGBiZWNhdXNlIGNydWNpYWwgZmVhdHVyZXMgbGlrZSBzeW5jZWQgcmVtb3RlIGZpbGUgZWRpdGluZywgZmlsZSBzZWFyY2gsIGAgK1xuICAgICAgICBgYW5kIE1lcmN1cmlhbC1yZWxhdGVkIHVwZGF0ZXMgd2lsbCBub3Qgd29yay48YnIvPmA7XG5cbiAgICAgIGNvbnN0IGxvZ2dlZEVycm9yTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3I7XG4gICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgIGBXYXRjaGVyIGZhaWxlZCB0byBzdGFydCAtIHdhdGNoZXIgZmVhdHVyZXMgZGlzYWJsZWQhIEVycm9yOiAke2xvZ2dlZEVycm9yTWVzc2FnZX1gXG4gICAgICApO1xuXG4gICAgICBjb25zdCBGaWxlU3lzdGVtU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1NZU1RFTV9TRVJWSUNFKTtcbiAgICAgIGlmIChhd2FpdCBGaWxlU3lzdGVtU2VydmljZS5pc05mcyhyb290RGlyZWN0b3R5UGF0aCkpIHtcbiAgICAgICAgd2FybmluZ01lc3NhZ2VUb1VzZXIgKz1cbiAgICAgICAgICBgVGhpcyBwcm9qZWN0IGRpcmVjdG9yeTogXFxgJHtyb290RGlyZWN0b3R5UGF0aH1cXGAgaXMgb24gPGI+XFxgTkZTXFxgPC9iPiBmaWxlc3lzdGVtLiBgICtcbiAgICAgICAgICBgTnVjbGlkZSB3b3JrcyBiZXN0IHdpdGggbG9jYWwgKG5vbi1ORlMpIHJvb3QgZGlyZWN0b3J5LmAgK1xuICAgICAgICAgIGBlLmcuIFxcYC9kYXRhL3VzZXJzLyRVU0VSXFxgYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm5pbmdNZXNzYWdlVG9Vc2VyICs9XG4gICAgICAgICAgYDxiPjxhIGhyZWY9J2h0dHBzOi8vZmFjZWJvb2suZ2l0aHViLmlvL3dhdGNobWFuLyc+V2F0Y2htYW48L2E+IEVycm9yOjwvYj5gICtcbiAgICAgICAgICBsb2dnZWRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICAvLyBBZGQgYSBwZXJzaXN0ZW50IHdhcm5pbmcgbWVzc2FnZSB0byBtYWtlIHN1cmUgdGhlIHVzZXIgc2VlcyBpdCBiZWZvcmUgZGlzbWlzc2luZy5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHdhcm5pbmdNZXNzYWdlVG9Vc2VyLCB7ZGlzbWlzc2FibGU6IHRydWV9KTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIGRvbmUgaWYgdGhlIHJvb3QgZGlyZWN0b3J5IHdhdGNoIGhhcyBlbmRlZC5cbiAgICAgIGxvZ2dlci5pbmZvKGBXYXRjaGVyIEZlYXR1cmVzIEVuZGVkIGZvciBwcm9qZWN0OiAke3Jvb3REaXJlY3RvcnlVcml9YCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIC8vIENsb3NlIHRoZSBldmVudGJ1cyB0aGF0IHdpbGwgc3RvcCB0aGUgaGVhcnRiZWF0IGludGVydmFsLCB3ZWJzb2NrZXQgcmVjb25uZWN0IHRyaWFscywgLi5ldGMuXG4gICAgaWYgKHRoaXMuX2NsaWVudCkge1xuICAgICAgdGhpcy5fY2xpZW50LmNsb3NlKCk7XG4gICAgICB0aGlzLl9jbGllbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX2Nsb3NlZCkge1xuICAgICAgLy8gRnV0dXJlIGdldENsaWVudCBjYWxscyBzaG91bGQgZmFpbCwgaWYgaXQgaGFzIGEgY2FjaGVkIFJlbW90ZUNvbm5lY3Rpb24gaW5zdGFuY2UuXG4gICAgICB0aGlzLl9jbG9zZWQgPSB0cnVlO1xuICAgICAgLy8gUmVtb3ZlIGZyb20gX2Nvbm5lY3Rpb25zIHRvIG5vdCBiZSBjb25zaWRlcmVkIGluIGZ1dHVyZSBjb25uZWN0aW9uIHF1ZXJpZXMuXG4gICAgICBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5zcGxpY2UoUmVtb3RlQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuaW5kZXhPZih0aGlzKSwgMSk7XG4gICAgICBfZW1pdHRlci5lbWl0KCdkaWQtY2xvc2UnLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXRDbGllbnQoKTogQ2xpZW50Q29tcG9uZW50IHtcbiAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlbW90ZSBjb25uZWN0aW9uIGhhcyBub3QgYmVlbiBpbml0aWFsaXplZC4nKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2Nsb3NlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZW1vdGUgY29ubmVjdGlvbiBoYXMgYmVlbiBjbG9zZWQuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRDbGllbnQoKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0Q2xpZW50KCk6IENsaWVudENvbXBvbmVudCB7XG4gICAgaWYgKCF0aGlzLl9jbGllbnQpIHtcbiAgICAgIGxldCB1cmk7XG4gICAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICAgIC8vIFVzZSBodHRwcyBpZiB3ZSBoYXZlIGtleSwgY2VydCwgYW5kIGNhXG4gICAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgICBvcHRpb25zLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgPSB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTtcbiAgICAgICAgb3B0aW9ucy5jbGllbnRDZXJ0aWZpY2F0ZSA9IHRoaXMuX2NvbmZpZy5jbGllbnRDZXJ0aWZpY2F0ZTtcbiAgICAgICAgb3B0aW9ucy5jbGllbnRLZXkgPSB0aGlzLl9jb25maWcuY2xpZW50S2V5O1xuICAgICAgICB1cmkgPSBgaHR0cHM6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmkgPSBgaHR0cDovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9YDtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlbW90ZSBjb25uZWN0aW9uIGFuZCBjbGllbnQgYXJlIGlkZW50aWZpZWQgYnkgYm90aCB0aGUgcmVtb3RlIGhvc3QgYW5kIHRoZSBpbml0YWxcbiAgICAgIC8vIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAgICAgY29uc3Qgc29ja2V0ID0gbmV3IE51Y2xpZGVTb2NrZXQodXJpLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuX2NsaWVudCA9IG5ldyBDbGllbnRDb21wb25lbnQoc29ja2V0LCBsb2FkU2VydmljZXNDb25maWcoKSk7XG4gICAgfVxuICAgIGludmFyaWFudCh0aGlzLl9jbGllbnQpO1xuICAgIHJldHVybiB0aGlzLl9jbGllbnQ7XG4gIH1cblxuICBfaXNTZWN1cmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKFxuICAgICAgICB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jb25maWcuY2xpZW50Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY29uZmlnLmNsaWVudEtleVxuICAgICk7XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuX2NvbmZpZy5ob3N0fToke3RoaXMuX2NvbmZpZy5wb3J0fWA7XG4gIH1cblxuICBnZXRQb3J0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5wb3J0O1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmhvc3Q7XG4gIH1cblxuICBnZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aCh0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKTtcbiAgfVxuXG4gIGdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcuY3dkO1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9XG5cbiAgc3RhdGljIG9uRGlkQWRkUmVtb3RlQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgb25EaWRDbG9zZVJlbW90ZUNvbm5lY3Rpb24oaGFuZGxlcjogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBfZW1pdHRlci5vbignZGlkLWNsb3NlJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRGb3JVcmkodXJpOiBOdWNsaWRlVXJpKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIGNvbnN0IHtob3N0bmFtZSwgcGF0aH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBpZiAoaG9zdG5hbWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lLCBwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY2FjaGVkIGNvbm5lY3Rpb24gbWF0Y2ggdGhlIGhvc3RuYW1lIGFuZCB0aGUgcGF0aCBoYXMgdGhlIHByZWZpeCBvZiBjb25uZWN0aW9uLmN3ZC5cbiAgICogQHBhcmFtIGhvc3RuYW1lIFRoZSBjb25uZWN0ZWQgc2VydmVyIGhvc3QgbmFtZS5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIHBhdGggdGhhdCdzIGhhcyB0aGUgcHJlZml4IG9mIGN3ZCBvZiB0aGUgY29ubmVjdGlvbi5cbiAgICogICBJZiBwYXRoIGlzIG51bGwsIGVtcHR5IG9yIHVuZGVmaW5lZCwgdGhlbiByZXR1cm4gdGhlIGNvbm5lY3Rpb24gd2hpY2ggbWF0Y2hlc1xuICAgKiAgIHRoZSBob3N0bmFtZSBhbmQgaWdub3JlIHRoZSBpbml0aWFsIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAgKi9cbiAgc3RhdGljIGdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lOiBzdHJpbmcsIHBhdGg6ID9zdHJpbmcpOiA/UmVtb3RlQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmZpbHRlcihjb25uZWN0aW9uID0+IHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCkgPT09IGhvc3RuYW1lICYmXG4gICAgICAgICAgKCFwYXRoIHx8IHBhdGguc3RhcnRzV2l0aChjb25uZWN0aW9uLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKSk7XG4gICAgfSlbMF07XG4gIH1cblxuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZShob3N0bmFtZTogc3RyaW5nKTogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5maWx0ZXIoXG4gICAgICBjb25uZWN0aW9uID0+IGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKSA9PT0gaG9zdG5hbWUsXG4gICAgKTtcbiAgfVxuXG4gIGdldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgW3NlcnZpY2VDb25maWddID0gbmV3U2VydmljZXMuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcubmFtZSA9PT0gc2VydmljZU5hbWUpO1xuICAgIGludmFyaWFudChzZXJ2aWNlQ29uZmlnICE9IG51bGwsIGBObyBjb25maWcgZm91bmQgZm9yIHNlcnZpY2UgJHtzZXJ2aWNlTmFtZX1gKTtcbiAgICByZXR1cm4gZ2V0UHJveHkoc2VydmljZUNvbmZpZy5uYW1lLCBzZXJ2aWNlQ29uZmlnLmRlZmluaXRpb24sIHRoaXMuZ2V0Q2xpZW50KCkpO1xuICB9XG5cbiAgZ2V0U29ja2V0KCk6IE51Y2xpZGVTb2NrZXQge1xuICAgIHJldHVybiB0aGlzLmdldENsaWVudCgpLmdldFNvY2tldCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSZW1vdGVDb25uZWN0aW9uLFxuICBfX3Rlc3RfXzoge1xuICAgIGNvbm5lY3Rpb25zOiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucyxcbiAgfSxcbn07XG4iXX0=