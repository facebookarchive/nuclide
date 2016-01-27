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
        } catch (e) {
          client.close();
          this._initialized = false;
          throw e;
        }

        var FileSystemService = this.getService('FileSystemService');
        this._config.cwd = yield FileSystemService.resolveRealPath(this._config.cwd);

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
      try {
        var config = _extends({}, connectionConfig, { cwd: cwd });
        var _connection = new RemoteConnection(config);
        yield _connection.initialize();
        return _connection;
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
//# sourceMappingURL=data:application/json;base64,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QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELGFBQU8sZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzlEOzs7Ozs7Ozs7OztXQVMwQiw4QkFBQyxRQUFnQixFQUFFLElBQWEsRUFBcUI7QUFDOUUsYUFBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQUEsVUFBVSxFQUFJO0FBQ3hELGVBQU8sVUFBVSxDQUFDLGlCQUFpQixFQUFFLEtBQUssUUFBUSxLQUM3QyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLENBQUEsQUFBQyxDQUFDO09BQ2hGLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNQOzs7V0FFbUIsdUJBQUMsUUFBZ0IsRUFBMkI7QUFDOUQsYUFBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUN6QyxVQUFBLFVBQVU7ZUFBSSxVQUFVLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxRQUFRO09BQUEsQ0FDMUQsQ0FBQztLQUNIOzs7U0FsZkcsZ0JBQWdCOzs7QUErZnRCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLFVBQVEsRUFBRTtBQUNSLGVBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxZQUFZO0dBQzNDO0NBQ0YsQ0FBQyIsImZpbGUiOiJSZW1vdGVDb25uZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeURlc2NyaXB0aW9ufSBmcm9tICcuLi8uLi9zb3VyY2UtY29udHJvbC1oZWxwZXJzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja0V2ZW50fSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IENsaWVudENvbXBvbmVudCBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvQ2xpZW50Q29tcG9uZW50JztcbmltcG9ydCBSZW1vdGVEaXJlY3RvcnkgZnJvbSAnLi9SZW1vdGVEaXJlY3RvcnknO1xuaW1wb3J0IHtsb2FkU2VydmljZXNDb25maWd9IGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZWZyYW1ld29yay9jb25maWcnO1xuaW1wb3J0IHtnZXRQcm94eX0gZnJvbSAnLi4vLi4vc2VydmljZS1wYXJzZXInO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlZnJhbWV3b3JrJztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3Qge0V2ZW50RW1pdHRlcn0gPSByZXF1aXJlKCdldmVudHMnKTtcblxuY29uc3QgUmVtb3RlRmlsZSA9IHJlcXVpcmUoJy4vUmVtb3RlRmlsZScpO1xuY29uc3QgTnVjbGlkZVNvY2tldCA9IHJlcXVpcmUoJy4uLy4uL3NlcnZlci9saWIvTnVjbGlkZVNvY2tldCcpO1xuY29uc3Qge2dldENvbm5lY3Rpb25Db25maWcsIHNldENvbm5lY3Rpb25Db25maWd9ID1cbiAgcmVxdWlyZSgnLi9SZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbk1hbmFnZXInKTtcbmNvbnN0IHtnZXRWZXJzaW9ufSA9IHJlcXVpcmUoJy4uLy4uL3ZlcnNpb24nKTtcblxuY29uc3QgbmV3U2VydmljZXMgPSBTZXJ2aWNlRnJhbWV3b3JrLmxvYWRTZXJ2aWNlc0NvbmZpZygpO1xuXG5jb25zdCBIRUFSVEJFQVRfQVdBWV9SRVBPUlRfQ09VTlQgPSAzO1xuY29uc3QgSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiA9IDE7XG5jb25zdCBIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX1dBUk5JTkcgPSAyO1xuXG4vLyBUYWtlbiBmcm9tIHRoZSBlcnJvciBtZXNzYWdlIGluXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svd2F0Y2htYW4vYmxvYi85OWRkZThlZTNmMTMyMzNiZTA5N2MwMzYxNDc3NDhiMmQ3ZjhiZmE3L3Rlc3RzL2ludGVncmF0aW9uL3Jvb3RyZXN0cmljdC5waHAjTDU4XG5jb25zdCBXQVRDSE1BTl9FUlJPUl9NRVNTQUdFX0ZPUl9FTkZPUkNFX1JPT1RfRklMRVNfUkVHRVggPSAvZ2xvYmFsIGNvbmZpZyByb290X2ZpbGVzLztcblxuY29uc3QgRklMRV9XQVRDSEVSX1NFUlZJQ0UgPSAnRmlsZVdhdGNoZXJTZXJ2aWNlJztcblxudHlwZSBIZWFydGJlYXROb3RpZmljYXRpb24gPSB7XG4gIG5vdGlmaWNhdGlvbjogYXRvbSROb3RpZmljYXRpb247XG4gIGNvZGU6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG4gIGhvc3Q6IHN0cmluZzsgLy8gaG9zdCBudWNsaWRlIHNlcnZlciBpcyBydW5uaW5nIG9uLlxuICBwb3J0OiBudW1iZXI7IC8vIHBvcnQgdG8gY29ubmVjdCB0by5cbiAgY3dkOiBzdHJpbmc7IC8vIFBhdGggdG8gcmVtb3RlIGRpcmVjdG9yeSB1c2VyIHNob3VsZCBzdGFydCBpbiB1cG9uIGNvbm5lY3Rpb24uXG4gIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNlcnRpZmljYXRlIG9mIGNlcnRpZmljYXRlIGF1dGhvcml0eS5cbiAgY2xpZW50Q2VydGlmaWNhdGU/OiBCdWZmZXI7IC8vIGNsaWVudCBjZXJ0aWZpY2F0ZSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbiAgY2xpZW50S2V5PzogQnVmZmVyOyAvLyBrZXkgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG59XG5cbmNvbnN0IF9lbWl0dGVyOiBFdmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbmNsYXNzIFJlbW90ZUNvbm5lY3Rpb24ge1xuICBfZW50cmllczoge1twYXRoOiBzdHJpbmddOiBSZW1vdGVGaWxlIHwgUmVtb3RlRGlyZWN0b3J5fTtcbiAgX2NvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb247XG4gIF9pbml0aWFsaXplZDogP2Jvb2w7XG4gIF9jbG9zZWQ6ID9ib29sO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIF9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50OiBudW1iZXI7XG4gIF9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uOiA/SGVhcnRiZWF0Tm90aWZpY2F0aW9uO1xuICBfY2xpZW50OiA/Q2xpZW50Q29tcG9uZW50O1xuXG4gIHN0YXRpYyBfY29ubmVjdGlvbnM6IEFycmF5PFJlbW90ZUNvbm5lY3Rpb24+ID0gW107XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbikge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2VudHJpZXMgPSB7fTtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCA9IDA7XG4gICAgdGhpcy5fY2xvc2VkID0gZmFsc2U7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIF9jcmVhdGVJbnNlY3VyZUNvbm5lY3Rpb25Gb3JUZXN0aW5nKFxuICAgIGN3ZDogc3RyaW5nLFxuICAgIHBvcnQ6IG51bWJlcixcbiAgKTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgICAgcG9ydCxcbiAgICAgIGN3ZCxcbiAgICB9O1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgUmVtb3RlQ29ubmVjdGlvbihjb25maWcpO1xuICAgIGF3YWl0IGNvbm5lY3Rpb24uaW5pdGlhbGl6ZSgpO1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGNvbm5lY3Rpb24gYnkgcmV1c2luZyB0aGUgY29uZmlndXJhdGlvbiBvZiBsYXN0IHN1Y2Nlc3NmdWwgY29ubmVjdGlvbiBhc3NvY2lhdGVkIHdpdGhcbiAgICogZ2l2ZW4gaG9zdC4gSWYgdGhlIHNlcnZlcidzIGNlcnRzIGhhcyBiZWVuIHVwZGF0ZWQgb3IgdGhlcmUgaXMgbm8gcHJldmlvdXMgc3VjY2Vzc2Z1bFxuICAgKiBjb25uZWN0aW9uLCBudWxsIChyZXNvbHZlZCBieSBwcm9taXNlKSBpcyByZXR1cm5lZC5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBjcmVhdGVDb25uZWN0aW9uQnlTYXZlZENvbmZpZyhcbiAgICBob3N0OiBzdHJpbmcsXG4gICAgY3dkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8P1JlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25uZWN0aW9uQ29uZmlnID0gZ2V0Q29ubmVjdGlvbkNvbmZpZyhob3N0KTtcbiAgICBpZiAoIWNvbm5lY3Rpb25Db25maWcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHsuLi5jb25uZWN0aW9uQ29uZmlnLCBjd2R9O1xuICAgICAgY29uc3QgY29ubmVjdGlvbiA9IG5ldyBSZW1vdGVDb25uZWN0aW9uKGNvbmZpZyk7XG4gICAgICBhd2FpdCBjb25uZWN0aW9uLmluaXRpYWxpemUoKTtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci53YXJuKGBGYWlsZWQgdG8gcmV1c2UgY29ubmVjdGlvbkNvbmZpZ3VyYXRpb24gZm9yICR7aG9zdH1gLCBlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IEF0b20ncyBQcm9qZWN0OjpzZXRQYXRocyBjdXJyZW50bHkgdXNlc1xuICAvLyA6OnJlcG9zaXRvcnlGb3JEaXJlY3RvcnlTeW5jLCBzbyB3ZSBuZWVkIHRoZSByZXBvIGluZm9ybWF0aW9uIHRvIGFscmVhZHkgYmVcbiAgLy8gYXZhaWxhYmxlIHdoZW4gdGhlIG5ldyBwYXRoIGlzIGFkZGVkLiB0NjkxMzYyNCB0cmFja3MgY2xlYW51cCBvZiB0aGlzLlxuICBhc3luYyBfc2V0SGdSZXBvSW5mbygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZW1vdGVQYXRoID0gdGhpcy5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgICBjb25zdCB7Z2V0SGdSZXBvc2l0b3J5fSA9IHRoaXMuZ2V0U2VydmljZSgnU291cmNlQ29udHJvbFNlcnZpY2UnKTtcbiAgICBjb25zdCBoZ1JlcG9EZXNjcmlwdGlvbiA9IGF3YWl0IGdldEhnUmVwb3NpdG9yeShyZW1vdGVQYXRoKTtcbiAgICB0aGlzLl9zZXRIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbihoZ1JlcG9EZXNjcmlwdGlvbik7XG4gIH1cblxuICBfbW9uaXRvckNvbm5lY3Rpb25IZWFydGJlYXQoKSB7XG4gICAgY29uc3Qgc29ja2V0ID0gdGhpcy5nZXRTb2NrZXQoKTtcbiAgICBjb25zdCBzZXJ2ZXJVcmkgPSBzb2NrZXQuZ2V0U2VydmVyVXJpKCk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGFuIEF0b20gbm90aWZpY2F0aW9uIGZvciB0aGUgZGV0ZWN0ZWQgaGVhcnRiZWF0IG5ldHdvcmsgc3RhdHVzXG4gICAgICogVGhlIGZ1bmN0aW9uIG1ha2VzIHN1cmUgbm90IHRvIGFkZCBtYW55IG5vdGlmaWNhdGlvbnMgZm9yIHRoZSBzYW1lIGV2ZW50IGFuZCBwcmlvcml0aXplXG4gICAgICogbmV3IGV2ZW50cy5cbiAgICAgKi9cbiAgICBjb25zdCBhZGRIZWFydGJlYXROb3RpZmljYXRpb24gPSAoXG4gICAgICB0eXBlOiBudW1iZXIsXG4gICAgICBlcnJvckNvZGU6IHN0cmluZyxcbiAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgIGRpc21pc3NhYmxlOiBib29sZWFuLFxuICAgICAgYXNrVG9SZWxvYWQ6IGJvb2xlYW5cbiAgICApID0+IHtcbiAgICAgIGNvbnN0IHtjb2RlLCBub3RpZmljYXRpb246IGV4aXN0aW5nTm90aWZpY2F0aW9ufSA9IHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gfHwge307XG4gICAgICBpZiAoY29kZSAmJiBjb2RlID09PSBlcnJvckNvZGUgJiYgZGlzbWlzc2FibGUpIHtcbiAgICAgICAgLy8gQSBkaXNtaXNzaWJsZSBoZWFydGJlYXQgbm90aWZpY2F0aW9uIHdpdGggdGhpcyBjb2RlIGlzIGFscmVhZHkgYWN0aXZlLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsZXQgbm90aWZpY2F0aW9uID0gbnVsbDtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZGlzbWlzc2FibGUsIGJ1dHRvbnM6IFtdfTtcbiAgICAgIGlmIChhc2tUb1JlbG9hZCkge1xuICAgICAgICBvcHRpb25zLmJ1dHRvbnMucHVzaCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnaWNvbiBpY29uLXphcCcsXG4gICAgICAgICAgb25EaWRDbGljaygpIHsgYXRvbS5yZWxvYWQoKTsgfSxcbiAgICAgICAgICB0ZXh0OiAnUmVsb2FkIEF0b20nLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1I6XG4gICAgICAgICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEhFQVJUQkVBVF9OT1RJRklDQVRJT05fV0FSTklORzpcbiAgICAgICAgICBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLCBvcHRpb25zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VucmVjb25nbml6ZWQgaGVhcnRiZWF0IG5vdGlmaWNhdGlvbiB0eXBlJyk7XG4gICAgICB9XG4gICAgICBpZiAoZXhpc3RpbmdOb3RpZmljYXRpb24pIHtcbiAgICAgICAgZXhpc3RpbmdOb3RpZmljYXRpb24uZGlzbWlzcygpO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KG5vdGlmaWNhdGlvbik7XG4gICAgICB0aGlzLl9sYXN0SGVhcnRiZWF0Tm90aWZpY2F0aW9uID0ge1xuICAgICAgICBub3RpZmljYXRpb24sXG4gICAgICAgIGNvZGU6IGVycm9yQ29kZSxcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IG9uSGVhcnRiZWF0ID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24pIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaGFzIGJlZW4gZXhpc3RpbmcgaGVhcnRiZWF0IGVycm9yL3dhcm5pbmcsXG4gICAgICAgIC8vIHRoYXQgbWVhbnMgY29ubmVjdGlvbiBoYXMgYmVlbiBsb3N0IGFuZCB3ZSBzaGFsbCBzaG93IGEgbWVzc2FnZSBhYm91dCBjb25uZWN0aW9uXG4gICAgICAgIC8vIGJlaW5nIHJlc3RvcmVkIHdpdGhvdXQgYSByZWNvbm5lY3QgcHJvbXB0LlxuICAgICAgICBjb25zdCB7bm90aWZpY2F0aW9ufSA9IHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb247XG4gICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb25uZWN0aW9uIHJlc3RvcmVkIHRvIE51Y2xpZGUgU2VydmVyIGF0OiAnICsgc2VydmVyVXJpKTtcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBub3RpZnlOZXR3b3JrQXdheSA9IChjb2RlOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQrKztcbiAgICAgIGlmICh0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID49IEhFQVJUQkVBVF9BV0FZX1JFUE9SVF9DT1VOVCkge1xuICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HLCBjb2RlLFxuICAgICAgICAgIGBOdWNsaWRlIHNlcnZlciBjYW4gbm90IGJlIHJlYWNoZWQgYXQgXCIke3NlcnZlclVyaX1cIi48YnIvPmAgK1xuICAgICAgICAgICdDaGVjayB5b3VyIG5ldHdvcmsgY29ubmVjdGlvbi4nLFxuICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyBmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uSGVhcnRiZWF0RXJyb3IgPSAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgY29uc3Qge2NvZGUsIG1lc3NhZ2UsIG9yaWdpbmFsQ29kZX0gPSBlcnJvcjtcbiAgICAgIHRyYWNrRXZlbnQoe1xuICAgICAgICB0eXBlOiAnaGVhcnRiZWF0LWVycm9yJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGNvZGU6IGNvZGUgfHwgJycsXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSB8fCAnJyxcbiAgICAgICAgICBob3N0OiB0aGlzLl9jb25maWcuaG9zdCxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgbG9nZ2VyLmluZm8oJ0hlYXJ0YmVhdCBuZXR3b3JrIGVycm9yOicsIGNvZGUsIG9yaWdpbmFsQ29kZSwgbWVzc2FnZSk7XG4gICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSAnTkVUV09SS19BV0FZJzpcbiAgICAgICAgICAgIC8vIE5vdGlmeSBzd2l0Y2hpbmcgbmV0d29ya3MsIGRpc2Nvbm5lY3RlZCwgdGltZW91dCwgdW5yZWFjaGFibGUgc2VydmVyIG9yIGZyYWdpbGVcbiAgICAgICAgICAgIC8vIGNvbm5lY3Rpb24uXG4gICAgICAgICAgbm90aWZ5TmV0d29ya0F3YXkoY29kZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1NFUlZFUl9DUkFTSEVEJzpcbiAgICAgICAgICAgIC8vIFNlcnZlciBzaHV0IGRvd24gb3IgcG9ydCBubyBsb25nZXIgYWNjZXNzaWJsZS5cbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgc2VydmVyIHdhcyB0aGVyZSwgYnV0IG5vdyBnb25lLlxuICAgICAgICAgIGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbihIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SLCBjb2RlLFxuICAgICAgICAgICAgICAgICcqKk51Y2xpZGUgU2VydmVyIENyYXNoZWQqKjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSByZWxvYWQgQXRvbSB0byByZXN0b3JlIHlvdXIgcmVtb3RlIHByb2plY3QgY29ubmVjdGlvbi4nLFxuICAgICAgICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyB0cnVlKTtcbiAgICAgICAgICAgIC8vIFRPRE8obW9zdCkgcmVjb25uZWN0IFJlbW90ZUNvbm5lY3Rpb24sIHJlc3RvcmUgdGhlIGN1cnJlbnQgcHJvamVjdCBzdGF0ZSxcbiAgICAgICAgICAgIC8vIGFuZCBmaW5hbGx5IGNoYW5nZSBkaXNtaXNzYWJsZSB0byBmYWxzZSBhbmQgdHlwZSB0byAnV0FSTklORycuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1BPUlRfTk9UX0FDQ0VTU0lCTEUnOlxuICAgICAgICAgICAgLy8gTm90aWZ5IG5ldmVyIGhlYXJkIGEgaGVhcnRiZWF0IGZyb20gdGhlIHNlcnZlci5cbiAgICAgICAgICBjb25zdCB7cG9ydH0gPSByZW1vdGVVcmkucGFyc2Uoc2VydmVyVXJpKTtcbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnKipOdWNsaWRlIFNlcnZlciBJcyBOb3QgUmVhY2hhYmxlKio8YnIvPicgK1xuICAgICAgICAgICAgICAgIGBJdCBjb3VsZCBiZSBydW5uaW5nIG9uIGEgcG9ydCB0aGF0IGlzIG5vdCBhY2Nlc3NpYmxlOiAke3BvcnR9LmAsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUsXG4gICAgICAgICAgICAgICAgLyphc2tUb1JlbG9hZCovIGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnSU5WQUxJRF9DRVJUSUZJQ0FURSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBpcyBub3QgYWNjZXB0ZWQgYnkgbnVjbGlkZSBzZXJ2ZXJcbiAgICAgICAgICAgIC8vIChjZXJ0aWZpY2F0ZSBtaXNtYXRjaCkuXG4gICAgICAgICAgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uKEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IsIGNvZGUsXG4gICAgICAgICAgICAgICAgJyoqQ29ubmVjdGlvbiBSZXNldCBFcnJvcioqPGJyLz4nICtcbiAgICAgICAgICAgICAgICAnVGhpcyBjb3VsZCBiZSBjYXVzZWQgYnkgdGhlIGNsaWVudCBjZXJ0aWZpY2F0ZSBtaXNtYXRjaGluZyB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAnc2VydmVyIGNlcnRpZmljYXRlLjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSByZWxvYWQgQXRvbSB0byByZXN0b3JlIHlvdXIgcmVtb3RlIHByb2plY3QgY29ubmVjdGlvbi4nLFxuICAgICAgICAgICAgICAgIC8qZGlzbWlzc2FibGUqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qYXNrVG9SZWxvYWQqLyB0cnVlKTtcbiAgICAgICAgICAgIC8vIFRPRE8obW9zdCk6IHJlY29ubmVjdCBSZW1vdGVDb25uZWN0aW9uLCByZXN0b3JlIHRoZSBjdXJyZW50IHByb2plY3Qgc3RhdGUuXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSBjaGFuZ2UgZGlzbWlzc2FibGUgdG8gZmFsc2UgYW5kIHR5cGUgdG8gJ1dBUk5JTkcnLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG5vdGlmeU5ldHdvcmtBd2F5KGNvZGUpO1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignVW5yZWNvbmduaXplZCBoZWFydGJlYXQgZXJyb3IgY29kZTogJyArIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH07XG4gICAgc29ja2V0Lm9uKCdoZWFydGJlYXQnLCBvbkhlYXJ0YmVhdCk7XG4gICAgc29ja2V0Lm9uKCdoZWFydGJlYXQuZXJyb3InLCBvbkhlYXJ0YmVhdEVycm9yKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignaGVhcnRiZWF0Jywgb25IZWFydGJlYXQpO1xuICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdoZWFydGJlYXQuZXJyb3InLCBvbkhlYXJ0YmVhdEVycm9yKTtcbiAgICB9KSk7XG4gIH1cblxuICBnZXRVcmlPZlJlbW90ZVBhdGgocmVtb3RlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG51Y2xpZGU6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfSR7cmVtb3RlUGF0aH1gO1xuICB9XG5cbiAgZ2V0UGF0aE9mVXJpKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVtb3RlVXJpLnBhcnNlKHVyaSkucGF0aDtcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdG9yeSh1cmk6IHN0cmluZyk6IFJlbW90ZURpcmVjdG9yeSB7XG4gICAgbGV0IHtwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJykubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRGlyZWN0b3J5KFxuICAgICAgICB0aGlzLFxuICAgICAgICB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSxcbiAgICAgICAge2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbn1cbiAgICAgICk7XG4gICAgICAvLyBUT0RPOiBXZSBzaG91bGQgYWRkIHRoZSBmb2xsb3dpbmcgbGluZSB0byBrZWVwIHRoZSBjYWNoZSB1cC10by1kYXRlLlxuICAgICAgLy8gV2UgbmVlZCB0byBpbXBsZW1lbnQgb25EaWRSZW5hbWUgYW5kIG9uRGlkRGVsZXRlIGluIFJlbW90ZURpcmVjdG9yeVxuICAgICAgLy8gZmlyc3QuIEl0J3Mgb2sgdGhhdCB3ZSBkb24ndCBhZGQgdGhlIGhhbmRsZXJzIGZvciBub3cgc2luY2Ugd2UgaGF2ZVxuICAgICAgLy8gdGhlIGNoZWNrIGBlbnRyeS5nZXRMb2NhbFBhdGgoKSAhPT0gcGF0aGAgYWJvdmUuXG4gICAgICAvL1xuICAgICAgLy8gdGhpcy5fYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeSk7XG4gICAgfVxuXG4gICAgaW52YXJpYW50KGVudHJ5IGluc3RhbmNlb2YgUmVtb3RlRGlyZWN0b3J5KTtcbiAgICBpZiAoIWVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGF0aCBpcyBub3QgYSBkaXJlY3Rvcnk6JyArIHVyaSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mbyBvZiBtYWluLmpzLlxuICBfc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oaGdSZXBvc2l0b3J5RGVzY3JpcHRpb246IEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb24gPSBoZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjtcbiAgfVxuXG4gIGNyZWF0ZUZpbGUodXJpOiBzdHJpbmcpOiBSZW1vdGVGaWxlIHtcbiAgICBsZXQge3BhdGh9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKS5ub3JtYWxpemUocGF0aCk7XG5cbiAgICBsZXQgZW50cnkgPSB0aGlzLl9lbnRyaWVzW3BhdGhdO1xuICAgIGlmICghZW50cnkgfHwgZW50cnkuZ2V0TG9jYWxQYXRoKCkgIT09IHBhdGgpIHtcbiAgICAgIHRoaXMuX2VudHJpZXNbcGF0aF0gPSBlbnRyeSA9IG5ldyBSZW1vdGVGaWxlKHRoaXMsIHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHBhdGgpKTtcbiAgICAgIHRoaXMuX2FkZEhhbmRsZXJzRm9yRW50cnkoZW50cnkpO1xuICAgIH1cblxuICAgIGludmFyaWFudChlbnRyeSBpbnN0YW5jZW9mIFJlbW90ZUZpbGUpO1xuICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggaXMgbm90IGEgZmlsZScpO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIF9hZGRIYW5kbGVyc0ZvckVudHJ5KGVudHJ5OiBSZW1vdGVGaWxlIHwgUmVtb3RlRGlyZWN0b3J5KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkUGF0aCA9IGVudHJ5LmdldExvY2FsUGF0aCgpO1xuICAgIC8qICRGbG93Rml4TWUgKi9cbiAgICBjb25zdCByZW5hbWVTdWJzY3JpcHRpb24gPSBlbnRyeS5vbkRpZFJlbmFtZSgoKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5fZW50cmllc1tvbGRQYXRoXTtcbiAgICAgIHRoaXMuX2VudHJpZXNbZW50cnkuZ2V0TG9jYWxQYXRoKCldID0gZW50cnk7XG4gICAgfSk7XG4gICAgLyogJEZsb3dGaXhNZSAqL1xuICAgIGNvbnN0IGRlbGV0ZVN1YnNjcmlwdGlvbiA9IGVudHJ5Lm9uRGlkRGVsZXRlKCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9lbnRyaWVzW2VudHJ5LmdldExvY2FsUGF0aCgpXTtcbiAgICAgIHJlbmFtZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICBkZWxldGVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBSaWdodCBub3cgd2UgZG9uJ3QgcmUtaGFuZHNoYWtlLlxuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5fZ2V0Q2xpZW50KCk7XG5cbiAgICAgIC8vIFRlc3QgY29ubmVjdGlvbiBmaXJzdC4gRmlyc3QgdGltZSB3ZSBnZXQgaGVyZSB3ZSdyZSBjaGVja2luZyB0byByZWVzdGFibGlzaFxuICAgICAgLy8gY29ubmVjdGlvbiB1c2luZyBjYWNoZWQgY3JlZGVudGlhbHMuIFRoaXMgd2lsbCBmYWlsIGZhc3QgKGZhc3RlciB0aGFuIGluZm9TZXJ2aWNlKVxuICAgICAgLy8gd2hlbiB3ZSBkb24ndCBoYXZlIGNhY2hlZCBjcmVkZW50aWFscyB5ZXQuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjbGllbnQudGVzdENvbm5lY3Rpb24oKTtcblxuICAgICAgICAvLyBEbyB2ZXJzaW9uIGNoZWNrLlxuICAgICAgICBsZXQgc2VydmVyVmVyc2lvbjtcblxuICAgICAgICAvLyBOZWVkIHRvIHNldCBpbml0aWFsaXplZCB0byB0cnVlIG9wdGltaXN0aWNhbGx5IHNvIHRoYXQgd2UgY2FuIGdldCB0aGUgSW5mb1NlcnZpY2UuXG4gICAgICAgIC8vIFRPRE86IFdlIHNob3VsZG4ndCBuZWVkIHRoZSBjbGllbnQgdG8gZ2V0IGEgc2VydmljZS5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBpbmZvU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZSgnSW5mb1NlcnZpY2UnKTtcbiAgICAgICAgc2VydmVyVmVyc2lvbiA9IGF3YWl0IGluZm9TZXJ2aWNlLmdldFNlcnZlclZlcnNpb24oKTtcblxuICAgICAgICBjb25zdCBjbGllbnRWZXJzaW9uID0gZ2V0VmVyc2lvbigpO1xuICAgICAgICBpZiAoY2xpZW50VmVyc2lvbiAhPT0gc2VydmVyVmVyc2lvbikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBWZXJzaW9uIG1pc21hdGNoLiBDbGllbnQgYXQgJHtjbGllbnRWZXJzaW9ufSB3aGlsZSBzZXJ2ZXIgYXQgJHtzZXJ2ZXJWZXJzaW9ufS5gKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjbGllbnQuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cblxuXG4gICAgICBjb25zdCBGaWxlU3lzdGVtU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZSgnRmlsZVN5c3RlbVNlcnZpY2UnKTtcbiAgICAgIHRoaXMuX2NvbmZpZy5jd2QgPSBhd2FpdCBGaWxlU3lzdGVtU2VydmljZS5yZXNvbHZlUmVhbFBhdGgodGhpcy5fY29uZmlnLmN3ZCk7XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBjb25maWd1cmF0aW9uIGZvciBmdXR1cmUgdXNhZ2UuXG4gICAgICBzZXRDb25uZWN0aW9uQ29uZmlnKHRoaXMuX2NvbmZpZyk7XG5cbiAgICAgIHRoaXMuX21vbml0b3JDb25uZWN0aW9uSGVhcnRiZWF0KCk7XG5cbiAgICAgIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8uXG4gICAgICBhd2FpdCB0aGlzLl9zZXRIZ1JlcG9JbmZvKCk7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIE51Y2xpZGVVcmkgdHlwZSBjb252ZXJzaW9ucy5cbiAgICAgIGNsaWVudC5yZWdpc3RlclR5cGUoJ051Y2xpZGVVcmknLFxuICAgICAgICB1cmkgPT4gdGhpcy5nZXRQYXRoT2ZVcmkodXJpKSwgcGF0aCA9PiB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSk7XG5cbiAgICAgIC8vIFNhdmUgdG8gY2FjaGUuXG4gICAgICB0aGlzLl9hZGRDb25uZWN0aW9uKCk7XG4gICAgICB0aGlzLl93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk7XG4gICAgfVxuICB9XG5cbiAgX2FkZENvbm5lY3Rpb24oKSB7XG4gICAgUmVtb3RlQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMucHVzaCh0aGlzKTtcbiAgICBfZW1pdHRlci5lbWl0KCdkaWQtYWRkJywgdGhpcyk7XG4gIH1cblxuICBfd2F0Y2hSb290UHJvamVjdERpcmVjdG9yeSgpOiB2b2lkIHtcbiAgICBjb25zdCByb290RGlyZWN0b3J5VXJpID0gdGhpcy5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IEZpbGVXYXRjaGVyU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1dBVENIRVJfU0VSVklDRSk7XG4gICAgaW52YXJpYW50KEZpbGVXYXRjaGVyU2VydmljZSk7XG4gICAgY29uc3Qge3dhdGNoRGlyZWN0b3J5UmVjdXJzaXZlfSA9IEZpbGVXYXRjaGVyU2VydmljZTtcbiAgICAvLyBTdGFydCB3YXRjaGluZyB0aGUgcHJvamVjdCBmb3IgY2hhbmdlcyBhbmQgaW5pdGlhbGl6ZSB0aGUgcm9vdCB3YXRjaGVyXG4gICAgLy8gZm9yIG5leHQgY2FsbHMgdG8gYHdhdGNoRmlsZWAgYW5kIGB3YXRjaERpcmVjdG9yeWAuXG4gICAgY29uc3Qgd2F0Y2hTdHJlYW0gPSB3YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZShyb290RGlyZWN0b3J5VXJpKTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB3YXRjaFN0cmVhbS5zdWJzY3JpYmUod2F0Y2hVcGRhdGUgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXMgd2F0Y2hlZCBjb3JyZWN0bHkuXG4gICAgICAvLyBMZXQncyBqdXN0IGNvbnNvbGUgbG9nIGl0IGFueXdheS5cbiAgICAgIGxvZ2dlci5pbmZvKGBXYXRjaGVyIEZlYXR1cmVzIEluaXRpYWxpemVkIGZvciBwcm9qZWN0OiAke3Jvb3REaXJlY3RvcnlVcml9YCwgd2F0Y2hVcGRhdGUpO1xuICAgIH0sIGVycm9yID0+IHtcbiAgICAgIGxldCB3YXJuaW5nTWVzc2FnZVRvVXNlciA9IGBZb3UganVzdCBjb25uZWN0ZWQgdG8gYSByZW1vdGUgcHJvamVjdCBgICtcbiAgICAgICAgYCgke3Jvb3REaXJlY3RvcnlVcml9KSwgYnV0IHdlIHJlY29tbWVuZCB5b3UgcmVtb3ZlIHRoaXMgZGlyZWN0b3J5IG5vdyFgICtcbiAgICAgICAgYDxici8+PGJyLz4gVGhlIGRpcmVjdG9yeSB5b3UgY29ubmVjdGVkIHRvIGNvdWxkIG5vdCBiZSB3YXRjaGVkIGJ5IHdhdGNobWFuLCBgICtcbiAgICAgICAgYHNvIGNydWNpYWwgZmVhdHVyZXMgbGlrZSBzeW5jZWQgcmVtb3RlIGZpbGUgZWRpdGluZywgZmlsZSBzZWFyY2gsIGAgK1xuICAgICAgICBgYW5kIE1lcmN1cmlhbC1yZWxhdGVkIHVwZGF0ZXMgd2lsbCBub3Qgd29yay5gO1xuICAgICAgY29uc3QgbG9nZ2VkRXJyb3JNZXNzYWdlID0gZXJyb3IubWVzc2FnZSB8fCBlcnJvcjtcbiAgICAgIGlmIChsb2dnZWRFcnJvck1lc3NhZ2UubWF0Y2goV0FUQ0hNQU5fRVJST1JfTUVTU0FHRV9GT1JfRU5GT1JDRV9ST09UX0ZJTEVTX1JFR0VYKSkge1xuICAgICAgICB3YXJuaW5nTWVzc2FnZVRvVXNlciArPSBgPGJyLz48YnIvPllvdSBuZWVkIHRvIGNvbm5lY3QgdG8gYSBkaWZmZXJlbnQgcm9vdCBkaXJlY3RvcnksIGAgK1xuICAgICAgICBgYmVjYXVzZSB0aGUgd2F0Y2htYW4gb24gdGhlIHNlcnZlciB5b3UgYXJlIGNvbm5lY3RpbmcgdG8gaXMgY29uZmlndXJlZCB0byBub3QgYWxsb3cgYCArXG4gICAgICAgIGB5b3UgdG8gd2F0Y2ggJHtyb290RGlyZWN0b3J5VXJpfS4gWW91IG1heSBoYXZlIGx1Y2sgY29ubmVjdGluZyB0byBhIGRlZXBlciBgICtcbiAgICAgICAgYGRpcmVjdG9yeSwgYmVjYXVzZSBvZnRlbiB3YXRjaG1hbiBpcyBjb25maWd1cmVkIHRvIG9ubHkgYWxsb3cgd2F0Y2hpbmcgYCArXG4gICAgICAgIGBjZXJ0YWluIHN1YmRpcmVjdG9yaWVzIChvZnRlbiByb290cyBvciBzdWJkaXJlY3RvcmllcyBvZiBzb3VyY2UgY29udHJvbCByZXBvc2l0b3JpZXMpLmA7XG4gICAgICB9XG4gICAgICAvLyBBZGQgYSBwZXJzaXN0ZW50IHdhcm5pbmcgbWVzc2FnZSB0byBtYWtlIHN1cmUgdGhlIHVzZXIgc2VlcyBpdCBiZWZvcmUgZGlzbWlzc2luZy5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHdhcm5pbmdNZXNzYWdlVG9Vc2VyLCB7ZGlzbWlzc2FibGU6IHRydWV9KTtcbiAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICBgV2F0Y2hlciBmYWlsZWQgdG8gc3RhcnQgLSB3YXRjaGVyIGZlYXR1cmVzIGRpc2FibGVkISBFcnJvcjogJHtsb2dnZWRFcnJvck1lc3NhZ2V9YCk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXRjaCBoYXMgZW5kZWQuXG4gICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hlciBGZWF0dXJlcyBFbmRlZCBmb3IgcHJvamVjdDogJHtyb290RGlyZWN0b3J5VXJpfWApO1xuICAgIH0pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICAvLyBDbG9zZSB0aGUgZXZlbnRidXMgdGhhdCB3aWxsIHN0b3AgdGhlIGhlYXJ0YmVhdCBpbnRlcnZhbCwgd2Vic29ja2V0IHJlY29ubmVjdCB0cmlhbHMsIC4uZXRjLlxuICAgIGlmICh0aGlzLl9jbGllbnQpIHtcbiAgICAgIHRoaXMuX2NsaWVudC5jbG9zZSgpO1xuICAgICAgdGhpcy5fY2xpZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9jbG9zZWQpIHtcbiAgICAgIC8vIEZ1dHVyZSBnZXRDbGllbnQgY2FsbHMgc2hvdWxkIGZhaWwsIGlmIGl0IGhhcyBhIGNhY2hlZCBSZW1vdGVDb25uZWN0aW9uIGluc3RhbmNlLlxuICAgICAgdGhpcy5fY2xvc2VkID0gdHJ1ZTtcbiAgICAgIC8vIFJlbW92ZSBmcm9tIF9jb25uZWN0aW9ucyB0byBub3QgYmUgY29uc2lkZXJlZCBpbiBmdXR1cmUgY29ubmVjdGlvbiBxdWVyaWVzLlxuICAgICAgUmVtb3RlQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuc3BsaWNlKFJlbW90ZUNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmluZGV4T2YodGhpcyksIDEpO1xuICAgICAgX2VtaXR0ZXIuZW1pdCgnZGlkLWNsb3NlJywgdGhpcyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q2xpZW50KCk6IENsaWVudENvbXBvbmVudCB7XG4gICAgaWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZW1vdGUgY29ubmVjdGlvbiBoYXMgbm90IGJlZW4gaW5pdGlhbGl6ZWQuJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9jbG9zZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVtb3RlIGNvbm5lY3Rpb24gaGFzIGJlZW4gY2xvc2VkLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0Q2xpZW50KCk7XG4gICAgfVxuICB9XG5cbiAgX2dldENsaWVudCgpOiBDbGllbnRDb21wb25lbnQge1xuICAgIGlmICghdGhpcy5fY2xpZW50KSB7XG4gICAgICBsZXQgdXJpO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gICAgICAvLyBVc2UgaHR0cHMgaWYgd2UgaGF2ZSBrZXksIGNlcnQsIGFuZCBjYVxuICAgICAgaWYgKHRoaXMuX2lzU2VjdXJlKCkpIHtcbiAgICAgICAgb3B0aW9ucy5jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlID0gdGhpcy5fY29uZmlnLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU7XG4gICAgICAgIG9wdGlvbnMuY2xpZW50Q2VydGlmaWNhdGUgPSB0aGlzLl9jb25maWcuY2xpZW50Q2VydGlmaWNhdGU7XG4gICAgICAgIG9wdGlvbnMuY2xpZW50S2V5ID0gdGhpcy5fY29uZmlnLmNsaWVudEtleTtcbiAgICAgICAgdXJpID0gYGh0dHBzOi8vJHt0aGlzLmdldFJlbW90ZUhvc3QoKX1gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXJpID0gYGh0dHA6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZW1vdGUgY29ubmVjdGlvbiBhbmQgY2xpZW50IGFyZSBpZGVudGlmaWVkIGJ5IGJvdGggdGhlIHJlbW90ZSBob3N0IGFuZCB0aGUgaW5pdGFsXG4gICAgICAvLyB3b3JraW5nIGRpcmVjdG9yeS5cbiAgICAgIGNvbnN0IHNvY2tldCA9IG5ldyBOdWNsaWRlU29ja2V0KHVyaSwgb3B0aW9ucyk7XG4gICAgICB0aGlzLl9jbGllbnQgPSBuZXcgQ2xpZW50Q29tcG9uZW50KHNvY2tldCwgbG9hZFNlcnZpY2VzQ29uZmlnKCkpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5fY2xpZW50KTtcbiAgICByZXR1cm4gdGhpcy5fY2xpZW50O1xuICB9XG5cbiAgX2lzU2VjdXJlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShcbiAgICAgICAgdGhpcy5fY29uZmlnLmNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGVcbiAgICAgICAgJiYgdGhpcy5fY29uZmlnLmNsaWVudENlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NvbmZpZy5jbGllbnRLZXlcbiAgICApO1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLl9jb25maWcuaG9zdH06JHt0aGlzLl9jb25maWcucG9ydH1gO1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmhvc3Q7XG4gIH1cblxuICBnZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aCh0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKTtcbiAgfVxuXG4gIGdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcuY3dkO1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9XG5cbiAgc3RhdGljIG9uRGlkQWRkUmVtb3RlQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgb25EaWRDbG9zZVJlbW90ZUNvbm5lY3Rpb24oaGFuZGxlcjogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBfZW1pdHRlci5vbignZGlkLWNsb3NlJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRGb3JVcmkodXJpOiBOdWNsaWRlVXJpKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIGNvbnN0IHtob3N0bmFtZSwgcGF0aH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBpZiAoaG9zdG5hbWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lLCBwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY2FjaGVkIGNvbm5lY3Rpb24gbWF0Y2ggdGhlIGhvc3RuYW1lIGFuZCB0aGUgcGF0aCBoYXMgdGhlIHByZWZpeCBvZiBjb25uZWN0aW9uLmN3ZC5cbiAgICogQHBhcmFtIGhvc3RuYW1lIFRoZSBjb25uZWN0ZWQgc2VydmVyIGhvc3QgbmFtZS5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIHBhdGggdGhhdCdzIGhhcyB0aGUgcHJlZml4IG9mIGN3ZCBvZiB0aGUgY29ubmVjdGlvbi5cbiAgICogICBJZiBwYXRoIGlzIG51bGwsIGVtcHR5IG9yIHVuZGVmaW5lZCwgdGhlbiByZXR1cm4gdGhlIGNvbm5lY3Rpb24gd2hpY2ggbWF0Y2hlc1xuICAgKiAgIHRoZSBob3N0bmFtZSBhbmQgaWdub3JlIHRoZSBpbml0aWFsIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAgKi9cbiAgc3RhdGljIGdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lOiBzdHJpbmcsIHBhdGg6ID9zdHJpbmcpOiA/UmVtb3RlQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLmZpbHRlcihjb25uZWN0aW9uID0+IHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCkgPT09IGhvc3RuYW1lICYmXG4gICAgICAgICAgKCFwYXRoIHx8IHBhdGguc3RhcnRzV2l0aChjb25uZWN0aW9uLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKSk7XG4gICAgfSlbMF07XG4gIH1cblxuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZShob3N0bmFtZTogc3RyaW5nKTogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5maWx0ZXIoXG4gICAgICBjb25uZWN0aW9uID0+IGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKSA9PT0gaG9zdG5hbWUsXG4gICAgKTtcbiAgfVxuXG4gIGdldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgW3NlcnZpY2VDb25maWddID0gbmV3U2VydmljZXMuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcubmFtZSA9PT0gc2VydmljZU5hbWUpO1xuICAgIGludmFyaWFudChzZXJ2aWNlQ29uZmlnICE9IG51bGwsIGBObyBjb25maWcgZm91bmQgZm9yIHNlcnZpY2UgJHtzZXJ2aWNlTmFtZX1gKTtcbiAgICByZXR1cm4gZ2V0UHJveHkoc2VydmljZUNvbmZpZy5uYW1lLCBzZXJ2aWNlQ29uZmlnLmRlZmluaXRpb24sIHRoaXMuZ2V0Q2xpZW50KCkpO1xuICB9XG5cbiAgZ2V0U29ja2V0KCk6IE51Y2xpZGVTb2NrZXQge1xuICAgIHJldHVybiB0aGlzLmdldENsaWVudCgpLmdldFNvY2tldCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSZW1vdGVDb25uZWN0aW9uLFxuICBfX3Rlc3RfXzoge1xuICAgIGNvbm5lY3Rpb25zOiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucyxcbiAgfSxcbn07XG4iXX0=