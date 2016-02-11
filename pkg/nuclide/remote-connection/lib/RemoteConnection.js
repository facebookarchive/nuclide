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

var _RemoteDirectory2 = _interopRequireDefault(_RemoteDirectory);

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

var RemoteFile = require('./RemoteFile');
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

var CONNECTION_ALREADY_EXISTS = 'A connection already exists for the specified directory.';

// key for https connection.

var _emitter = new EventEmitter();

var RemoteConnection = (function () {
  _createClass(RemoteConnection, null, [{
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
        this._entries[path] = entry = new _RemoteDirectory2['default'](this, this.getUriOfRemotePath(path), { hgRepositoryDescription: this._hgRepositoryDescription });
        // TODO: We should add the following line to keep the cache up-to-date.
        // We need to implement onDidRename and onDidDelete in RemoteDirectory
        // first. It's ok that we don't add the handlers for now since we have
        // the check `entry.getLocalPath() !== path` above.
        //
        // this._addHandlersForEntry(entry);
      }

      (0, _assert2['default'])(entry instanceof _RemoteDirectory2['default']);
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
        this._entries[path] = entry = new RemoteFile(this, this.getUriOfRemotePath(path));
        this._addHandlersForEntry(entry);
      }

      (0, _assert2['default'])(entry instanceof RemoteFile);
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
    key: 'initialize',
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
          if (RemoteConnection.getByHostnameAndPath(this._config.host, this._config.cwd) != null) {
            throw new Error(CONNECTION_ALREADY_EXISTS);
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
    value: _asyncToGenerator(function* (cwd, port) {
      var config = {
        host: 'localhost',
        port: port,
        cwd: cwd
      };
      var connection = new RemoteConnection(config);
      yield connection.initialize();
      return connection;
    })

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
        return;
      }
      var connection = undefined;
      try {
        var config = _extends({}, connectionConfig, { cwd: cwd });
        connection = new RemoteConnection(config);
        yield connection.initialize();
        return connection;
      } catch (e) {
        if (e.message === CONNECTION_ALREADY_EXISTS) {
          (0, _assert2['default'])(connection);
          return RemoteConnection.getByHostnameAndPath(connection.getRemoteHostname(), connection.getPathForInitialWorkingDirectory());
        }
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
//# sourceMappingURL=data:application/json;base64,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QUFDLENBQUMsQ0FBQztLQUNQOzs7V0FFbUIsdUJBQUMsUUFBZ0IsRUFBMkI7QUFDOUQsYUFBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUN6QyxVQUFBLFVBQVU7ZUFBSSxVQUFVLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxRQUFRO09BQUEsQ0FDMUQsQ0FBQztLQUNIOzs7U0F6Z0JHLGdCQUFnQjs7O0FBc2hCdEIsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsVUFBUSxFQUFFO0FBQ1IsZUFBVyxFQUFFLGdCQUFnQixDQUFDLFlBQVk7R0FDM0M7Q0FDRixDQUFDIiwiZmlsZSI6IlJlbW90ZUNvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5RGVzY3JpcHRpb259IGZyb20gJy4uLy4uL3NvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuXG5pbXBvcnQgdHlwZW9mICogYXMgRmlsZVdhdGNoZXJTZXJ2aWNlVHlwZSBmcm9tICcuLi8uLi9maWxld2F0Y2hlci1iYXNlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTb3VyY2VDb250cm9sU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VzL1NvdXJjZUNvbnRyb2xTZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja0V2ZW50fSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IENsaWVudENvbXBvbmVudCBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvQ2xpZW50Q29tcG9uZW50JztcbmltcG9ydCBSZW1vdGVEaXJlY3RvcnkgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnknO1xuaW1wb3J0IHtsb2FkU2VydmljZXNDb25maWd9IGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZWZyYW1ld29yay9jb25maWcnO1xuaW1wb3J0IHtnZXRQcm94eX0gZnJvbSAnLi4vLi4vc2VydmljZS1wYXJzZXInO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlZnJhbWV3b3JrJztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3Qge0V2ZW50RW1pdHRlcn0gPSByZXF1aXJlKCdldmVudHMnKTtcblxuY29uc3QgUmVtb3RlRmlsZSA9IHJlcXVpcmUoJy4vUmVtb3RlRmlsZScpO1xuY29uc3QgTnVjbGlkZVNvY2tldCA9IHJlcXVpcmUoJy4uLy4uL3NlcnZlci9saWIvTnVjbGlkZVNvY2tldCcpO1xuY29uc3Qge2dldENvbm5lY3Rpb25Db25maWcsIHNldENvbm5lY3Rpb25Db25maWd9ID1cbiAgcmVxdWlyZSgnLi9SZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbk1hbmFnZXInKTtcbmNvbnN0IHtnZXRWZXJzaW9ufSA9IHJlcXVpcmUoJy4uLy4uL3ZlcnNpb24nKTtcblxuY29uc3QgbmV3U2VydmljZXMgPSBTZXJ2aWNlRnJhbWV3b3JrLmxvYWRTZXJ2aWNlc0NvbmZpZygpO1xuXG5jb25zdCBIRUFSVEJFQVRfQVdBWV9SRVBPUlRfQ09VTlQgPSAzO1xuY29uc3QgSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiA9IDE7XG5jb25zdCBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX1dBUk5JTkcgPSAyO1xuXG5jb25zdCBGSUxFX1dBVENIRVJfU0VSVklDRSA9ICdGaWxlV2F0Y2hlclNlcnZpY2UnO1xuY29uc3QgRklMRV9TWVNURU1fU0VSVklDRSA9ICdGaWxlU3lzdGVtU2VydmljZSc7XG5cbmNvbnN0IENPTk5FQ1RJT05fQUxSRUFEWV9FWElTVFMgPSAnQSBjb25uZWN0aW9uIGFscmVhZHkgZXhpc3RzIGZvciB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS4nO1xuXG50eXBlIEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IHtcbiAgbm90aWZpY2F0aW9uOiBhdG9tJE5vdGlmaWNhdGlvbjtcbiAgY29kZTogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nOyAvLyBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb24uXG4gIHBvcnQ6IG51bWJlcjsgLy8gcG9ydCB0byBjb25uZWN0IHRvLlxuICBjd2Q6IHN0cmluZzsgLy8gUGF0aCB0byByZW1vdGUgZGlyZWN0b3J5IHVzZXIgc2hvdWxkIHN0YXJ0IGluIHVwb24gY29ubmVjdGlvbi5cbiAgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjsgLy8gY2VydGlmaWNhdGUgb2YgY2VydGlmaWNhdGUgYXV0aG9yaXR5LlxuICBjbGllbnRDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjsgLy8gY2xpZW50IGNlcnRpZmljYXRlIGZvciBodHRwcyBjb25uZWN0aW9uLlxuICBjbGllbnRLZXk/OiBCdWZmZXI7IC8vIGtleSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbn1cblxuY29uc3QgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuY2xhc3MgUmVtb3RlQ29ubmVjdGlvbiB7XG4gIF9lbnRyaWVzOiB7W3BhdGg6IHN0cmluZ106IFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3Rvcnl9O1xuICBfY29uZmlnOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbjtcbiAgX2luaXRpYWxpemVkOiA/Ym9vbDtcbiAgX2Nsb3NlZDogP2Jvb2w7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaGdSZXBvc2l0b3J5RGVzY3JpcHRpb246ID9IZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjtcbiAgX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQ6IG51bWJlcjtcbiAgX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb246ID9IZWFydGJlYXROb3RpZmljYXRpb247XG4gIF9jbGllbnQ6ID9DbGllbnRDb21wb25lbnQ7XG5cbiAgc3RhdGljIF9jb25uZWN0aW9uczogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj4gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZW50cmllcyA9IHt9O1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID0gMDtcbiAgICB0aGlzLl9jbG9zZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgX2NyZWF0ZUluc2VjdXJlQ29ubmVjdGlvbkZvclRlc3RpbmcoXG4gICAgY3dkOiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICApOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICBwb3J0LFxuICAgICAgY3dkLFxuICAgIH07XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IG5ldyBSZW1vdGVDb25uZWN0aW9uKGNvbmZpZyk7XG4gICAgYXdhaXQgY29ubmVjdGlvbi5pbml0aWFsaXplKCk7XG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgY29ubmVjdGlvbiBieSByZXVzaW5nIHRoZSBjb25maWd1cmF0aW9uIG9mIGxhc3Qgc3VjY2Vzc2Z1bCBjb25uZWN0aW9uIGFzc29jaWF0ZWQgd2l0aFxuICAgKiBnaXZlbiBob3N0LiBJZiB0aGUgc2VydmVyJ3MgY2VydHMgaGFzIGJlZW4gdXBkYXRlZCBvciB0aGVyZSBpcyBubyBwcmV2aW91cyBzdWNjZXNzZnVsXG4gICAqIGNvbm5lY3Rpb24sIG51bGwgKHJlc29sdmVkIGJ5IHByb21pc2UpIGlzIHJldHVybmVkLlxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGNyZWF0ZUNvbm5lY3Rpb25CeVNhdmVkQ29uZmlnKFxuICAgIGhvc3Q6IHN0cmluZyxcbiAgICBjd2Q6IHN0cmluZyxcbiAgKTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Db25maWcgPSBnZXRDb25uZWN0aW9uQ29uZmlnKGhvc3QpO1xuICAgIGlmICghY29ubmVjdGlvbkNvbmZpZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgY29ubmVjdGlvbjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29uZmlnID0gey4uLmNvbm5lY3Rpb25Db25maWcsIGN3ZH07XG4gICAgICBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oY29uZmlnKTtcbiAgICAgIGF3YWl0IGNvbm5lY3Rpb24uaW5pdGlhbGl6ZSgpO1xuICAgICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubWVzc2FnZSA9PT0gQ09OTkVDVElPTl9BTFJFQURZX0VYSVNUUykge1xuICAgICAgICBpbnZhcmlhbnQoY29ubmVjdGlvbik7XG4gICAgICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKFxuICAgICAgICAgIGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKSxcbiAgICAgICAgICBjb25uZWN0aW9uLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLndhcm4oYEZhaWxlZCB0byByZXVzZSBjb25uZWN0aW9uQ29uZmlndXJhdGlvbiBmb3IgJHtob3N0fWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogQXRvbSdzIFByb2plY3Q6OnNldFBhdGhzIGN1cnJlbnRseSB1c2VzXG4gIC8vIDo6cmVwb3NpdG9yeUZvckRpcmVjdG9yeVN5bmMsIHNvIHdlIG5lZWQgdGhlIHJlcG8gaW5mb3JtYXRpb24gdG8gYWxyZWFkeSBiZVxuICAvLyBhdmFpbGFibGUgd2hlbiB0aGUgbmV3IHBhdGggaXMgYWRkZWQuIHQ2OTEzNjI0IHRyYWNrcyBjbGVhbnVwIG9mIHRoaXMuXG4gIGFzeW5jIF9zZXRIZ1JlcG9JbmZvKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlbW90ZVBhdGggPSB0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IHtnZXRIZ1JlcG9zaXRvcnl9ID0gKHRoaXMuZ2V0U2VydmljZSgnU291cmNlQ29udHJvbFNlcnZpY2UnKTogU291cmNlQ29udHJvbFNlcnZpY2UpO1xuICAgIHRoaXMuX3NldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKGF3YWl0IGdldEhnUmVwb3NpdG9yeShyZW1vdGVQYXRoKSk7XG4gIH1cblxuICBfbW9uaXRvckNvbm5lY3Rpb25IZWFydGJlYXQoKSB7XG4gICAgY29uc3Qgc29ja2V0ID0gdGhpcy5nZXRTb2NrZXQoKTtcbiAgICBjb25zdCBzZXJ2ZXJVcmkgPSBzb2NrZXQuZ2V0U2VydmVyVXJpKCk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEF0b20gbm90aWZpY2F0aW9uIGZvciB0aGUgZGV0ZWN0ZWQgaGVhcnRiZWF0IG5ldHdvcmsgc3RhdHVzXG4gICAgICogVGhlIGZ1bmN0aW9uIG1ha2VzIHN1cmUgbm90IHRvIGFkZCBtYW55IG5vdGlmaWNhdGlvbnMgZm9yIHRoZSBzYW1lIGV2ZW50IGFuZCBwcmlvcml0aXplXG4gICAgICogbmV3IGV2ZW50cy5cbiAgICAgKi9cbiAgICBjb25zdCBhZGRIZWFydGJlYXROb3RpZmljYXRpb24gPSAoXG4gICAgICB0eXBlOiBudW1iZXIsXG4gICAgICBlcnJvckNvZGU6IHN0cmluZyxcbiAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgIGRpc21pc3NhYmxlOiBib29sZWFuLFxuICAgICAgYXNrVG9SZWxvYWQ6IGJvb2xlYW5cbiAgICApID0+IHtcbiAgICAgIGNvbnN0IHtjb2RlLCBub3RpZmljYXRpb246IGV4aXN0aW5nTm90aWZpY2F0aW9ufSA9IHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gfHwge307XG4gICAgICBpZiAoY29kZSAmJiBjb2RlID09PSBlcnJvckNvZGUgJiYgZGlzbWlzc2FibGUpIHtcbiAgICAgICAgLy8gQSBkaXNtaXNzaWJsZSBoZWFydGJlYXQgbm90aWZpY2F0aW9uIHdpdGggdGhpcyBjb2RlIGlzIGFscmVhZHkgYWN0aXZlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsZXQgbm90aWZpY2F0aW9uID0gbnVsbDtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZGlzbWlzc2FibGUsIGJ1dHRvbnM6IFtdfTtcbiAgICAgIGlmIChhc2tUb1JlbG9hZCkge1xuICAgICAgICBvcHRpb25zLmJ1dHRvbnMucHVzaCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnaWNvbiBpY29uLXphcCcsXG4gICAgICAgICAgb25EaWRDbGljaygpIHsgYXRvbS5yZWxvYWQoKTsgfSxcbiAgICAgICAgICB0ZXh0OiAnUmVsb2FkIEF0b20nLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1I6XG4gICAgICAgICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEhFQVJUQkVBVF9OT1RJRklDQVRJT05fV0FSTklORzpcbiAgICAgICAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VucmVjb25nbml6ZWQgaGVhcnRiZWF0IG5vdGlmaWNhdGlvbiB0eXBlJyk7XG4gICAgICB9XG4gICAgICBpZiAoZXhpc3RpbmdOb3RpZmljYXRpb24pIHtcbiAgICAgICAgZXhpc3RpbmdOb3RpZmljYXRpb24uZGlzbWlzcygpO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KG5vdGlmaWNhdGlvbik7XG4gICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uID0ge1xuICAgICAgICBub3RpZmljYXRpb24sXG4gICAgICAgIGNvZGU6IGVycm9yQ29kZSxcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IG9uSGVhcnRiZWF0ID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24pIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaGFzIGJlZW4gZXhpc3RpbmcgaGVhcnRiZWF0IGVycm9yL3dhcm5pbmcsXG4gICAgICAgIC8vIHRoYXQgbWVhbnMgY29ubmVjdGlvbiBoYXMgYmVlbiBsb3N0IGFuZCB3ZSBzaGFsbCBzaG93IGEgbWVzc2FnZSBhYm91dCBjb25uZWN0aW9uXG4gICAgICAgIC8vIGJlaW5nIHJlc3RvcmVkIHdpdGhvdXQgYSByZWNvbm5lY3QgcHJvbXB0LlxuICAgICAgICBjb25zdCB7bm90aWZpY2F0aW9ufSA9IHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb247XG4gICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb25uZWN0aW9uIHJlc3RvcmVkIHRvIE51Y2xpZGUgU2VydmVyIGF0OiAnICsgc2VydmVyVXJpKTtcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBub3RpZnlOZXR3b3JrQXdheSA9IChjb2RlOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQrKztcbiAgICAgIGlmICh0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID49IEhFQVJUQkVBVF9BV0FZX1JFUE9SVF9DT1VOVCkge1xuICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HLCBjb2RlLFxuICAgICAgICAgIGBOdWNsaWRlIHNlcnZlciBjYW4gbm90IGJlIHJlYWNoZWQgYXQgXCIke3NlcnZlclVyaX1cIi48YnIvPmAgK1xuICAgICAgICAgICdDaGVjayB5b3VyIG5ldHdvcmsgY29ubmVjdGlvbi4nLFxuICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyBmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uSGVhcnRiZWF0RXJyb3IgPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgY29uc3Qge2NvZGUsIG1lc3NhZ2UsIG9yaWdpbmFsQ29kZX0gPSBlcnJvcjtcbiAgICAgIHRyYWNrRXZlbnQoe1xuICAgICAgICB0eXBlOiAnaGVhcnRiZWF0LWVycm9yJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGNvZGU6IGNvZGUgfHwgJycsXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSB8fCAnJyxcbiAgICAgICAgICBob3N0OiB0aGlzLl9jb25maWcuaG9zdCxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgbG9nZ2VyLmluZm8oJ0hlYXJ0YmVhdCBuZXR3b3JrIGVycm9yOicsIGNvZGUsIG9yaWdpbmFsQ29kZSwgbWVzc2FnZSk7XG4gICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSAnTkVUV09SS19BV0FZJzpcbiAgICAgICAgICAgIC8vIE5vdGlmeSBzd2l0Y2hpbmcgbmV0d29ya3MsIGRpc2Nvbm5lY3RlZCwgdGltZW91dCwgdW5yZWFjaGFibGUgc2VydmVyIG9yIGZyYWdpbGVcbiAgICAgICAgICAgIC8vIGNvbm5lY3Rpb24uXG4gICAgICAgICAgbm90aWZ5TmV0d29ya0F3YXkoY29kZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1NFUlZFUl9DUkFTSEVEJzpcbiAgICAgICAgICAgIC8vIFNlcnZlciBzaHV0IGRvd24gb3IgcG9ydCBubyBsb25nZXIgYWNjZXNzaWJsZS5cbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgc2VydmVyIHdhcyB0aGVyZSwgYnV0IG5vdyBnb25lLlxuICAgICAgICAgIGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbihIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SLCBjb2RlLFxuICAgICAgICAgICAgICAgICcqKk51Y2xpZGUgU2VydmVyIENyYXNoZWQqKjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSByZWxvYWQgQXRvbSB0byByZXN0b3JlIHlvdXIgcmVtb3RlIHByb2plY3QgY29ubmVjdGlvbi4nLFxuICAgICAgICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyB0cnVlKTtcbiAgICAgICAgICAgIC8vIFRPRE8obW9zdCkgcmVjb25uZWN0IFJlbW90ZUNvbm5lY3Rpb24sIHJlc3RvcmUgdGhlIGN1cnJlbnQgcHJvamVjdCBzdGF0ZSxcbiAgICAgICAgICAgIC8vIGFuZCBmaW5hbGx5IGNoYW5nZSBkaXNtaXNzYWJsZSB0byBmYWxzZSBhbmQgdHlwZSB0byAnV0FSTklORycuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1BPUlRfTk9UX0FDQ0VTU0lCTEUnOlxuICAgICAgICAgICAgLy8gTm90aWZ5IG5ldmVyIGhlYXJkIGEgaGVhcnRiZWF0IGZyb20gdGhlIHNlcnZlci5cbiAgICAgICAgICBjb25zdCB7cG9ydH0gPSByZW1vdGVVcmkucGFyc2Uoc2VydmVyVXJpKTtcbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnKipOdWNsaWRlIFNlcnZlciBJcyBOb3QgUmVhY2hhYmxlKio8YnIvPicgK1xuICAgICAgICAgICAgICAgIGBJdCBjb3VsZCBiZSBydW5uaW5nIG9uIGEgcG9ydCB0aGF0IGlzIG5vdCBhY2Nlc3NpYmxlOiAke3BvcnR9LmAsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgICAgICAgLyphc2tUb1JlbG9hZCovIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnSU5WQUxJRF9DRVJUSUZJQ0FURSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBpcyBub3QgYWNjZXB0ZWQgYnkgbnVjbGlkZSBzZXJ2ZXJcbiAgICAgICAgICAgIC8vIChjZXJ0aWZpY2F0ZSBtaXNtYXRjaCkuXG4gICAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IsIGNvZGUsXG4gICAgICAgICAgICAgICAgJyoqQ29ubmVjdGlvbiBSZXNldCBFcnJvcioqPGJyLz4nICtcbiAgICAgICAgICAgICAgICAnVGhpcyBjb3VsZCBiZSBjYXVzZWQgYnkgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBtaXNtYXRjaGluZyB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAnc2VydmVyIGNlcnRpZmljYXRlLjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSByZWxvYWQgQXRvbSB0byByZXN0b3JlIHlvdXIgcmVtb3RlIHByb2plY3QgY29ubmVjdGlvbi4nLFxuICAgICAgICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyB0cnVlKTtcbiAgICAgICAgICAgIC8vIFRPRE8obW9zdCk6IHJlY29ubmVjdCBSZW1vdGVDb25uZWN0aW9uLCByZXN0b3JlIHRoZSBjdXJyZW50IHByb2plY3Qgc3RhdGUuXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSBjaGFuZ2UgZGlzbWlzc2FibGUgdG8gZmFsc2UgYW5kIHR5cGUgdG8gJ1dBUk5JTkcnLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG5vdGlmeU5ldHdvcmtBd2F5KGNvZGUpO1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignVW5yZWNvbmduaXplZCBoZWFydGJlYXQgZXJyb3IgY29kZTogJyArIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9uKCdoZWFydGJlYXQnLCBvbkhlYXJ0YmVhdCk7XG4gICAgc29ja2V0Lm9uKCdoZWFydGJlYXQuZXJyb3InLCBvbkhlYXJ0YmVhdEVycm9yKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignaGVhcnRiZWF0Jywgb25IZWFydGJlYXQpO1xuICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdoZWFydGJlYXQuZXJyb3InLCBvbkhlYXJ0YmVhdEVycm9yKTtcbiAgICB9KSk7XG4gIH1cblxuICBnZXRVcmlPZlJlbW90ZVBhdGgocmVtb3RlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG51Y2xpZGU6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfSR7cmVtb3RlUGF0aH1gO1xuICB9XG5cbiAgZ2V0UGF0aE9mVXJpKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVtb3RlVXJpLnBhcnNlKHVyaSkucGF0aDtcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdG9yeSh1cmk6IHN0cmluZyk6IFJlbW90ZURpcmVjdG9yeSB7XG4gICAgbGV0IHtwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJykubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRGlyZWN0b3J5KFxuICAgICAgICB0aGlzLFxuICAgICAgICB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSxcbiAgICAgICAge2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbn1cbiAgICAgICk7XG4gICAgICAvLyBUT0RPOiBXZSBzaG91bGQgYWRkIHRoZSBmb2xsb3dpbmcgbGluZSB0byBrZWVwIHRoZSBjYWNoZSB1cC10by1kYXRlLlxuICAgICAgLy8gV2UgbmVlZCB0byBpbXBsZW1lbnQgb25EaWRSZW5hbWUgYW5kIG9uRGlkRGVsZXRlIGluIFJlbW90ZURpcmVjdG9yeVxuICAgICAgLy8gZmlyc3QuIEl0J3Mgb2sgdGhhdCB3ZSBkb24ndCBhZGQgdGhlIGhhbmRsZXJzIGZvciBub3cgc2luY2Ugd2UgaGF2ZVxuICAgICAgLy8gdGhlIGNoZWNrIGBlbnRyeS5nZXRMb2NhbFBhdGgoKSAhPT0gcGF0aGAgYWJvdmUuXG4gICAgICAvL1xuICAgICAgLy8gdGhpcy5fYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeSk7XG4gICAgfVxuXG4gICAgaW52YXJpYW50KGVudHJ5IGluc3RhbmNlb2YgUmVtb3RlRGlyZWN0b3J5KTtcbiAgICBpZiAoIWVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGF0aCBpcyBub3QgYSBkaXJlY3Rvcnk6JyArIHVyaSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mbyBvZiBtYWluLmpzLlxuICBfc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oaGdSZXBvc2l0b3J5RGVzY3JpcHRpb246ID9IZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uID0gaGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIH1cblxuICBjcmVhdGVGaWxlKHVyaTogc3RyaW5nKTogUmVtb3RlRmlsZSB7XG4gICAgbGV0IHtwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJykubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRmlsZSh0aGlzLCB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSk7XG4gICAgICB0aGlzLl9hZGRIYW5kbGVyc0ZvckVudHJ5KGVudHJ5KTtcbiAgICB9XG5cbiAgICBpbnZhcmlhbnQoZW50cnkgaW5zdGFuY2VvZiBSZW1vdGVGaWxlKTtcbiAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGlzIG5vdCBhIGZpbGUnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICBfYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeTogUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeSk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFBhdGggPSBlbnRyeS5nZXRMb2NhbFBhdGgoKTtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgY29uc3QgcmVuYW1lU3Vic2NyaXB0aW9uID0gZW50cnkub25EaWRSZW5hbWUoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2VudHJpZXNbb2xkUGF0aF07XG4gICAgICB0aGlzLl9lbnRyaWVzW2VudHJ5LmdldExvY2FsUGF0aCgpXSA9IGVudHJ5O1xuICAgIH0pO1xuICAgIC8qICRGbG93Rml4TWUgKi9cbiAgICBjb25zdCBkZWxldGVTdWJzY3JpcHRpb24gPSBlbnRyeS5vbkRpZERlbGV0ZSgoKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5fZW50cmllc1tlbnRyeS5nZXRMb2NhbFBhdGgoKV07XG4gICAgICByZW5hbWVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgZGVsZXRlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmlnaHQgbm93IHdlIGRvbid0IHJlLWhhbmRzaGFrZS5cbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuX2dldENsaWVudCgpO1xuXG4gICAgICAvLyBUZXN0IGNvbm5lY3Rpb24gZmlyc3QuIEZpcnN0IHRpbWUgd2UgZ2V0IGhlcmUgd2UncmUgY2hlY2tpbmcgdG8gcmVlc3RhYmxpc2hcbiAgICAgIC8vIGNvbm5lY3Rpb24gdXNpbmcgY2FjaGVkIGNyZWRlbnRpYWxzLiBUaGlzIHdpbGwgZmFpbCBmYXN0IChmYXN0ZXIgdGhhbiBpbmZvU2VydmljZSlcbiAgICAgIC8vIHdoZW4gd2UgZG9uJ3QgaGF2ZSBjYWNoZWQgY3JlZGVudGlhbHMgeWV0LlxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY2xpZW50LnRlc3RDb25uZWN0aW9uKCk7XG5cbiAgICAgICAgLy8gRG8gdmVyc2lvbiBjaGVjay5cbiAgICAgICAgbGV0IHNlcnZlclZlcnNpb247XG5cbiAgICAgICAgLy8gTmVlZCB0byBzZXQgaW5pdGlhbGl6ZWQgdG8gdHJ1ZSBvcHRpbWlzdGljYWxseSBzbyB0aGF0IHdlIGNhbiBnZXQgdGhlIEluZm9TZXJ2aWNlLlxuICAgICAgICAvLyBUT0RPOiBXZSBzaG91bGRuJ3QgbmVlZCB0aGUgY2xpZW50IHRvIGdldCBhIHNlcnZpY2UuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaW5mb1NlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoJ0luZm9TZXJ2aWNlJyk7XG4gICAgICAgIHNlcnZlclZlcnNpb24gPSBhd2FpdCBpbmZvU2VydmljZS5nZXRTZXJ2ZXJWZXJzaW9uKCk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50VmVyc2lvbiA9IGdldFZlcnNpb24oKTtcbiAgICAgICAgaWYgKGNsaWVudFZlcnNpb24gIT09IHNlcnZlclZlcnNpb24pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVmVyc2lvbiBtaXNtYXRjaC4gQ2xpZW50IGF0ICR7Y2xpZW50VmVyc2lvbn0gd2hpbGUgc2VydmVyIGF0ICR7c2VydmVyVmVyc2lvbn0uYCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBGaWxlU3lzdGVtU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1NZU1RFTV9TRVJWSUNFKTtcbiAgICAgICAgdGhpcy5fY29uZmlnLmN3ZCA9IGF3YWl0IEZpbGVTeXN0ZW1TZXJ2aWNlLnJlc29sdmVSZWFsUGF0aCh0aGlzLl9jb25maWcuY3dkKTtcblxuICAgICAgICAvLyBOb3cgdGhhdCB3ZSBrbm93IHRoZSByZWFsIHBhdGgsIGl0J3MgcG9zc2libGUgdGhpcyBjb2xsaWRlcyB3aXRoIGFuIGV4aXN0aW5nIGNvbm5lY3Rpb24uXG4gICAgICAgIC8vIElmIHNvLCB3ZSBzaG91bGQganVzdCBzdG9wIGltbWVkaWF0ZWx5LlxuICAgICAgICBpZiAoUmVtb3RlQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lQW5kUGF0aCh0aGlzLl9jb25maWcuaG9zdCwgdGhpcy5fY29uZmlnLmN3ZCkgIT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihDT05ORUNUSU9OX0FMUkVBRFlfRVhJU1RTKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjbGllbnQuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cblxuICAgICAgLy8gU3RvcmUgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIGZ1dHVyZSB1c2FnZS5cbiAgICAgIHNldENvbm5lY3Rpb25Db25maWcodGhpcy5fY29uZmlnKTtcblxuICAgICAgdGhpcy5fbW9uaXRvckNvbm5lY3Rpb25IZWFydGJlYXQoKTtcblxuICAgICAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mby5cbiAgICAgIGF3YWl0IHRoaXMuX3NldEhnUmVwb0luZm8oKTtcblxuICAgICAgLy8gUmVnaXN0ZXIgTnVjbGlkZVVyaSB0eXBlIGNvbnZlcnNpb25zLlxuICAgICAgY2xpZW50LnJlZ2lzdGVyVHlwZSgnTnVjbGlkZVVyaScsXG4gICAgICAgIHVyaSA9PiB0aGlzLmdldFBhdGhPZlVyaSh1cmkpLCBwYXRoID0+IHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHBhdGgpKTtcblxuICAgICAgLy8gU2F2ZSB0byBjYWNoZS5cbiAgICAgIHRoaXMuX2FkZENvbm5lY3Rpb24oKTtcbiAgICAgIHRoaXMuX3dhdGNoUm9vdFByb2plY3REaXJlY3RvcnkoKTtcbiAgICB9XG4gIH1cblxuICBfYWRkQ29ubmVjdGlvbigpIHtcbiAgICBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5wdXNoKHRoaXMpO1xuICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1hZGQnLCB0aGlzKTtcbiAgfVxuXG4gIF93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3REaXJlY3RvcnlVcmkgPSB0aGlzLmdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qgcm9vdERpcmVjdG90eVBhdGggPSB0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IEZpbGVXYXRjaGVyU2VydmljZTogRmlsZVdhdGNoZXJTZXJ2aWNlVHlwZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1dBVENIRVJfU0VSVklDRSk7XG4gICAgaW52YXJpYW50KEZpbGVXYXRjaGVyU2VydmljZSk7XG4gICAgY29uc3Qge3dhdGNoRGlyZWN0b3J5UmVjdXJzaXZlfSA9IEZpbGVXYXRjaGVyU2VydmljZTtcbiAgICAvLyBTdGFydCB3YXRjaGluZyB0aGUgcHJvamVjdCBmb3IgY2hhbmdlcyBhbmQgaW5pdGlhbGl6ZSB0aGUgcm9vdCB3YXRjaGVyXG4gICAgLy8gZm9yIG5leHQgY2FsbHMgdG8gYHdhdGNoRmlsZWAgYW5kIGB3YXRjaERpcmVjdG9yeWAuXG4gICAgY29uc3Qgd2F0Y2hTdHJlYW0gPSB3YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZShyb290RGlyZWN0b3J5VXJpKTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB3YXRjaFN0cmVhbS5zdWJzY3JpYmUod2F0Y2hVcGRhdGUgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXMgd2F0Y2hlZCBjb3JyZWN0bHkuXG4gICAgICAvLyBMZXQncyBqdXN0IGNvbnNvbGUgbG9nIGl0IGFueXdheS5cbiAgICAgIGxvZ2dlci5pbmZvKGBXYXRjaGVyIEZlYXR1cmVzIEluaXRpYWxpemVkIGZvciBwcm9qZWN0OiAke3Jvb3REaXJlY3RvcnlVcml9YCwgd2F0Y2hVcGRhdGUpO1xuICAgIH0sIGFzeW5jIGVycm9yID0+IHtcbiAgICAgIGxldCB3YXJuaW5nTWVzc2FnZVRvVXNlciA9IGBZb3UganVzdCBjb25uZWN0ZWQgdG8gYSByZW1vdGUgcHJvamVjdCBgICtcbiAgICAgICAgYFxcYCR7cm9vdERpcmVjdG90eVBhdGh9XFxgIGJ1dCB3ZSByZWNvbW1lbmQgeW91IHJlbW92ZSB0aGlzIGRpcmVjdG9yeSBub3cgYCArXG4gICAgICAgIGBiZWNhdXNlIGNydWNpYWwgZmVhdHVyZXMgbGlrZSBzeW5jZWQgcmVtb3RlIGZpbGUgZWRpdGluZywgZmlsZSBzZWFyY2gsIGAgK1xuICAgICAgICBgYW5kIE1lcmN1cmlhbC1yZWxhdGVkIHVwZGF0ZXMgd2lsbCBub3Qgd29yay48YnIvPmA7XG5cbiAgICAgIGNvbnN0IGxvZ2dlZEVycm9yTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3I7XG4gICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgIGBXYXRjaGVyIGZhaWxlZCB0byBzdGFydCAtIHdhdGNoZXIgZmVhdHVyZXMgZGlzYWJsZWQhIEVycm9yOiAke2xvZ2dlZEVycm9yTWVzc2FnZX1gXG4gICAgICApO1xuXG4gICAgICBjb25zdCBGaWxlU3lzdGVtU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1NZU1RFTV9TRVJWSUNFKTtcbiAgICAgIGlmIChhd2FpdCBGaWxlU3lzdGVtU2VydmljZS5pc05mcyhyb290RGlyZWN0b3R5UGF0aCkpIHtcbiAgICAgICAgd2FybmluZ01lc3NhZ2VUb1VzZXIgKz1cbiAgICAgICAgICBgVGhpcyBwcm9qZWN0IGRpcmVjdG9yeTogXFxgJHtyb290RGlyZWN0b3R5UGF0aH1cXGAgaXMgb24gPGI+XFxgTkZTXFxgPC9iPiBmaWxlc3lzdGVtLiBgICtcbiAgICAgICAgICBgTnVjbGlkZSB3b3JrcyBiZXN0IHdpdGggbG9jYWwgKG5vbi1ORlMpIHJvb3QgZGlyZWN0b3J5LmAgK1xuICAgICAgICAgIGBlLmcuIFxcYC9kYXRhL3VzZXJzLyRVU0VSXFxgYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm5pbmdNZXNzYWdlVG9Vc2VyICs9XG4gICAgICAgICAgYDxiPjxhIGhyZWY9J2h0dHBzOi8vZmFjZWJvb2suZ2l0aHViLmlvL3dhdGNobWFuLyc+V2F0Y2htYW48L2E+IEVycm9yOjwvYj5gICtcbiAgICAgICAgICBsb2dnZWRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICAvLyBBZGQgYSBwZXJzaXN0ZW50IHdhcm5pbmcgbWVzc2FnZSB0byBtYWtlIHN1cmUgdGhlIHVzZXIgc2VlcyBpdCBiZWZvcmUgZGlzbWlzc2luZy5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHdhcm5pbmdNZXNzYWdlVG9Vc2VyLCB7ZGlzbWlzc2FibGU6IHRydWV9KTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIGRvbmUgaWYgdGhlIHJvb3QgZGlyZWN0b3J5IHdhdGNoIGhhcyBlbmRlZC5cbiAgICAgIGxvZ2dlci5pbmZvKGBXYXRjaGVyIEZlYXR1cmVzIEVuZGVkIGZvciBwcm9qZWN0OiAke3Jvb3REaXJlY3RvcnlVcml9YCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIC8vIENsb3NlIHRoZSBldmVudGJ1cyB0aGF0IHdpbGwgc3RvcCB0aGUgaGVhcnRiZWF0IGludGVydmFsLCB3ZWJzb2NrZXQgcmVjb25uZWN0IHRyaWFscywgLi5ldGMuXG4gICAgaWYgKHRoaXMuX2NsaWVudCkge1xuICAgICAgdGhpcy5fY2xpZW50LmNsb3NlKCk7XG4gICAgICB0aGlzLl9jbGllbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX2Nsb3NlZCkge1xuICAgICAgLy8gRnV0dXJlIGdldENsaWVudCBjYWxscyBzaG91bGQgZmFpbCwgaWYgaXQgaGFzIGEgY2FjaGVkIFJlbW90ZUNvbm5lY3Rpb24gaW5zdGFuY2UuXG4gICAgICB0aGlzLl9jbG9zZWQgPSB0cnVlO1xuICAgICAgLy8gUmVtb3ZlIGZyb20gX2Nvbm5lY3Rpb25zIHRvIG5vdCBiZSBjb25zaWRlcmVkIGluIGZ1dHVyZSBjb25uZWN0aW9uIHF1ZXJpZXMuXG4gICAgICBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5zcGxpY2UoUmVtb3RlQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuaW5kZXhPZih0aGlzKSwgMSk7XG4gICAgICBfZW1pdHRlci5lbWl0KCdkaWQtY2xvc2UnLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXRDbGllbnQoKTogQ2xpZW50Q29tcG9uZW50IHtcbiAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlbW90ZSBjb25uZWN0aW9uIGhhcyBub3QgYmVlbiBpbml0aWFsaXplZC4nKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2Nsb3NlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZW1vdGUgY29ubmVjdGlvbiBoYXMgYmVlbiBjbG9zZWQuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRDbGllbnQoKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0Q2xpZW50KCk6IENsaWVudENvbXBvbmVudCB7XG4gICAgaWYgKCF0aGlzLl9jbGllbnQpIHtcbiAgICAgIGxldCB1cmk7XG4gICAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICAgIC8vIFVzZSBodHRwcyBpZiB3ZSBoYXZlIGtleSwgY2VydCwgYW5kIGNhXG4gICAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgICBvcHRpb25zLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgPSB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTtcbiAgICAgICAgb3B0aW9ucy5jbGllbnRDZXJ0aWZpY2F0ZSA9IHRoaXMuX2NvbmZpZy5jbGllbnRDZXJ0aWZpY2F0ZTtcbiAgICAgICAgb3B0aW9ucy5jbGllbnRLZXkgPSB0aGlzLl9jb25maWcuY2xpZW50S2V5O1xuICAgICAgICB1cmkgPSBgaHR0cHM6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmkgPSBgaHR0cDovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9YDtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlbW90ZSBjb25uZWN0aW9uIGFuZCBjbGllbnQgYXJlIGlkZW50aWZpZWQgYnkgYm90aCB0aGUgcmVtb3RlIGhvc3QgYW5kIHRoZSBpbml0YWxcbiAgICAgIC8vIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAgICAgY29uc3Qgc29ja2V0ID0gbmV3IE51Y2xpZGVTb2NrZXQodXJpLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuX2NsaWVudCA9IG5ldyBDbGllbnRDb21wb25lbnQoc29ja2V0LCBsb2FkU2VydmljZXNDb25maWcoKSk7XG4gICAgfVxuICAgIGludmFyaWFudCh0aGlzLl9jbGllbnQpO1xuICAgIHJldHVybiB0aGlzLl9jbGllbnQ7XG4gIH1cblxuICBfaXNTZWN1cmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKFxuICAgICAgICB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jb25maWcuY2xpZW50Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY29uZmlnLmNsaWVudEtleVxuICAgICk7XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuX2NvbmZpZy5ob3N0fToke3RoaXMuX2NvbmZpZy5wb3J0fWA7XG4gIH1cblxuICBnZXRQb3J0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5wb3J0O1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmhvc3Q7XG4gIH1cblxuICBnZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aCh0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKTtcbiAgfVxuXG4gIGdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcuY3dkO1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9XG5cbiAgc3RhdGljIG9uRGlkQWRkUmVtb3RlQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgb25EaWRDbG9zZVJlbW90ZUNvbm5lY3Rpb24oaGFuZGxlcjogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBfZW1pdHRlci5vbignZGlkLWNsb3NlJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRGb3JVcmkodXJpOiBOdWNsaWRlVXJpKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIGNvbnN0IHtob3N0bmFtZSwgcGF0aH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBpZiAoaG9zdG5hbWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lLCBwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY2FjaGVkIGNvbm5lY3Rpb24gbWF0Y2ggdGhlIGhvc3RuYW1lIGFuZCB0aGUgcGF0aCBoYXMgdGhlIHByZWZpeCBvZiBjb25uZWN0aW9uLmN3ZC5cbiAgICogQHBhcmFtIGhvc3RuYW1lIFRoZSBjb25uZWN0ZWQgc2VydmVyIGhvc3QgbmFtZS5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIHBhdGggdGhhdCdzIGhhcyB0aGUgcHJlZml4IG9mIGN3ZCBvZiB0aGUgY29ubmVjdGlvbi5cbiAgICogICBJZiBwYXRoIGlzIG51bGwsIGVtcHR5IG9yIHVuZGVmaW5lZCwgdGhlbiByZXR1cm4gdGhlIGNvbm5lY3Rpb24gd2hpY2ggbWF0Y2hlc1xuICAgKiAgIHRoZSBob3N0bmFtZSBhbmQgaWdub3JlIHRoZSBpbml0aWFsIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAgKi9cbiAgc3RhdGljIGdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lOiBzdHJpbmcsIHBhdGg6ID9zdHJpbmcpOiA/UmVtb3RlQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmZpbHRlcihjb25uZWN0aW9uID0+IHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCkgPT09IGhvc3RuYW1lICYmXG4gICAgICAgICAgKCFwYXRoIHx8IHBhdGguc3RhcnRzV2l0aChjb25uZWN0aW9uLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKSk7XG4gICAgfSlbMF07XG4gIH1cblxuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZShob3N0bmFtZTogc3RyaW5nKTogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5maWx0ZXIoXG4gICAgICBjb25uZWN0aW9uID0+IGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKSA9PT0gaG9zdG5hbWUsXG4gICAgKTtcbiAgfVxuXG4gIGdldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgW3NlcnZpY2VDb25maWddID0gbmV3U2VydmljZXMuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcubmFtZSA9PT0gc2VydmljZU5hbWUpO1xuICAgIGludmFyaWFudChzZXJ2aWNlQ29uZmlnICE9IG51bGwsIGBObyBjb25maWcgZm91bmQgZm9yIHNlcnZpY2UgJHtzZXJ2aWNlTmFtZX1gKTtcbiAgICByZXR1cm4gZ2V0UHJveHkoc2VydmljZUNvbmZpZy5uYW1lLCBzZXJ2aWNlQ29uZmlnLmRlZmluaXRpb24sIHRoaXMuZ2V0Q2xpZW50KCkpO1xuICB9XG5cbiAgZ2V0U29ja2V0KCk6IE51Y2xpZGVTb2NrZXQge1xuICAgIHJldHVybiB0aGlzLmdldENsaWVudCgpLmdldFNvY2tldCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSZW1vdGVDb25uZWN0aW9uLFxuICBfX3Rlc3RfXzoge1xuICAgIGNvbm5lY3Rpb25zOiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucyxcbiAgfSxcbn07XG4iXX0=