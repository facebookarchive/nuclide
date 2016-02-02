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

// Taken from the error message in
// https://github.com/facebook/watchman/blob/99dde8ee3f13233be097c036147748b2d7f8bfa7/tests/integration/rootrestrict.php#L58
var WATCHMAN_ERROR_MESSAGE_FOR_ENFORCE_ROOT_FILES_REGEX = /global config root_files/;

var FILE_WATCHER_SERVICE = 'FileWatcherService';

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

      var _getService = this.getService('SourceControlService');

      var getHgRepository = _getService.getHgRepository;

      var hgRepoDescription = yield getHgRepository(remotePath);
      this._setHgRepositoryDescription(hgRepoDescription);
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

          var FileSystemService = this.getService('FileSystemService');
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
      var rootDirectoryUri = this.getUriForInitialWorkingDirectory();
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
      }, function (error) {
        var warningMessageToUser = 'You just connected to a remote project ' + ('(' + rootDirectoryUri + '), but we recommend you remove this directory now!') + '<br/><br/> The directory you connected to could not be watched by watchman, ' + 'so crucial features like synced remote file editing, file search, ' + 'and Mercurial-related updates will not work.';
        var loggedErrorMessage = error.message || error;
        if (loggedErrorMessage.match(WATCHMAN_ERROR_MESSAGE_FOR_ENFORCE_ROOT_FILES_REGEX)) {
          warningMessageToUser += '<br/><br/>You need to connect to a different root directory, ' + 'because the watchman on the server you are connecting to is configured to not allow ' + ('you to watch ' + rootDirectoryUri + '. You may have luck connecting to a deeper ') + 'directory, because often watchman is configured to only allow watching ' + 'certain subdirectories (often roots or subdirectories of source control repositories).';
        }
        // Add a persistent warning message to make sure the user sees it before dismissing.
        atom.notifications.addWarning(warningMessageToUser, { dismissable: true });
        logger.error('Watcher failed to start - watcher features disabled! Error: ' + loggedErrorMessage);
      }, function () {
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
//# sourceMappingURL=data:application/json;base64,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LGlCQUFpQixFQUFFLEtBQUssUUFBUTtPQUFBLENBQzFELENBQUM7S0FDSDs7O1NBbmdCRyxnQkFBZ0I7OztBQWdoQnRCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLFVBQVEsRUFBRTtBQUNSLGVBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxZQUFZO0dBQzNDO0NBQ0YsQ0FBQyIsImZpbGUiOiJSZW1vdGVDb25uZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeURlc2NyaXB0aW9ufSBmcm9tICcuLi8uLi9zb3VyY2UtY29udHJvbC1oZWxwZXJzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja0V2ZW50fSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IENsaWVudENvbXBvbmVudCBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvQ2xpZW50Q29tcG9uZW50JztcbmltcG9ydCBSZW1vdGVEaXJlY3RvcnkgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnknO1xuaW1wb3J0IHtsb2FkU2VydmljZXNDb25maWd9IGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZWZyYW1ld29yay9jb25maWcnO1xuaW1wb3J0IHtnZXRQcm94eX0gZnJvbSAnLi4vLi4vc2VydmljZS1wYXJzZXInO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlZnJhbWV3b3JrJztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3Qge0V2ZW50RW1pdHRlcn0gPSByZXF1aXJlKCdldmVudHMnKTtcblxuY29uc3QgUmVtb3RlRmlsZSA9IHJlcXVpcmUoJy4vUmVtb3RlRmlsZScpO1xuY29uc3QgTnVjbGlkZVNvY2tldCA9IHJlcXVpcmUoJy4uLy4uL3NlcnZlci9saWIvTnVjbGlkZVNvY2tldCcpO1xuY29uc3Qge2dldENvbm5lY3Rpb25Db25maWcsIHNldENvbm5lY3Rpb25Db25maWd9ID1cbiAgcmVxdWlyZSgnLi9SZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbk1hbmFnZXInKTtcbmNvbnN0IHtnZXRWZXJzaW9ufSA9IHJlcXVpcmUoJy4uLy4uL3ZlcnNpb24nKTtcblxuY29uc3QgbmV3U2VydmljZXMgPSBTZXJ2aWNlRnJhbWV3b3JrLmxvYWRTZXJ2aWNlc0NvbmZpZygpO1xuXG5jb25zdCBIRUFSVEJFQVRfQVdBWV9SRVBPUlRfQ09VTlQgPSAzO1xuY29uc3QgSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiA9IDE7XG5jb25zdCBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX1dBUk5JTkcgPSAyO1xuXG4vLyBUYWtlbiBmcm9tIHRoZSBlcnJvciBtZXNzYWdlIGluXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svd2F0Y2htYW4vYmxvYi85OWRkZThlZTNmMTMyMzNiZTA5N2MwMzYxNDc3NDhiMmQ3ZjhiZmE3L3Rlc3RzL2ludGVncmF0aW9uL3Jvb3RyZXN0cmljdC5waHAjTDU4XG5jb25zdCBXQVRDSE1BTl9FUlJPUl9NRVNTQUdFX0ZPUl9FTkZPUkNFX1JPT1RfRklMRVNfUkVHRVggPSAvZ2xvYmFsIGNvbmZpZyByb290X2ZpbGVzLztcblxuY29uc3QgRklMRV9XQVRDSEVSX1NFUlZJQ0UgPSAnRmlsZVdhdGNoZXJTZXJ2aWNlJztcblxuY29uc3QgQ09OTkVDVElPTl9BTFJFQURZX0VYSVNUUyA9ICdBIGNvbm5lY3Rpb24gYWxyZWFkeSBleGlzdHMgZm9yIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5Lic7XG5cbnR5cGUgSGVhcnRiZWF0Tm90aWZpY2F0aW9uID0ge1xuICBub3RpZmljYXRpb246IGF0b20kTm90aWZpY2F0aW9uO1xuICBjb2RlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uID0ge1xuICBob3N0OiBzdHJpbmc7IC8vIGhvc3QgbnVjbGlkZSBzZXJ2ZXIgaXMgcnVubmluZyBvbi5cbiAgcG9ydDogbnVtYmVyOyAvLyBwb3J0IHRvIGNvbm5lY3QgdG8uXG4gIGN3ZDogc3RyaW5nOyAvLyBQYXRoIHRvIHJlbW90ZSBkaXJlY3RvcnkgdXNlciBzaG91bGQgc3RhcnQgaW4gdXBvbiBjb25uZWN0aW9uLlxuICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlPzogQnVmZmVyOyAvLyBjZXJ0aWZpY2F0ZSBvZiBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXG4gIGNsaWVudENlcnRpZmljYXRlPzogQnVmZmVyOyAvLyBjbGllbnQgY2VydGlmaWNhdGUgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG4gIGNsaWVudEtleT86IEJ1ZmZlcjsgLy8ga2V5IGZvciBodHRwcyBjb25uZWN0aW9uLlxufVxuXG5jb25zdCBfZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5jbGFzcyBSZW1vdGVDb25uZWN0aW9uIHtcbiAgX2VudHJpZXM6IHtbcGF0aDogc3RyaW5nXTogUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeX07XG4gIF9jb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uO1xuICBfaW5pdGlhbGl6ZWQ6ID9ib29sO1xuICBfY2xvc2VkOiA/Ym9vbDtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICBfaGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudDogbnVtYmVyO1xuICBfbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbjogP0hlYXJ0YmVhdE5vdGlmaWNhdGlvbjtcbiAgX2NsaWVudDogP0NsaWVudENvbXBvbmVudDtcblxuICBzdGF0aWMgX2Nvbm5lY3Rpb25zOiBBcnJheTxSZW1vdGVDb25uZWN0aW9uPiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9lbnRyaWVzID0ge307XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQgPSAwO1xuICAgIHRoaXMuX2Nsb3NlZCA9IGZhbHNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBfY3JlYXRlSW5zZWN1cmVDb25uZWN0aW9uRm9yVGVzdGluZyhcbiAgICBjd2Q6IHN0cmluZyxcbiAgICBwb3J0OiBudW1iZXIsXG4gICk6IFByb21pc2U8P1JlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgIHBvcnQsXG4gICAgICBjd2QsXG4gICAgfTtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oY29uZmlnKTtcbiAgICBhd2FpdCBjb25uZWN0aW9uLmluaXRpYWxpemUoKTtcbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjb25uZWN0aW9uIGJ5IHJldXNpbmcgdGhlIGNvbmZpZ3VyYXRpb24gb2YgbGFzdCBzdWNjZXNzZnVsIGNvbm5lY3Rpb24gYXNzb2NpYXRlZCB3aXRoXG4gICAqIGdpdmVuIGhvc3QuIElmIHRoZSBzZXJ2ZXIncyBjZXJ0cyBoYXMgYmVlbiB1cGRhdGVkIG9yIHRoZXJlIGlzIG5vIHByZXZpb3VzIHN1Y2Nlc3NmdWxcbiAgICogY29ubmVjdGlvbiwgbnVsbCAocmVzb2x2ZWQgYnkgcHJvbWlzZSkgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY3JlYXRlQ29ubmVjdGlvbkJ5U2F2ZWRDb25maWcoXG4gICAgaG9zdDogc3RyaW5nLFxuICAgIGN3ZDogc3RyaW5nLFxuICApOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29ubmVjdGlvbkNvbmZpZyA9IGdldENvbm5lY3Rpb25Db25maWcoaG9zdCk7XG4gICAgaWYgKCFjb25uZWN0aW9uQ29uZmlnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjb25uZWN0aW9uO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb25maWcgPSB7Li4uY29ubmVjdGlvbkNvbmZpZywgY3dkfTtcbiAgICAgIGNvbm5lY3Rpb24gPSBuZXcgUmVtb3RlQ29ubmVjdGlvbihjb25maWcpO1xuICAgICAgYXdhaXQgY29ubmVjdGlvbi5pbml0aWFsaXplKCk7XG4gICAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5tZXNzYWdlID09PSBDT05ORUNUSU9OX0FMUkVBRFlfRVhJU1RTKSB7XG4gICAgICAgIGludmFyaWFudChjb25uZWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZUFuZFBhdGgoXG4gICAgICAgICAgY29ubmVjdGlvbi5nZXRSZW1vdGVIb3N0bmFtZSgpLFxuICAgICAgICAgIGNvbm5lY3Rpb24uZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHJldXNlIGNvbm5lY3Rpb25Db25maWd1cmF0aW9uIGZvciAke2hvc3R9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBBdG9tJ3MgUHJvamVjdDo6c2V0UGF0aHMgY3VycmVudGx5IHVzZXNcbiAgLy8gOjpyZXBvc2l0b3J5Rm9yRGlyZWN0b3J5U3luYywgc28gd2UgbmVlZCB0aGUgcmVwbyBpbmZvcm1hdGlvbiB0byBhbHJlYWR5IGJlXG4gIC8vIGF2YWlsYWJsZSB3aGVuIHRoZSBuZXcgcGF0aCBpcyBhZGRlZC4gdDY5MTM2MjQgdHJhY2tzIGNsZWFudXAgb2YgdGhpcy5cbiAgYXN5bmMgX3NldEhnUmVwb0luZm8oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVtb3RlUGF0aCA9IHRoaXMuZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qge2dldEhnUmVwb3NpdG9yeX0gPSB0aGlzLmdldFNlcnZpY2UoJ1NvdXJjZUNvbnRyb2xTZXJ2aWNlJyk7XG4gICAgY29uc3QgaGdSZXBvRGVzY3JpcHRpb24gPSBhd2FpdCBnZXRIZ1JlcG9zaXRvcnkocmVtb3RlUGF0aCk7XG4gICAgdGhpcy5fc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oaGdSZXBvRGVzY3JpcHRpb24pO1xuICB9XG5cbiAgX21vbml0b3JDb25uZWN0aW9uSGVhcnRiZWF0KCkge1xuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuZ2V0U29ja2V0KCk7XG4gICAgY29uc3Qgc2VydmVyVXJpID0gc29ja2V0LmdldFNlcnZlclVyaSgpO1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBBdG9tIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRldGVjdGVkIGhlYXJ0YmVhdCBuZXR3b3JrIHN0YXR1c1xuICAgICAqIFRoZSBmdW5jdGlvbiBtYWtlcyBzdXJlIG5vdCB0byBhZGQgbWFueSBub3RpZmljYXRpb25zIGZvciB0aGUgc2FtZSBldmVudCBhbmQgcHJpb3JpdGl6ZVxuICAgICAqIG5ldyBldmVudHMuXG4gICAgICovXG4gICAgY29uc3QgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uID0gKFxuICAgICAgdHlwZTogbnVtYmVyLFxuICAgICAgZXJyb3JDb2RlOiBzdHJpbmcsXG4gICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICBkaXNtaXNzYWJsZTogYm9vbGVhbixcbiAgICAgIGFza1RvUmVsb2FkOiBib29sZWFuXG4gICAgKSA9PiB7XG4gICAgICBjb25zdCB7Y29kZSwgbm90aWZpY2F0aW9uOiBleGlzdGluZ05vdGlmaWNhdGlvbn0gPSB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uIHx8IHt9O1xuICAgICAgaWYgKGNvZGUgJiYgY29kZSA9PT0gZXJyb3JDb2RlICYmIGRpc21pc3NhYmxlKSB7XG4gICAgICAgIC8vIEEgZGlzbWlzc2libGUgaGVhcnRiZWF0IG5vdGlmaWNhdGlvbiB3aXRoIHRoaXMgY29kZSBpcyBhbHJlYWR5IGFjdGl2ZS5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IG51bGw7XG4gICAgICBjb25zdCBvcHRpb25zID0ge2Rpc21pc3NhYmxlLCBidXR0b25zOiBbXX07XG4gICAgICBpZiAoYXNrVG9SZWxvYWQpIHtcbiAgICAgICAgb3B0aW9ucy5idXR0b25zLnB1c2goe1xuICAgICAgICAgIGNsYXNzTmFtZTogJ2ljb24gaWNvbi16YXAnLFxuICAgICAgICAgIG9uRGlkQ2xpY2soKSB7IGF0b20ucmVsb2FkKCk7IH0sXG4gICAgICAgICAgdGV4dDogJ1JlbG9hZCBBdG9tJyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SOlxuICAgICAgICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX1dBUk5JTkc6XG4gICAgICAgICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29uZ25pemVkIGhlYXJ0YmVhdCBub3RpZmljYXRpb24gdHlwZScpO1xuICAgICAgfVxuICAgICAgaWYgKGV4aXN0aW5nTm90aWZpY2F0aW9uKSB7XG4gICAgICAgIGV4aXN0aW5nTm90aWZpY2F0aW9uLmRpc21pc3MoKTtcbiAgICAgIH1cbiAgICAgIGludmFyaWFudChub3RpZmljYXRpb24pO1xuICAgICAgdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IHtcbiAgICAgICAgbm90aWZpY2F0aW9uLFxuICAgICAgICBjb2RlOiBlcnJvckNvZGUsXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCBvbkhlYXJ0YmVhdCA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uKSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGhhcyBiZWVuIGV4aXN0aW5nIGhlYXJ0YmVhdCBlcnJvci93YXJuaW5nLFxuICAgICAgICAvLyB0aGF0IG1lYW5zIGNvbm5lY3Rpb24gaGFzIGJlZW4gbG9zdCBhbmQgd2Ugc2hhbGwgc2hvdyBhIG1lc3NhZ2UgYWJvdXQgY29ubmVjdGlvblxuICAgICAgICAvLyBiZWluZyByZXN0b3JlZCB3aXRob3V0IGEgcmVjb25uZWN0IHByb21wdC5cbiAgICAgICAgY29uc3Qge25vdGlmaWNhdGlvbn0gPSB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uO1xuICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnQ29ubmVjdGlvbiByZXN0b3JlZCB0byBOdWNsaWRlIFNlcnZlciBhdDogJyArIHNlcnZlclVyaSk7XG4gICAgICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQgPSAwO1xuICAgICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgbm90aWZ5TmV0d29ya0F3YXkgPSAoY29kZTogc3RyaW5nKSA9PiB7XG4gICAgICB0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50Kys7XG4gICAgICBpZiAodGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCA+PSBIRUFSVEJFQVRfQVdBWV9SRVBPUlRfQ09VTlQpIHtcbiAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fV0FSTklORywgY29kZSxcbiAgICAgICAgICBgTnVjbGlkZSBzZXJ2ZXIgY2FuIG5vdCBiZSByZWFjaGVkIGF0IFwiJHtzZXJ2ZXJVcml9XCIuPGJyLz5gICtcbiAgICAgICAgICAnQ2hlY2sgeW91ciBuZXR3b3JrIGNvbm5lY3Rpb24uJyxcbiAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSxcbiAgICAgICAgICAvKmFza1RvUmVsb2FkKi8gZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbkhlYXJ0YmVhdEVycm9yID0gKGVycm9yOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHtjb2RlLCBtZXNzYWdlLCBvcmlnaW5hbENvZGV9ID0gZXJyb3I7XG4gICAgICB0cmFja0V2ZW50KHtcbiAgICAgICAgdHlwZTogJ2hlYXJ0YmVhdC1lcnJvcicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBjb2RlOiBjb2RlIHx8ICcnLFxuICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UgfHwgJycsXG4gICAgICAgICAgaG9zdDogdGhpcy5fY29uZmlnLmhvc3QsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci5pbmZvKCdIZWFydGJlYXQgbmV0d29yayBlcnJvcjonLCBjb2RlLCBvcmlnaW5hbENvZGUsIG1lc3NhZ2UpO1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgJ05FVFdPUktfQVdBWSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgc3dpdGNoaW5nIG5ldHdvcmtzLCBkaXNjb25uZWN0ZWQsIHRpbWVvdXQsIHVucmVhY2hhYmxlIHNlcnZlciBvciBmcmFnaWxlXG4gICAgICAgICAgICAvLyBjb25uZWN0aW9uLlxuICAgICAgICAgIG5vdGlmeU5ldHdvcmtBd2F5KGNvZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdTRVJWRVJfQ1JBU0hFRCc6XG4gICAgICAgICAgICAvLyBTZXJ2ZXIgc2h1dCBkb3duIG9yIHBvcnQgbm8gbG9uZ2VyIGFjY2Vzc2libGUuXG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHNlcnZlciB3YXMgdGhlcmUsIGJ1dCBub3cgZ29uZS5cbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnKipOdWNsaWRlIFNlcnZlciBDcmFzaGVkKio8YnIvPicgK1xuICAgICAgICAgICAgICAgICdQbGVhc2UgcmVsb2FkIEF0b20gdG8gcmVzdG9yZSB5b3VyIHJlbW90ZSBwcm9qZWN0IGNvbm5lY3Rpb24uJyxcbiAgICAgICAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAvKmFza1RvUmVsb2FkKi8gdHJ1ZSk7XG4gICAgICAgICAgICAvLyBUT0RPKG1vc3QpIHJlY29ubmVjdCBSZW1vdGVDb25uZWN0aW9uLCByZXN0b3JlIHRoZSBjdXJyZW50IHByb2plY3Qgc3RhdGUsXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSBjaGFuZ2UgZGlzbWlzc2FibGUgdG8gZmFsc2UgYW5kIHR5cGUgdG8gJ1dBUk5JTkcnLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdQT1JUX05PVF9BQ0NFU1NJQkxFJzpcbiAgICAgICAgICAgIC8vIE5vdGlmeSBuZXZlciBoZWFyZCBhIGhlYXJ0YmVhdCBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgY29uc3Qge3BvcnR9ID0gcmVtb3RlVXJpLnBhcnNlKHNlcnZlclVyaSk7XG4gICAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IsIGNvZGUsXG4gICAgICAgICAgICAgICAgJyoqTnVjbGlkZSBTZXJ2ZXIgSXMgTm90IFJlYWNoYWJsZSoqPGJyLz4nICtcbiAgICAgICAgICAgICAgICBgSXQgY291bGQgYmUgcnVubmluZyBvbiBhIHBvcnQgdGhhdCBpcyBub3QgYWNjZXNzaWJsZTogJHtwb3J0fS5gLFxuICAgICAgICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyBmYWxzZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0lOVkFMSURfQ0VSVElGSUNBVEUnOlxuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBjbGllbnQgY2VydGlmaWNhdGUgaXMgbm90IGFjY2VwdGVkIGJ5IG51Y2xpZGUgc2VydmVyXG4gICAgICAgICAgICAvLyAoY2VydGlmaWNhdGUgbWlzbWF0Y2gpLlxuICAgICAgICAgIGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbihIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SLCBjb2RlLFxuICAgICAgICAgICAgICAgICcqKkNvbm5lY3Rpb24gUmVzZXQgRXJyb3IqKjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1RoaXMgY291bGQgYmUgY2F1c2VkIGJ5IHRoZSBjbGllbnQgY2VydGlmaWNhdGUgbWlzbWF0Y2hpbmcgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgJ3NlcnZlciBjZXJ0aWZpY2F0ZS48YnIvPicgK1xuICAgICAgICAgICAgICAgICdQbGVhc2UgcmVsb2FkIEF0b20gdG8gcmVzdG9yZSB5b3VyIHJlbW90ZSBwcm9qZWN0IGNvbm5lY3Rpb24uJyxcbiAgICAgICAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAvKmFza1RvUmVsb2FkKi8gdHJ1ZSk7XG4gICAgICAgICAgICAvLyBUT0RPKG1vc3QpOiByZWNvbm5lY3QgUmVtb3RlQ29ubmVjdGlvbiwgcmVzdG9yZSB0aGUgY3VycmVudCBwcm9qZWN0IHN0YXRlLlxuICAgICAgICAgICAgLy8gYW5kIGZpbmFsbHkgY2hhbmdlIGRpc21pc3NhYmxlIHRvIGZhbHNlIGFuZCB0eXBlIHRvICdXQVJOSU5HJy5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBub3RpZnlOZXR3b3JrQXdheShjb2RlKTtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1VucmVjb25nbml6ZWQgaGVhcnRiZWF0IGVycm9yIGNvZGU6ICcgKyBjb2RlLCBtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbignaGVhcnRiZWF0Jywgb25IZWFydGJlYXQpO1xuICAgIHNvY2tldC5vbignaGVhcnRiZWF0LmVycm9yJywgb25IZWFydGJlYXRFcnJvcik7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2hlYXJ0YmVhdCcsIG9uSGVhcnRiZWF0KTtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignaGVhcnRiZWF0LmVycm9yJywgb25IZWFydGJlYXRFcnJvcik7XG4gICAgfSkpO1xuICB9XG5cbiAgZ2V0VXJpT2ZSZW1vdGVQYXRoKHJlbW90ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBudWNsaWRlOi8vJHt0aGlzLmdldFJlbW90ZUhvc3QoKX0ke3JlbW90ZVBhdGh9YDtcbiAgfVxuXG4gIGdldFBhdGhPZlVyaSh1cmk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHJlbW90ZVVyaS5wYXJzZSh1cmkpLnBhdGg7XG4gIH1cblxuICBjcmVhdGVEaXJlY3RvcnkodXJpOiBzdHJpbmcpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGxldCB7cGF0aH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBwYXRoID0gcmVxdWlyZSgncGF0aCcpLm5vcm1hbGl6ZShwYXRoKTtcblxuICAgIGxldCBlbnRyeSA9IHRoaXMuX2VudHJpZXNbcGF0aF07XG4gICAgaWYgKCFlbnRyeSB8fCBlbnRyeS5nZXRMb2NhbFBhdGgoKSAhPT0gcGF0aCkge1xuICAgICAgdGhpcy5fZW50cmllc1twYXRoXSA9IGVudHJ5ID0gbmV3IFJlbW90ZURpcmVjdG9yeShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgocGF0aCksXG4gICAgICAgIHtoZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb259XG4gICAgICApO1xuICAgICAgLy8gVE9ETzogV2Ugc2hvdWxkIGFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8ga2VlcCB0aGUgY2FjaGUgdXAtdG8tZGF0ZS5cbiAgICAgIC8vIFdlIG5lZWQgdG8gaW1wbGVtZW50IG9uRGlkUmVuYW1lIGFuZCBvbkRpZERlbGV0ZSBpbiBSZW1vdGVEaXJlY3RvcnlcbiAgICAgIC8vIGZpcnN0LiBJdCdzIG9rIHRoYXQgd2UgZG9uJ3QgYWRkIHRoZSBoYW5kbGVycyBmb3Igbm93IHNpbmNlIHdlIGhhdmVcbiAgICAgIC8vIHRoZSBjaGVjayBgZW50cnkuZ2V0TG9jYWxQYXRoKCkgIT09IHBhdGhgIGFib3ZlLlxuICAgICAgLy9cbiAgICAgIC8vIHRoaXMuX2FkZEhhbmRsZXJzRm9yRW50cnkoZW50cnkpO1xuICAgIH1cblxuICAgIGludmFyaWFudChlbnRyeSBpbnN0YW5jZW9mIFJlbW90ZURpcmVjdG9yeSk7XG4gICAgaWYgKCFlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggaXMgbm90IGEgZGlyZWN0b3J5OicgKyB1cmkpO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8gb2YgbWFpbi5qcy5cbiAgX3NldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKGhnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiBIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uID0gaGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIH1cblxuICBjcmVhdGVGaWxlKHVyaTogc3RyaW5nKTogUmVtb3RlRmlsZSB7XG4gICAgbGV0IHtwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJykubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRmlsZSh0aGlzLCB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSk7XG4gICAgICB0aGlzLl9hZGRIYW5kbGVyc0ZvckVudHJ5KGVudHJ5KTtcbiAgICB9XG5cbiAgICBpbnZhcmlhbnQoZW50cnkgaW5zdGFuY2VvZiBSZW1vdGVGaWxlKTtcbiAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGlzIG5vdCBhIGZpbGUnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICBfYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeTogUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeSk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFBhdGggPSBlbnRyeS5nZXRMb2NhbFBhdGgoKTtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgY29uc3QgcmVuYW1lU3Vic2NyaXB0aW9uID0gZW50cnkub25EaWRSZW5hbWUoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2VudHJpZXNbb2xkUGF0aF07XG4gICAgICB0aGlzLl9lbnRyaWVzW2VudHJ5LmdldExvY2FsUGF0aCgpXSA9IGVudHJ5O1xuICAgIH0pO1xuICAgIC8qICRGbG93Rml4TWUgKi9cbiAgICBjb25zdCBkZWxldGVTdWJzY3JpcHRpb24gPSBlbnRyeS5vbkRpZERlbGV0ZSgoKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5fZW50cmllc1tlbnRyeS5nZXRMb2NhbFBhdGgoKV07XG4gICAgICByZW5hbWVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgZGVsZXRlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmlnaHQgbm93IHdlIGRvbid0IHJlLWhhbmRzaGFrZS5cbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuX2dldENsaWVudCgpO1xuXG4gICAgICAvLyBUZXN0IGNvbm5lY3Rpb24gZmlyc3QuIEZpcnN0IHRpbWUgd2UgZ2V0IGhlcmUgd2UncmUgY2hlY2tpbmcgdG8gcmVlc3RhYmxpc2hcbiAgICAgIC8vIGNvbm5lY3Rpb24gdXNpbmcgY2FjaGVkIGNyZWRlbnRpYWxzLiBUaGlzIHdpbGwgZmFpbCBmYXN0IChmYXN0ZXIgdGhhbiBpbmZvU2VydmljZSlcbiAgICAgIC8vIHdoZW4gd2UgZG9uJ3QgaGF2ZSBjYWNoZWQgY3JlZGVudGlhbHMgeWV0LlxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY2xpZW50LnRlc3RDb25uZWN0aW9uKCk7XG5cbiAgICAgICAgLy8gRG8gdmVyc2lvbiBjaGVjay5cbiAgICAgICAgbGV0IHNlcnZlclZlcnNpb247XG5cbiAgICAgICAgLy8gTmVlZCB0byBzZXQgaW5pdGlhbGl6ZWQgdG8gdHJ1ZSBvcHRpbWlzdGljYWxseSBzbyB0aGF0IHdlIGNhbiBnZXQgdGhlIEluZm9TZXJ2aWNlLlxuICAgICAgICAvLyBUT0RPOiBXZSBzaG91bGRuJ3QgbmVlZCB0aGUgY2xpZW50IHRvIGdldCBhIHNlcnZpY2UuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaW5mb1NlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoJ0luZm9TZXJ2aWNlJyk7XG4gICAgICAgIHNlcnZlclZlcnNpb24gPSBhd2FpdCBpbmZvU2VydmljZS5nZXRTZXJ2ZXJWZXJzaW9uKCk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50VmVyc2lvbiA9IGdldFZlcnNpb24oKTtcbiAgICAgICAgaWYgKGNsaWVudFZlcnNpb24gIT09IHNlcnZlclZlcnNpb24pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVmVyc2lvbiBtaXNtYXRjaC4gQ2xpZW50IGF0ICR7Y2xpZW50VmVyc2lvbn0gd2hpbGUgc2VydmVyIGF0ICR7c2VydmVyVmVyc2lvbn0uYCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBGaWxlU3lzdGVtU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZSgnRmlsZVN5c3RlbVNlcnZpY2UnKTtcbiAgICAgICAgdGhpcy5fY29uZmlnLmN3ZCA9IGF3YWl0IEZpbGVTeXN0ZW1TZXJ2aWNlLnJlc29sdmVSZWFsUGF0aCh0aGlzLl9jb25maWcuY3dkKTtcblxuICAgICAgICAvLyBOb3cgdGhhdCB3ZSBrbm93IHRoZSByZWFsIHBhdGgsIGl0J3MgcG9zc2libGUgdGhpcyBjb2xsaWRlcyB3aXRoIGFuIGV4aXN0aW5nIGNvbm5lY3Rpb24uXG4gICAgICAgIC8vIElmIHNvLCB3ZSBzaG91bGQganVzdCBzdG9wIGltbWVkaWF0ZWx5LlxuICAgICAgICBpZiAoUmVtb3RlQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lQW5kUGF0aCh0aGlzLl9jb25maWcuaG9zdCwgdGhpcy5fY29uZmlnLmN3ZCkgIT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihDT05ORUNUSU9OX0FMUkVBRFlfRVhJU1RTKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjbGllbnQuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cblxuICAgICAgLy8gU3RvcmUgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIGZ1dHVyZSB1c2FnZS5cbiAgICAgIHNldENvbm5lY3Rpb25Db25maWcodGhpcy5fY29uZmlnKTtcblxuICAgICAgdGhpcy5fbW9uaXRvckNvbm5lY3Rpb25IZWFydGJlYXQoKTtcblxuICAgICAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mby5cbiAgICAgIGF3YWl0IHRoaXMuX3NldEhnUmVwb0luZm8oKTtcblxuICAgICAgLy8gUmVnaXN0ZXIgTnVjbGlkZVVyaSB0eXBlIGNvbnZlcnNpb25zLlxuICAgICAgY2xpZW50LnJlZ2lzdGVyVHlwZSgnTnVjbGlkZVVyaScsXG4gICAgICAgIHVyaSA9PiB0aGlzLmdldFBhdGhPZlVyaSh1cmkpLCBwYXRoID0+IHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHBhdGgpKTtcblxuICAgICAgLy8gU2F2ZSB0byBjYWNoZS5cbiAgICAgIHRoaXMuX2FkZENvbm5lY3Rpb24oKTtcbiAgICAgIHRoaXMuX3dhdGNoUm9vdFByb2plY3REaXJlY3RvcnkoKTtcbiAgICB9XG4gIH1cblxuICBfYWRkQ29ubmVjdGlvbigpIHtcbiAgICBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5wdXNoKHRoaXMpO1xuICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1hZGQnLCB0aGlzKTtcbiAgfVxuXG4gIF93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3REaXJlY3RvcnlVcmkgPSB0aGlzLmdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3QgRmlsZVdhdGNoZXJTZXJ2aWNlID0gdGhpcy5nZXRTZXJ2aWNlKEZJTEVfV0FUQ0hFUl9TRVJWSUNFKTtcbiAgICBpbnZhcmlhbnQoRmlsZVdhdGNoZXJTZXJ2aWNlKTtcbiAgICBjb25zdCB7d2F0Y2hEaXJlY3RvcnlSZWN1cnNpdmV9ID0gRmlsZVdhdGNoZXJTZXJ2aWNlO1xuICAgIC8vIFN0YXJ0IHdhdGNoaW5nIHRoZSBwcm9qZWN0IGZvciBjaGFuZ2VzIGFuZCBpbml0aWFsaXplIHRoZSByb290IHdhdGNoZXJcbiAgICAvLyBmb3IgbmV4dCBjYWxscyB0byBgd2F0Y2hGaWxlYCBhbmQgYHdhdGNoRGlyZWN0b3J5YC5cbiAgICBjb25zdCB3YXRjaFN0cmVhbSA9IHdhdGNoRGlyZWN0b3J5UmVjdXJzaXZlKHJvb3REaXJlY3RvcnlVcmkpO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHdhdGNoU3RyZWFtLnN1YnNjcmliZSh3YXRjaFVwZGF0ZSA9PiB7XG4gICAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIGRvbmUgaWYgdGhlIHJvb3QgZGlyZWN0b3J5IHdhcyB3YXRjaGVkIGNvcnJlY3RseS5cbiAgICAgIC8vIExldCdzIGp1c3QgY29uc29sZSBsb2cgaXQgYW55d2F5LlxuICAgICAgbG9nZ2VyLmluZm8oYFdhdGNoZXIgRmVhdHVyZXMgSW5pdGlhbGl6ZWQgZm9yIHByb2plY3Q6ICR7cm9vdERpcmVjdG9yeVVyaX1gLCB3YXRjaFVwZGF0ZSk7XG4gICAgfSwgZXJyb3IgPT4ge1xuICAgICAgbGV0IHdhcm5pbmdNZXNzYWdlVG9Vc2VyID0gYFlvdSBqdXN0IGNvbm5lY3RlZCB0byBhIHJlbW90ZSBwcm9qZWN0IGAgK1xuICAgICAgICBgKCR7cm9vdERpcmVjdG9yeVVyaX0pLCBidXQgd2UgcmVjb21tZW5kIHlvdSByZW1vdmUgdGhpcyBkaXJlY3Rvcnkgbm93IWAgK1xuICAgICAgICBgPGJyLz48YnIvPiBUaGUgZGlyZWN0b3J5IHlvdSBjb25uZWN0ZWQgdG8gY291bGQgbm90IGJlIHdhdGNoZWQgYnkgd2F0Y2htYW4sIGAgK1xuICAgICAgICBgc28gY3J1Y2lhbCBmZWF0dXJlcyBsaWtlIHN5bmNlZCByZW1vdGUgZmlsZSBlZGl0aW5nLCBmaWxlIHNlYXJjaCwgYCArXG4gICAgICAgIGBhbmQgTWVyY3VyaWFsLXJlbGF0ZWQgdXBkYXRlcyB3aWxsIG5vdCB3b3JrLmA7XG4gICAgICBjb25zdCBsb2dnZWRFcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlIHx8IGVycm9yO1xuICAgICAgaWYgKGxvZ2dlZEVycm9yTWVzc2FnZS5tYXRjaChXQVRDSE1BTl9FUlJPUl9NRVNTQUdFX0ZPUl9FTkZPUkNFX1JPT1RfRklMRVNfUkVHRVgpKSB7XG4gICAgICAgIHdhcm5pbmdNZXNzYWdlVG9Vc2VyICs9IGA8YnIvPjxici8+WW91IG5lZWQgdG8gY29ubmVjdCB0byBhIGRpZmZlcmVudCByb290IGRpcmVjdG9yeSwgYCArXG4gICAgICAgIGBiZWNhdXNlIHRoZSB3YXRjaG1hbiBvbiB0aGUgc2VydmVyIHlvdSBhcmUgY29ubmVjdGluZyB0byBpcyBjb25maWd1cmVkIHRvIG5vdCBhbGxvdyBgICtcbiAgICAgICAgYHlvdSB0byB3YXRjaCAke3Jvb3REaXJlY3RvcnlVcml9LiBZb3UgbWF5IGhhdmUgbHVjayBjb25uZWN0aW5nIHRvIGEgZGVlcGVyIGAgK1xuICAgICAgICBgZGlyZWN0b3J5LCBiZWNhdXNlIG9mdGVuIHdhdGNobWFuIGlzIGNvbmZpZ3VyZWQgdG8gb25seSBhbGxvdyB3YXRjaGluZyBgICtcbiAgICAgICAgYGNlcnRhaW4gc3ViZGlyZWN0b3JpZXMgKG9mdGVuIHJvb3RzIG9yIHN1YmRpcmVjdG9yaWVzIG9mIHNvdXJjZSBjb250cm9sIHJlcG9zaXRvcmllcykuYDtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBhIHBlcnNpc3RlbnQgd2FybmluZyBtZXNzYWdlIHRvIG1ha2Ugc3VyZSB0aGUgdXNlciBzZWVzIGl0IGJlZm9yZSBkaXNtaXNzaW5nLlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcod2FybmluZ01lc3NhZ2VUb1VzZXIsIHtkaXNtaXNzYWJsZTogdHJ1ZX0pO1xuICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgIGBXYXRjaGVyIGZhaWxlZCB0byBzdGFydCAtIHdhdGNoZXIgZmVhdHVyZXMgZGlzYWJsZWQhIEVycm9yOiAke2xvZ2dlZEVycm9yTWVzc2FnZX1gKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIGRvbmUgaWYgdGhlIHJvb3QgZGlyZWN0b3J5IHdhdGNoIGhhcyBlbmRlZC5cbiAgICAgIGxvZ2dlci5pbmZvKGBXYXRjaGVyIEZlYXR1cmVzIEVuZGVkIGZvciBwcm9qZWN0OiAke3Jvb3REaXJlY3RvcnlVcml9YCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIC8vIENsb3NlIHRoZSBldmVudGJ1cyB0aGF0IHdpbGwgc3RvcCB0aGUgaGVhcnRiZWF0IGludGVydmFsLCB3ZWJzb2NrZXQgcmVjb25uZWN0IHRyaWFscywgLi5ldGMuXG4gICAgaWYgKHRoaXMuX2NsaWVudCkge1xuICAgICAgdGhpcy5fY2xpZW50LmNsb3NlKCk7XG4gICAgICB0aGlzLl9jbGllbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX2Nsb3NlZCkge1xuICAgICAgLy8gRnV0dXJlIGdldENsaWVudCBjYWxscyBzaG91bGQgZmFpbCwgaWYgaXQgaGFzIGEgY2FjaGVkIFJlbW90ZUNvbm5lY3Rpb24gaW5zdGFuY2UuXG4gICAgICB0aGlzLl9jbG9zZWQgPSB0cnVlO1xuICAgICAgLy8gUmVtb3ZlIGZyb20gX2Nvbm5lY3Rpb25zIHRvIG5vdCBiZSBjb25zaWRlcmVkIGluIGZ1dHVyZSBjb25uZWN0aW9uIHF1ZXJpZXMuXG4gICAgICBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5zcGxpY2UoUmVtb3RlQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuaW5kZXhPZih0aGlzKSwgMSk7XG4gICAgICBfZW1pdHRlci5lbWl0KCdkaWQtY2xvc2UnLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXRDbGllbnQoKTogQ2xpZW50Q29tcG9uZW50IHtcbiAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlbW90ZSBjb25uZWN0aW9uIGhhcyBub3QgYmVlbiBpbml0aWFsaXplZC4nKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2Nsb3NlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZW1vdGUgY29ubmVjdGlvbiBoYXMgYmVlbiBjbG9zZWQuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRDbGllbnQoKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0Q2xpZW50KCk6IENsaWVudENvbXBvbmVudCB7XG4gICAgaWYgKCF0aGlzLl9jbGllbnQpIHtcbiAgICAgIGxldCB1cmk7XG4gICAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICAgIC8vIFVzZSBodHRwcyBpZiB3ZSBoYXZlIGtleSwgY2VydCwgYW5kIGNhXG4gICAgICBpZiAodGhpcy5faXNTZWN1cmUoKSkge1xuICAgICAgICBvcHRpb25zLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGUgPSB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZTtcbiAgICAgICAgb3B0aW9ucy5jbGllbnRDZXJ0aWZpY2F0ZSA9IHRoaXMuX2NvbmZpZy5jbGllbnRDZXJ0aWZpY2F0ZTtcbiAgICAgICAgb3B0aW9ucy5jbGllbnRLZXkgPSB0aGlzLl9jb25maWcuY2xpZW50S2V5O1xuICAgICAgICB1cmkgPSBgaHR0cHM6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmkgPSBgaHR0cDovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9YDtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlbW90ZSBjb25uZWN0aW9uIGFuZCBjbGllbnQgYXJlIGlkZW50aWZpZWQgYnkgYm90aCB0aGUgcmVtb3RlIGhvc3QgYW5kIHRoZSBpbml0YWxcbiAgICAgIC8vIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAgICAgY29uc3Qgc29ja2V0ID0gbmV3IE51Y2xpZGVTb2NrZXQodXJpLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuX2NsaWVudCA9IG5ldyBDbGllbnRDb21wb25lbnQoc29ja2V0LCBsb2FkU2VydmljZXNDb25maWcoKSk7XG4gICAgfVxuICAgIGludmFyaWFudCh0aGlzLl9jbGllbnQpO1xuICAgIHJldHVybiB0aGlzLl9jbGllbnQ7XG4gIH1cblxuICBfaXNTZWN1cmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKFxuICAgICAgICB0aGlzLl9jb25maWcuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jb25maWcuY2xpZW50Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY29uZmlnLmNsaWVudEtleVxuICAgICk7XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuX2NvbmZpZy5ob3N0fToke3RoaXMuX2NvbmZpZy5wb3J0fWA7XG4gIH1cblxuICBnZXRQb3J0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5wb3J0O1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmhvc3Q7XG4gIH1cblxuICBnZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aCh0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKTtcbiAgfVxuXG4gIGdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcuY3dkO1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9XG5cbiAgc3RhdGljIG9uRGlkQWRkUmVtb3RlQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgb25EaWRDbG9zZVJlbW90ZUNvbm5lY3Rpb24oaGFuZGxlcjogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBfZW1pdHRlci5vbignZGlkLWNsb3NlJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRGb3JVcmkodXJpOiBOdWNsaWRlVXJpKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIGNvbnN0IHtob3N0bmFtZSwgcGF0aH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBpZiAoaG9zdG5hbWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lLCBwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY2FjaGVkIGNvbm5lY3Rpb24gbWF0Y2ggdGhlIGhvc3RuYW1lIGFuZCB0aGUgcGF0aCBoYXMgdGhlIHByZWZpeCBvZiBjb25uZWN0aW9uLmN3ZC5cbiAgICogQHBhcmFtIGhvc3RuYW1lIFRoZSBjb25uZWN0ZWQgc2VydmVyIGhvc3QgbmFtZS5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIHBhdGggdGhhdCdzIGhhcyB0aGUgcHJlZml4IG9mIGN3ZCBvZiB0aGUgY29ubmVjdGlvbi5cbiAgICogICBJZiBwYXRoIGlzIG51bGwsIGVtcHR5IG9yIHVuZGVmaW5lZCwgdGhlbiByZXR1cm4gdGhlIGNvbm5lY3Rpb24gd2hpY2ggbWF0Y2hlc1xuICAgKiAgIHRoZSBob3N0bmFtZSBhbmQgaWdub3JlIHRoZSBpbml0aWFsIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAgKi9cbiAgc3RhdGljIGdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lOiBzdHJpbmcsIHBhdGg6ID9zdHJpbmcpOiA/UmVtb3RlQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmZpbHRlcihjb25uZWN0aW9uID0+IHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCkgPT09IGhvc3RuYW1lICYmXG4gICAgICAgICAgKCFwYXRoIHx8IHBhdGguc3RhcnRzV2l0aChjb25uZWN0aW9uLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKSk7XG4gICAgfSlbMF07XG4gIH1cblxuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZShob3N0bmFtZTogc3RyaW5nKTogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5maWx0ZXIoXG4gICAgICBjb25uZWN0aW9uID0+IGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKSA9PT0gaG9zdG5hbWUsXG4gICAgKTtcbiAgfVxuXG4gIGdldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgW3NlcnZpY2VDb25maWddID0gbmV3U2VydmljZXMuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcubmFtZSA9PT0gc2VydmljZU5hbWUpO1xuICAgIGludmFyaWFudChzZXJ2aWNlQ29uZmlnICE9IG51bGwsIGBObyBjb25maWcgZm91bmQgZm9yIHNlcnZpY2UgJHtzZXJ2aWNlTmFtZX1gKTtcbiAgICByZXR1cm4gZ2V0UHJveHkoc2VydmljZUNvbmZpZy5uYW1lLCBzZXJ2aWNlQ29uZmlnLmRlZmluaXRpb24sIHRoaXMuZ2V0Q2xpZW50KCkpO1xuICB9XG5cbiAgZ2V0U29ja2V0KCk6IE51Y2xpZGVTb2NrZXQge1xuICAgIHJldHVybiB0aGlzLmdldENsaWVudCgpLmdldFNvY2tldCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSZW1vdGVDb25uZWN0aW9uLFxuICBfX3Rlc3RfXzoge1xuICAgIGNvbm5lY3Rpb25zOiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucyxcbiAgfSxcbn07XG4iXX0=