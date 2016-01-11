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

function getReloadKeystrokeLabel() {
  var binding = atom.keymaps.findKeyBindings({ command: 'window:reload' });
  if (!binding || !binding[0]) {
    return null;
  }

  var _require5 = require('../../keystroke-label');

  var humanizeKeystroke = _require5.humanizeKeystroke;

  return humanizeKeystroke(binding[0].keystrokes);
}

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
      var addHeartbeatNotification = function addHeartbeatNotification(type, errorCode, message, dismissable) {
        var _ref = _this._lastHeartbeatNotification || {};

        var code = _ref.code;
        var existingNotification = _ref.notification;

        if (code && code === errorCode && dismissable) {
          // A dismissible heartbeat notification with this code is already active.
          return;
        }
        var notification = null;
        switch (type) {
          case HEARTBEAT_NOTIFICATION_ERROR:
            notification = atom.notifications.addError(message, { dismissable: dismissable });
            break;
          case HEARTBEAT_NOTIFICATION_WARNING:
            notification = atom.notifications.addWarning(message, { dismissable: dismissable });
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
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_WARNING, code, 'Nuclide server can not be reached at: ' + serverUri + '<br/>Check your network connection!',
          /*dismissable*/true);
        }
      };

      var onHeartbeatError = function onHeartbeatError(error) {
        var reloadkeystroke = getReloadKeystrokeLabel();
        var reloadKeystrokeLabel = reloadkeystroke ? ' : (' + reloadkeystroke + ')' : '';
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
            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, 'Nuclide server crashed!<br/>' + 'Please reload Nuclide to restore your remote project connection!' + reloadKeystrokeLabel,
            /*dismissable*/true);
            // TODO(most) reconnect RemoteConnection, restore the current project state,
            // and finally change dismissable to false and type to 'WARNING'.
            break;
          case 'PORT_NOT_ACCESSIBLE':
            // Notify never heard a heartbeat from the server.

            var _remoteUri$parse = remoteUri.parse(serverUri),
                port = _remoteUri$parse.port;

            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, 'Nuclide server is not reachable.<br/>It could be running on a port' + ('that is not accessible: ' + port),
            /*dismissable*/true);
            break;
          case 'INVALID_CERTIFICATE':
            // Notify the client certificate is not accepted by nuclide server
            // (certificate mismatch).
            addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, 'Connection Reset Error!!<br/>This could be caused by the client' + ' certificate mismatching the server certificate.<br/>' + 'Please reload Nuclide to restore your remote project connection!' + reloadKeystrokeLabel,
            /*dismissable*/true);
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
    connections: RemoteConnection._connections,
    getReloadKeystrokeLabel: getReloadKeystrokeLabel
  }
};
// host nuclide server is running on.
// port to connect to.
// Path to remote directory user should start in upon connection.
// certificate of certificate authority.
// client certificate for https connection.
//# sourceMappingURL=data:application/json;base64,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QUM7T0FDL0MsQ0FBQyxDQUFDO0tBQ0o7OztXQUVlLG1CQUFDLEdBQWUsRUFBcUI7OEJBQzFCLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDOztVQUF0QyxRQUFRLHFCQUFSLFFBQVE7VUFBRSxJQUFJLHFCQUFKLElBQUk7O0FBQ3JCLFVBQUksUUFBUSxJQUFJLElBQUksRUFBRTtBQUNwQixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsYUFBTyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDOUQ7Ozs7Ozs7Ozs7O1dBUzBCLDhCQUFDLFFBQWdCLEVBQUUsSUFBYSxFQUFxQjtBQUM5RSxhQUFPLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDeEQsZUFBTyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxRQUFRLEtBQzdDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxFQUFFLENBQUMsQ0FBQSxBQUFDLENBQUM7T0FDaEYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ1A7OztXQUVtQix1QkFBQyxRQUFnQixFQUEyQjtBQUM5RCxhQUFPLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQ3pDLFVBQUEsVUFBVTtlQUFJLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLFFBQVE7T0FBQSxDQUMxRCxDQUFDO0tBQ0g7OztTQXBlRyxnQkFBZ0I7OztBQWlmdEIsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsVUFBUSxFQUFFO0FBQ1IsZUFBVyxFQUFFLGdCQUFnQixDQUFDLFlBQVk7QUFDMUMsMkJBQXVCLEVBQXZCLHVCQUF1QjtHQUN4QjtDQUNGLENBQUMiLCJmaWxlIjoiUmVtb3RlQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbn0gZnJvbSAnLi4vLi4vc291cmNlLWNvbnRyb2wtaGVscGVycyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7dHJhY2tFdmVudH0gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCBDbGllbnRDb21wb25lbnQgZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlZnJhbWV3b3JrL0NsaWVudENvbXBvbmVudCc7XG5pbXBvcnQgUmVtb3RlRGlyZWN0b3J5IGZyb20gJy4vUmVtb3RlRGlyZWN0b3J5JztcbmltcG9ydCB7bG9hZFNlcnZpY2VzQ29uZmlnfSBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsvY29uZmlnJztcbmltcG9ydCB7Z2V0UHJveHl9IGZyb20gJy4uLy4uL3NlcnZpY2UtcGFyc2VyJztcbmltcG9ydCBTZXJ2aWNlRnJhbWV3b3JrIGZyb20gJy4uLy4uL3NlcnZlci9saWIvc2VydmljZWZyYW1ld29yayc7XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS11cmknKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5cbmNvbnN0IFJlbW90ZUZpbGUgPSByZXF1aXJlKCcuL1JlbW90ZUZpbGUnKTtcbmNvbnN0IE51Y2xpZGVTb2NrZXQgPSByZXF1aXJlKCcuLi8uLi9zZXJ2ZXIvbGliL051Y2xpZGVTb2NrZXQnKTtcbmNvbnN0IHtnZXRDb25uZWN0aW9uQ29uZmlnLCBzZXRDb25uZWN0aW9uQ29uZmlnfSA9XG4gIHJlcXVpcmUoJy4vUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb25NYW5hZ2VyJyk7XG5jb25zdCB7Z2V0VmVyc2lvbn0gPSByZXF1aXJlKCcuLi8uLi92ZXJzaW9uJyk7XG5cbmNvbnN0IG5ld1NlcnZpY2VzID0gU2VydmljZUZyYW1ld29yay5sb2FkU2VydmljZXNDb25maWcoKTtcblxuY29uc3QgSEVBUlRCRUFUX0FXQVlfUkVQT1JUX0NPVU5UID0gMztcbmNvbnN0IEhFQVJUQkVBVF9OT1RJRklDQVRJT05fRVJST1IgPSAxO1xuY29uc3QgSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HID0gMjtcblxuLy8gVGFrZW4gZnJvbSB0aGUgZXJyb3IgbWVzc2FnZSBpblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3dhdGNobWFuL2Jsb2IvOTlkZGU4ZWUzZjEzMjMzYmUwOTdjMDM2MTQ3NzQ4YjJkN2Y4YmZhNy90ZXN0cy9pbnRlZ3JhdGlvbi9yb290cmVzdHJpY3QucGhwI0w1OFxuY29uc3QgV0FUQ0hNQU5fRVJST1JfTUVTU0FHRV9GT1JfRU5GT1JDRV9ST09UX0ZJTEVTX1JFR0VYID0gL2dsb2JhbCBjb25maWcgcm9vdF9maWxlcy87XG5cbmNvbnN0IEZJTEVfV0FUQ0hFUl9TRVJWSUNFID0gJ0ZpbGVXYXRjaGVyU2VydmljZSc7XG5cbnR5cGUgSGVhcnRiZWF0Tm90aWZpY2F0aW9uID0ge1xuICBub3RpZmljYXRpb246IGF0b20kTm90aWZpY2F0aW9uO1xuICBjb2RlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uID0ge1xuICBob3N0OiBzdHJpbmc7IC8vIGhvc3QgbnVjbGlkZSBzZXJ2ZXIgaXMgcnVubmluZyBvbi5cbiAgcG9ydDogbnVtYmVyOyAvLyBwb3J0IHRvIGNvbm5lY3QgdG8uXG4gIGN3ZDogc3RyaW5nOyAvLyBQYXRoIHRvIHJlbW90ZSBkaXJlY3RvcnkgdXNlciBzaG91bGQgc3RhcnQgaW4gdXBvbiBjb25uZWN0aW9uLlxuICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlPzogQnVmZmVyOyAvLyBjZXJ0aWZpY2F0ZSBvZiBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXG4gIGNsaWVudENlcnRpZmljYXRlPzogQnVmZmVyOyAvLyBjbGllbnQgY2VydGlmaWNhdGUgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG4gIGNsaWVudEtleT86IEJ1ZmZlcjsgLy8ga2V5IGZvciBodHRwcyBjb25uZWN0aW9uLlxufVxuXG5mdW5jdGlvbiBnZXRSZWxvYWRLZXlzdHJva2VMYWJlbCgpOiA/c3RyaW5nIHtcbiAgY29uc3QgYmluZGluZyA9IGF0b20ua2V5bWFwcy5maW5kS2V5QmluZGluZ3Moe2NvbW1hbmQ6ICd3aW5kb3c6cmVsb2FkJ30pO1xuICBpZiAoIWJpbmRpbmcgfHwgIWJpbmRpbmdbMF0pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCB7aHVtYW5pemVLZXlzdHJva2V9ID0gcmVxdWlyZSgnLi4vLi4va2V5c3Ryb2tlLWxhYmVsJyk7XG4gIHJldHVybiBodW1hbml6ZUtleXN0cm9rZShiaW5kaW5nWzBdLmtleXN0cm9rZXMpO1xufVxuXG5jb25zdCBfZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5jbGFzcyBSZW1vdGVDb25uZWN0aW9uIHtcbiAgX2VudHJpZXM6IHtbcGF0aDogc3RyaW5nXTogUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeX07XG4gIF9jb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uO1xuICBfaW5pdGlhbGl6ZWQ6ID9ib29sO1xuICBfY2xvc2VkOiA/Ym9vbDtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICBfaGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudDogbnVtYmVyO1xuICBfbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbjogP0hlYXJ0YmVhdE5vdGlmaWNhdGlvbjtcbiAgX2NsaWVudDogP0NsaWVudENvbXBvbmVudDtcblxuICBzdGF0aWMgX2Nvbm5lY3Rpb25zOiBBcnJheTxSZW1vdGVDb25uZWN0aW9uPiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9lbnRyaWVzID0ge307XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQgPSAwO1xuICAgIHRoaXMuX2Nsb3NlZCA9IGZhbHNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBfY3JlYXRlSW5zZWN1cmVDb25uZWN0aW9uRm9yVGVzdGluZyhcbiAgICBjd2Q6IHN0cmluZyxcbiAgICBwb3J0OiBudW1iZXIsXG4gICk6IFByb21pc2U8P1JlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgIHBvcnQsXG4gICAgICBjd2QsXG4gICAgfTtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oY29uZmlnKTtcbiAgICBhd2FpdCBjb25uZWN0aW9uLmluaXRpYWxpemUoKTtcbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjb25uZWN0aW9uIGJ5IHJldXNpbmcgdGhlIGNvbmZpZ3VyYXRpb24gb2YgbGFzdCBzdWNjZXNzZnVsIGNvbm5lY3Rpb24gYXNzb2NpYXRlZCB3aXRoXG4gICAqIGdpdmVuIGhvc3QuIElmIHRoZSBzZXJ2ZXIncyBjZXJ0cyBoYXMgYmVlbiB1cGRhdGVkIG9yIHRoZXJlIGlzIG5vIHByZXZpb3VzIHN1Y2Nlc3NmdWxcbiAgICogY29ubmVjdGlvbiwgbnVsbCAocmVzb2x2ZWQgYnkgcHJvbWlzZSkgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY3JlYXRlQ29ubmVjdGlvbkJ5U2F2ZWRDb25maWcoXG4gICAgaG9zdDogc3RyaW5nLFxuICAgIGN3ZDogc3RyaW5nLFxuICApOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29ubmVjdGlvbkNvbmZpZyA9IGdldENvbm5lY3Rpb25Db25maWcoaG9zdCk7XG4gICAgaWYgKCFjb25uZWN0aW9uQ29uZmlnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb25maWcgPSB7Li4uY29ubmVjdGlvbkNvbmZpZywgY3dkfTtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgUmVtb3RlQ29ubmVjdGlvbihjb25maWcpO1xuICAgICAgYXdhaXQgY29ubmVjdGlvbi5pbml0aWFsaXplKCk7XG4gICAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHJldXNlIGNvbm5lY3Rpb25Db25maWd1cmF0aW9uIGZvciAke2hvc3R9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBBdG9tJ3MgUHJvamVjdDo6c2V0UGF0aHMgY3VycmVudGx5IHVzZXNcbiAgLy8gOjpyZXBvc2l0b3J5Rm9yRGlyZWN0b3J5U3luYywgc28gd2UgbmVlZCB0aGUgcmVwbyBpbmZvcm1hdGlvbiB0byBhbHJlYWR5IGJlXG4gIC8vIGF2YWlsYWJsZSB3aGVuIHRoZSBuZXcgcGF0aCBpcyBhZGRlZC4gdDY5MTM2MjQgdHJhY2tzIGNsZWFudXAgb2YgdGhpcy5cbiAgYXN5bmMgX3NldEhnUmVwb0luZm8oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVtb3RlUGF0aCA9IHRoaXMuZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qge2dldEhnUmVwb3NpdG9yeX0gPSB0aGlzLmdldFNlcnZpY2UoJ1NvdXJjZUNvbnRyb2xTZXJ2aWNlJyk7XG4gICAgY29uc3QgaGdSZXBvRGVzY3JpcHRpb24gPSBhd2FpdCBnZXRIZ1JlcG9zaXRvcnkocmVtb3RlUGF0aCk7XG4gICAgdGhpcy5fc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oaGdSZXBvRGVzY3JpcHRpb24pO1xuICB9XG5cbiAgX21vbml0b3JDb25uZWN0aW9uSGVhcnRiZWF0KCkge1xuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuZ2V0U29ja2V0KCk7XG4gICAgY29uc3Qgc2VydmVyVXJpID0gc29ja2V0LmdldFNlcnZlclVyaSgpO1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBBdG9tIG5vdGlmaWNhdGlvbiBmb3IgdGhlIGRldGVjdGVkIGhlYXJ0YmVhdCBuZXR3b3JrIHN0YXR1c1xuICAgICAqIFRoZSBmdW5jdGlvbiBtYWtlcyBzdXJlIG5vdCB0byBhZGQgbWFueSBub3RpZmljYXRpb25zIGZvciB0aGUgc2FtZSBldmVudCBhbmQgcHJpb3JpdGl6ZVxuICAgICAqIG5ldyBldmVudHMuXG4gICAgICovXG4gICAgY29uc3QgYWRkSGVhcnRiZWF0Tm90aWZpY2F0aW9uID1cbiAgICAgICh0eXBlOiBudW1iZXIsIGVycm9yQ29kZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcsIGRpc21pc3NhYmxlOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IHtjb2RlLCBub3RpZmljYXRpb246IGV4aXN0aW5nTm90aWZpY2F0aW9ufSA9IHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gfHwge307XG4gICAgICAgIGlmIChjb2RlICYmIGNvZGUgPT09IGVycm9yQ29kZSAmJiBkaXNtaXNzYWJsZSkge1xuICAgICAgICAgIC8vIEEgZGlzbWlzc2libGUgaGVhcnRiZWF0IG5vdGlmaWNhdGlvbiB3aXRoIHRoaXMgY29kZSBpcyBhbHJlYWR5IGFjdGl2ZS5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IG51bGw7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgIGNhc2UgSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUjpcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7ZGlzbWlzc2FibGV9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HOlxuICAgICAgICAgICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZSwge2Rpc21pc3NhYmxlfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlY29uZ25pemVkIGhlYXJ0YmVhdCBub3RpZmljYXRpb24gdHlwZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleGlzdGluZ05vdGlmaWNhdGlvbikge1xuICAgICAgICAgIGV4aXN0aW5nTm90aWZpY2F0aW9uLmRpc21pc3MoKTtcbiAgICAgICAgfVxuICAgICAgICBpbnZhcmlhbnQobm90aWZpY2F0aW9uKTtcbiAgICAgICAgdGhpcy5fbGFzdEhlYXJ0YmVhdE5vdGlmaWNhdGlvbiA9IHtcbiAgICAgICAgICBub3RpZmljYXRpb24sXG4gICAgICAgICAgY29kZTogZXJyb3JDb2RlLFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgIGNvbnN0IG9uSGVhcnRiZWF0ID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24pIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaGFzIGJlZW4gZXhpc3RpbmcgaGVhcnRiZWF0IGVycm9yL3dhcm5pbmcsXG4gICAgICAgIC8vIHRoYXQgbWVhbnMgY29ubmVjdGlvbiBoYXMgYmVlbiBsb3N0IGFuZCB3ZSBzaGFsbCBzaG93IGEgbWVzc2FnZSBhYm91dCBjb25uZWN0aW9uXG4gICAgICAgIC8vIGJlaW5nIHJlc3RvcmVkIHdpdGhvdXQgYSByZWNvbm5lY3QgcHJvbXB0LlxuICAgICAgICBjb25zdCB7bm90aWZpY2F0aW9ufSA9IHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb247XG4gICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdDb25uZWN0aW9uIHJlc3RvcmVkIHRvIE51Y2xpZGUgU2VydmVyIGF0OiAnICsgc2VydmVyVXJpKTtcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0TmV0d29ya0F3YXlDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuX2xhc3RIZWFydGJlYXROb3RpZmljYXRpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBub3RpZnlOZXR3b3JrQXdheSA9IChjb2RlOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMuX2hlYXJ0YmVhdE5ldHdvcmtBd2F5Q291bnQrKztcbiAgICAgIGlmICh0aGlzLl9oZWFydGJlYXROZXR3b3JrQXdheUNvdW50ID49IEhFQVJUQkVBVF9BV0FZX1JFUE9SVF9DT1VOVCkge1xuICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9XQVJOSU5HLCBjb2RlLFxuICAgICAgICAgICdOdWNsaWRlIHNlcnZlciBjYW4gbm90IGJlIHJlYWNoZWQgYXQ6ICcgKyBzZXJ2ZXJVcmkgK1xuICAgICAgICAgICc8YnIvPkNoZWNrIHlvdXIgbmV0d29yayBjb25uZWN0aW9uIScsXG4gICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbkhlYXJ0YmVhdEVycm9yID0gKGVycm9yOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHJlbG9hZGtleXN0cm9rZSA9IGdldFJlbG9hZEtleXN0cm9rZUxhYmVsKCk7XG4gICAgICBjb25zdCByZWxvYWRLZXlzdHJva2VMYWJlbCA9IHJlbG9hZGtleXN0cm9rZSA/IGAgOiAoJHtyZWxvYWRrZXlzdHJva2V9KWAgOiAnJztcbiAgICAgIGNvbnN0IHtjb2RlLCBtZXNzYWdlLCBvcmlnaW5hbENvZGV9ID0gZXJyb3I7XG4gICAgICB0cmFja0V2ZW50KHtcbiAgICAgICAgdHlwZTogJ2hlYXJ0YmVhdC1lcnJvcicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBjb2RlOiBjb2RlIHx8ICcnLFxuICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UgfHwgJycsXG4gICAgICAgICAgaG9zdDogdGhpcy5fY29uZmlnLmhvc3QsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci5pbmZvKCdIZWFydGJlYXQgbmV0d29yayBlcnJvcjonLCBjb2RlLCBvcmlnaW5hbENvZGUsIG1lc3NhZ2UpO1xuICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgIGNhc2UgJ05FVFdPUktfQVdBWSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgc3dpdGNoaW5nIG5ldHdvcmtzLCBkaXNjb25uZWN0ZWQsIHRpbWVvdXQsIHVucmVhY2hhYmxlIHNlcnZlciBvciBmcmFnaWxlXG4gICAgICAgICAgICAvLyBjb25uZWN0aW9uLlxuICAgICAgICAgIG5vdGlmeU5ldHdvcmtBd2F5KGNvZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdTRVJWRVJfQ1JBU0hFRCc6XG4gICAgICAgICAgICAvLyBTZXJ2ZXIgc2h1dCBkb3duIG9yIHBvcnQgbm8gbG9uZ2VyIGFjY2Vzc2libGUuXG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHNlcnZlciB3YXMgdGhlcmUsIGJ1dCBub3cgZ29uZS5cbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnTnVjbGlkZSBzZXJ2ZXIgY3Jhc2hlZCE8YnIvPicgK1xuICAgICAgICAgICAgICAgICdQbGVhc2UgcmVsb2FkIE51Y2xpZGUgdG8gcmVzdG9yZSB5b3VyIHJlbW90ZSBwcm9qZWN0IGNvbm5lY3Rpb24hJyArXG4gICAgICAgICAgICAgICAgcmVsb2FkS2V5c3Ryb2tlTGFiZWwsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUpO1xuICAgICAgICAgICAgLy8gVE9ETyhtb3N0KSByZWNvbm5lY3QgUmVtb3RlQ29ubmVjdGlvbiwgcmVzdG9yZSB0aGUgY3VycmVudCBwcm9qZWN0IHN0YXRlLFxuICAgICAgICAgICAgLy8gYW5kIGZpbmFsbHkgY2hhbmdlIGRpc21pc3NhYmxlIHRvIGZhbHNlIGFuZCB0eXBlIHRvICdXQVJOSU5HJy5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnUE9SVF9OT1RfQUNDRVNTSUJMRSc6XG4gICAgICAgICAgICAvLyBOb3RpZnkgbmV2ZXIgaGVhcmQgYSBoZWFydGJlYXQgZnJvbSB0aGUgc2VydmVyLlxuICAgICAgICAgIGNvbnN0IHtwb3J0fSA9IHJlbW90ZVVyaS5wYXJzZShzZXJ2ZXJVcmkpO1xuICAgICAgICAgIGFkZEhlYXJ0YmVhdE5vdGlmaWNhdGlvbihIRUFSVEJFQVRfTk9USUZJQ0FUSU9OX0VSUk9SLCBjb2RlLFxuICAgICAgICAgICAgICAgICdOdWNsaWRlIHNlcnZlciBpcyBub3QgcmVhY2hhYmxlLjxici8+SXQgY291bGQgYmUgcnVubmluZyBvbiBhIHBvcnQnICtcbiAgICAgICAgICAgICAgICBgdGhhdCBpcyBub3QgYWNjZXNzaWJsZTogJHtwb3J0fWAsXG4gICAgICAgICAgICAgICAgLypkaXNtaXNzYWJsZSovIHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdJTlZBTElEX0NFUlRJRklDQVRFJzpcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgY2xpZW50IGNlcnRpZmljYXRlIGlzIG5vdCBhY2NlcHRlZCBieSBudWNsaWRlIHNlcnZlclxuICAgICAgICAgICAgLy8gKGNlcnRpZmljYXRlIG1pc21hdGNoKS5cbiAgICAgICAgICBhZGRIZWFydGJlYXROb3RpZmljYXRpb24oSEVBUlRCRUFUX05PVElGSUNBVElPTl9FUlJPUiwgY29kZSxcbiAgICAgICAgICAgICAgICAnQ29ubmVjdGlvbiBSZXNldCBFcnJvciEhPGJyLz5UaGlzIGNvdWxkIGJlIGNhdXNlZCBieSB0aGUgY2xpZW50JyArXG4gICAgICAgICAgICAgICAgJyBjZXJ0aWZpY2F0ZSBtaXNtYXRjaGluZyB0aGUgc2VydmVyIGNlcnRpZmljYXRlLjxici8+JyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSByZWxvYWQgTnVjbGlkZSB0byByZXN0b3JlIHlvdXIgcmVtb3RlIHByb2plY3QgY29ubmVjdGlvbiEnICtcbiAgICAgICAgICAgICAgICByZWxvYWRLZXlzdHJva2VMYWJlbCxcbiAgICAgICAgICAgICAgICAvKmRpc21pc3NhYmxlKi8gdHJ1ZSk7XG4gICAgICAgICAgICAvLyBUT0RPKG1vc3QpOiByZWNvbm5lY3QgUmVtb3RlQ29ubmVjdGlvbiwgcmVzdG9yZSB0aGUgY3VycmVudCBwcm9qZWN0IHN0YXRlLlxuICAgICAgICAgICAgLy8gYW5kIGZpbmFsbHkgY2hhbmdlIGRpc21pc3NhYmxlIHRvIGZhbHNlIGFuZCB0eXBlIHRvICdXQVJOSU5HJy5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBub3RpZnlOZXR3b3JrQXdheShjb2RlKTtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1VucmVjb25nbml6ZWQgaGVhcnRiZWF0IGVycm9yIGNvZGU6ICcgKyBjb2RlLCBtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5vbignaGVhcnRiZWF0Jywgb25IZWFydGJlYXQpO1xuICAgIHNvY2tldC5vbignaGVhcnRiZWF0LmVycm9yJywgb25IZWFydGJlYXRFcnJvcik7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2hlYXJ0YmVhdCcsIG9uSGVhcnRiZWF0KTtcbiAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignaGVhcnRiZWF0LmVycm9yJywgb25IZWFydGJlYXRFcnJvcik7XG4gICAgfSkpO1xuICB9XG5cbiAgZ2V0VXJpT2ZSZW1vdGVQYXRoKHJlbW90ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBudWNsaWRlOi8vJHt0aGlzLmdldFJlbW90ZUhvc3QoKX0ke3JlbW90ZVBhdGh9YDtcbiAgfVxuXG4gIGdldFBhdGhPZlVyaSh1cmk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHJlbW90ZVVyaS5wYXJzZSh1cmkpLnBhdGg7XG4gIH1cblxuICBjcmVhdGVEaXJlY3RvcnkodXJpOiBzdHJpbmcpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGxldCB7cGF0aH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBwYXRoID0gcmVxdWlyZSgncGF0aCcpLm5vcm1hbGl6ZShwYXRoKTtcblxuICAgIGxldCBlbnRyeSA9IHRoaXMuX2VudHJpZXNbcGF0aF07XG4gICAgaWYgKCFlbnRyeSB8fCBlbnRyeS5nZXRMb2NhbFBhdGgoKSAhPT0gcGF0aCkge1xuICAgICAgdGhpcy5fZW50cmllc1twYXRoXSA9IGVudHJ5ID0gbmV3IFJlbW90ZURpcmVjdG9yeShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgocGF0aCksXG4gICAgICAgIHtoZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb259XG4gICAgICApO1xuICAgICAgLy8gVE9ETzogV2Ugc2hvdWxkIGFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8ga2VlcCB0aGUgY2FjaGUgdXAtdG8tZGF0ZS5cbiAgICAgIC8vIFdlIG5lZWQgdG8gaW1wbGVtZW50IG9uRGlkUmVuYW1lIGFuZCBvbkRpZERlbGV0ZSBpbiBSZW1vdGVEaXJlY3RvcnlcbiAgICAgIC8vIGZpcnN0LiBJdCdzIG9rIHRoYXQgd2UgZG9uJ3QgYWRkIHRoZSBoYW5kbGVycyBmb3Igbm93IHNpbmNlIHdlIGhhdmVcbiAgICAgIC8vIHRoZSBjaGVjayBgZW50cnkuZ2V0TG9jYWxQYXRoKCkgIT09IHBhdGhgIGFib3ZlLlxuICAgICAgLy9cbiAgICAgIC8vIHRoaXMuX2FkZEhhbmRsZXJzRm9yRW50cnkoZW50cnkpO1xuICAgIH1cblxuICAgIGludmFyaWFudChlbnRyeSBpbnN0YW5jZW9mIFJlbW90ZURpcmVjdG9yeSk7XG4gICAgaWYgKCFlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggaXMgbm90IGEgZGlyZWN0b3J5OicgKyB1cmkpO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8gb2YgbWFpbi5qcy5cbiAgX3NldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKGhnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiBIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uID0gaGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIH1cblxuICBjcmVhdGVGaWxlKHVyaTogc3RyaW5nKTogUmVtb3RlRmlsZSB7XG4gICAgbGV0IHtwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJykubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRmlsZSh0aGlzLCB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSk7XG4gICAgICB0aGlzLl9hZGRIYW5kbGVyc0ZvckVudHJ5KGVudHJ5KTtcbiAgICB9XG5cbiAgICBpbnZhcmlhbnQoZW50cnkgaW5zdGFuY2VvZiBSZW1vdGVGaWxlKTtcbiAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGlzIG5vdCBhIGZpbGUnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICBfYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeTogUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeSk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFBhdGggPSBlbnRyeS5nZXRMb2NhbFBhdGgoKTtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgY29uc3QgcmVuYW1lU3Vic2NyaXB0aW9uID0gZW50cnkub25EaWRSZW5hbWUoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2VudHJpZXNbb2xkUGF0aF07XG4gICAgICB0aGlzLl9lbnRyaWVzW2VudHJ5LmdldExvY2FsUGF0aCgpXSA9IGVudHJ5O1xuICAgIH0pO1xuICAgIC8qICRGbG93Rml4TWUgKi9cbiAgICBjb25zdCBkZWxldGVTdWJzY3JpcHRpb24gPSBlbnRyeS5vbkRpZERlbGV0ZSgoKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5fZW50cmllc1tlbnRyeS5nZXRMb2NhbFBhdGgoKV07XG4gICAgICByZW5hbWVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgZGVsZXRlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmlnaHQgbm93IHdlIGRvbid0IHJlLWhhbmRzaGFrZS5cbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuX2dldENsaWVudCgpO1xuXG4gICAgICAvLyBUZXN0IGNvbm5lY3Rpb24gZmlyc3QuIEZpcnN0IHRpbWUgd2UgZ2V0IGhlcmUgd2UncmUgY2hlY2tpbmcgdG8gcmVlc3RhYmxpc2hcbiAgICAgIC8vIGNvbm5lY3Rpb24gdXNpbmcgY2FjaGVkIGNyZWRlbnRpYWxzLiBUaGlzIHdpbGwgZmFpbCBmYXN0IChmYXN0ZXIgdGhhbiBpbmZvU2VydmljZSlcbiAgICAgIC8vIHdoZW4gd2UgZG9uJ3QgaGF2ZSBjYWNoZWQgY3JlZGVudGlhbHMgeWV0LlxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY2xpZW50LnRlc3RDb25uZWN0aW9uKCk7XG5cbiAgICAgICAgLy8gRG8gdmVyc2lvbiBjaGVjay5cbiAgICAgICAgbGV0IHNlcnZlclZlcnNpb247XG5cbiAgICAgICAgLy8gTmVlZCB0byBzZXQgaW5pdGlhbGl6ZWQgdG8gdHJ1ZSBvcHRpbWlzdGljYWxseSBzbyB0aGF0IHdlIGNhbiBnZXQgdGhlIEluZm9TZXJ2aWNlLlxuICAgICAgICAvLyBUT0RPOiBXZSBzaG91bGRuJ3QgbmVlZCB0aGUgY2xpZW50IHRvIGdldCBhIHNlcnZpY2UuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaW5mb1NlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoJ0luZm9TZXJ2aWNlJyk7XG4gICAgICAgIHNlcnZlclZlcnNpb24gPSBhd2FpdCBpbmZvU2VydmljZS5nZXRTZXJ2ZXJWZXJzaW9uKCk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50VmVyc2lvbiA9IGdldFZlcnNpb24oKTtcbiAgICAgICAgaWYgKGNsaWVudFZlcnNpb24gIT09IHNlcnZlclZlcnNpb24pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVmVyc2lvbiBtaXNtYXRjaC4gQ2xpZW50IGF0ICR7Y2xpZW50VmVyc2lvbn0gd2hpbGUgc2VydmVyIGF0ICR7c2VydmVyVmVyc2lvbn0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2xpZW50LmNsb3NlKCk7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG5cblxuICAgICAgY29uc3QgRmlsZVN5c3RlbVNlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoJ0ZpbGVTeXN0ZW1TZXJ2aWNlJyk7XG4gICAgICB0aGlzLl9jb25maWcuY3dkID0gYXdhaXQgRmlsZVN5c3RlbVNlcnZpY2UucmVzb2x2ZVJlYWxQYXRoKHRoaXMuX2NvbmZpZy5jd2QpO1xuXG4gICAgICAvLyBTdG9yZSB0aGUgY29uZmlndXJhdGlvbiBmb3IgZnV0dXJlIHVzYWdlLlxuICAgICAgc2V0Q29ubmVjdGlvbkNvbmZpZyh0aGlzLl9jb25maWcpO1xuXG4gICAgICB0aGlzLl9tb25pdG9yQ29ubmVjdGlvbkhlYXJ0YmVhdCgpO1xuXG4gICAgICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBzZWUgOjpnZXRIZ1JlcG9JbmZvLlxuICAgICAgYXdhaXQgdGhpcy5fc2V0SGdSZXBvSW5mbygpO1xuXG4gICAgICAvLyBSZWdpc3RlciBOdWNsaWRlVXJpIHR5cGUgY29udmVyc2lvbnMuXG4gICAgICBjbGllbnQucmVnaXN0ZXJUeXBlKCdOdWNsaWRlVXJpJyxcbiAgICAgICAgdXJpID0+IHRoaXMuZ2V0UGF0aE9mVXJpKHVyaSksIHBhdGggPT4gdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgocGF0aCkpO1xuXG4gICAgICAvLyBTYXZlIHRvIGNhY2hlLlxuICAgICAgdGhpcy5fYWRkQ29ubmVjdGlvbigpO1xuICAgICAgdGhpcy5fd2F0Y2hSb290UHJvamVjdERpcmVjdG9yeSgpO1xuICAgIH1cbiAgfVxuXG4gIF9hZGRDb25uZWN0aW9uKCkge1xuICAgIFJlbW90ZUNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLnB1c2godGhpcyk7XG4gICAgX2VtaXR0ZXIuZW1pdCgnZGlkLWFkZCcsIHRoaXMpO1xuICB9XG5cbiAgX3dhdGNoUm9vdFByb2plY3REaXJlY3RvcnkoKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdERpcmVjdG9yeVVyaSA9IHRoaXMuZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgICBjb25zdCBGaWxlV2F0Y2hlclNlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoRklMRV9XQVRDSEVSX1NFUlZJQ0UpO1xuICAgIGludmFyaWFudChGaWxlV2F0Y2hlclNlcnZpY2UpO1xuICAgIGNvbnN0IHt3YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZX0gPSBGaWxlV2F0Y2hlclNlcnZpY2U7XG4gICAgLy8gU3RhcnQgd2F0Y2hpbmcgdGhlIHByb2plY3QgZm9yIGNoYW5nZXMgYW5kIGluaXRpYWxpemUgdGhlIHJvb3Qgd2F0Y2hlclxuICAgIC8vIGZvciBuZXh0IGNhbGxzIHRvIGB3YXRjaEZpbGVgIGFuZCBgd2F0Y2hEaXJlY3RvcnlgLlxuICAgIGNvbnN0IHdhdGNoU3RyZWFtID0gd2F0Y2hEaXJlY3RvcnlSZWN1cnNpdmUocm9vdERpcmVjdG9yeVVyaSk7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gd2F0Y2hTdHJlYW0uc3Vic2NyaWJlKHdhdGNoVXBkYXRlID0+IHtcbiAgICAgIC8vIE5vdGhpbmcgbmVlZHMgdG8gYmUgZG9uZSBpZiB0aGUgcm9vdCBkaXJlY3Rvcnkgd2FzIHdhdGNoZWQgY29ycmVjdGx5LlxuICAgICAgLy8gTGV0J3MganVzdCBjb25zb2xlIGxvZyBpdCBhbnl3YXkuXG4gICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hlciBGZWF0dXJlcyBJbml0aWFsaXplZCBmb3IgcHJvamVjdDogJHtyb290RGlyZWN0b3J5VXJpfWAsIHdhdGNoVXBkYXRlKTtcbiAgICB9LCBlcnJvciA9PiB7XG4gICAgICBsZXQgd2FybmluZ01lc3NhZ2VUb1VzZXIgPSBgWW91IGp1c3QgY29ubmVjdGVkIHRvIGEgcmVtb3RlIHByb2plY3QgYCArXG4gICAgICAgIGAoJHtyb290RGlyZWN0b3J5VXJpfSksIGJ1dCB3ZSByZWNvbW1lbmQgeW91IHJlbW92ZSB0aGlzIGRpcmVjdG9yeSBub3chYCArXG4gICAgICAgIGA8YnIvPjxici8+IFRoZSBkaXJlY3RvcnkgeW91IGNvbm5lY3RlZCB0byBjb3VsZCBub3QgYmUgd2F0Y2hlZCBieSB3YXRjaG1hbiwgYCArXG4gICAgICAgIGBzbyBjcnVjaWFsIGZlYXR1cmVzIGxpa2Ugc3luY2VkIHJlbW90ZSBmaWxlIGVkaXRpbmcsIGZpbGUgc2VhcmNoLCBgICtcbiAgICAgICAgYGFuZCBNZXJjdXJpYWwtcmVsYXRlZCB1cGRhdGVzIHdpbGwgbm90IHdvcmsuYDtcbiAgICAgIGNvbnN0IGxvZ2dlZEVycm9yTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3I7XG4gICAgICBpZiAobG9nZ2VkRXJyb3JNZXNzYWdlLm1hdGNoKFdBVENITUFOX0VSUk9SX01FU1NBR0VfRk9SX0VORk9SQ0VfUk9PVF9GSUxFU19SRUdFWCkpIHtcbiAgICAgICAgd2FybmluZ01lc3NhZ2VUb1VzZXIgKz0gYDxici8+PGJyLz5Zb3UgbmVlZCB0byBjb25uZWN0IHRvIGEgZGlmZmVyZW50IHJvb3QgZGlyZWN0b3J5LCBgICtcbiAgICAgICAgYGJlY2F1c2UgdGhlIHdhdGNobWFuIG9uIHRoZSBzZXJ2ZXIgeW91IGFyZSBjb25uZWN0aW5nIHRvIGlzIGNvbmZpZ3VyZWQgdG8gbm90IGFsbG93IGAgK1xuICAgICAgICBgeW91IHRvIHdhdGNoICR7cm9vdERpcmVjdG9yeVVyaX0uIFlvdSBtYXkgaGF2ZSBsdWNrIGNvbm5lY3RpbmcgdG8gYSBkZWVwZXIgYCArXG4gICAgICAgIGBkaXJlY3RvcnksIGJlY2F1c2Ugb2Z0ZW4gd2F0Y2htYW4gaXMgY29uZmlndXJlZCB0byBvbmx5IGFsbG93IHdhdGNoaW5nIGAgK1xuICAgICAgICBgY2VydGFpbiBzdWJkaXJlY3RvcmllcyAob2Z0ZW4gcm9vdHMgb3Igc3ViZGlyZWN0b3JpZXMgb2Ygc291cmNlIGNvbnRyb2wgcmVwb3NpdG9yaWVzKS5gO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGEgcGVyc2lzdGVudCB3YXJuaW5nIG1lc3NhZ2UgdG8gbWFrZSBzdXJlIHRoZSB1c2VyIHNlZXMgaXQgYmVmb3JlIGRpc21pc3NpbmcuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyh3YXJuaW5nTWVzc2FnZVRvVXNlciwge2Rpc21pc3NhYmxlOiB0cnVlfSk7XG4gICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgYFdhdGNoZXIgZmFpbGVkIHRvIHN0YXJ0IC0gd2F0Y2hlciBmZWF0dXJlcyBkaXNhYmxlZCEgRXJyb3I6ICR7bG9nZ2VkRXJyb3JNZXNzYWdlfWApO1xuICAgIH0sICgpID0+IHtcbiAgICAgIC8vIE5vdGhpbmcgbmVlZHMgdG8gYmUgZG9uZSBpZiB0aGUgcm9vdCBkaXJlY3Rvcnkgd2F0Y2ggaGFzIGVuZGVkLlxuICAgICAgbG9nZ2VyLmluZm8oYFdhdGNoZXIgRmVhdHVyZXMgRW5kZWQgZm9yIHByb2plY3Q6ICR7cm9vdERpcmVjdG9yeVVyaX1gKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpb24pO1xuICB9XG5cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgLy8gQ2xvc2UgdGhlIGV2ZW50YnVzIHRoYXQgd2lsbCBzdG9wIHRoZSBoZWFydGJlYXQgaW50ZXJ2YWwsIHdlYnNvY2tldCByZWNvbm5lY3QgdHJpYWxzLCAuLmV0Yy5cbiAgICBpZiAodGhpcy5fY2xpZW50KSB7XG4gICAgICB0aGlzLl9jbGllbnQuY2xvc2UoKTtcbiAgICAgIHRoaXMuX2NsaWVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmICghdGhpcy5fY2xvc2VkKSB7XG4gICAgICAvLyBGdXR1cmUgZ2V0Q2xpZW50IGNhbGxzIHNob3VsZCBmYWlsLCBpZiBpdCBoYXMgYSBjYWNoZWQgUmVtb3RlQ29ubmVjdGlvbiBpbnN0YW5jZS5cbiAgICAgIHRoaXMuX2Nsb3NlZCA9IHRydWU7XG4gICAgICAvLyBSZW1vdmUgZnJvbSBfY29ubmVjdGlvbnMgdG8gbm90IGJlIGNvbnNpZGVyZWQgaW4gZnV0dXJlIGNvbm5lY3Rpb24gcXVlcmllcy5cbiAgICAgIFJlbW90ZUNvbm5lY3Rpb24uX2Nvbm5lY3Rpb25zLnNwbGljZShSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1jbG9zZScsIHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldENsaWVudCgpOiBDbGllbnRDb21wb25lbnQge1xuICAgIGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVtb3RlIGNvbm5lY3Rpb24gaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkLicpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fY2xvc2VkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlbW90ZSBjb25uZWN0aW9uIGhhcyBiZWVuIGNsb3NlZC4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldENsaWVudCgpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRDbGllbnQoKTogQ2xpZW50Q29tcG9uZW50IHtcbiAgICBpZiAoIXRoaXMuX2NsaWVudCkge1xuICAgICAgbGV0IHVyaTtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICAgICAgLy8gVXNlIGh0dHBzIGlmIHdlIGhhdmUga2V5LCBjZXJ0LCBhbmQgY2FcbiAgICAgIGlmICh0aGlzLl9pc1NlY3VyZSgpKSB7XG4gICAgICAgIG9wdGlvbnMuY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZSA9IHRoaXMuX2NvbmZpZy5jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlO1xuICAgICAgICBvcHRpb25zLmNsaWVudENlcnRpZmljYXRlID0gdGhpcy5fY29uZmlnLmNsaWVudENlcnRpZmljYXRlO1xuICAgICAgICBvcHRpb25zLmNsaWVudEtleSA9IHRoaXMuX2NvbmZpZy5jbGllbnRLZXk7XG4gICAgICAgIHVyaSA9IGBodHRwczovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVyaSA9IGBodHRwOi8vJHt0aGlzLmdldFJlbW90ZUhvc3QoKX1gO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVtb3RlIGNvbm5lY3Rpb24gYW5kIGNsaWVudCBhcmUgaWRlbnRpZmllZCBieSBib3RoIHRoZSByZW1vdGUgaG9zdCBhbmQgdGhlIGluaXRhbFxuICAgICAgLy8gd29ya2luZyBkaXJlY3RvcnkuXG4gICAgICBjb25zdCBzb2NrZXQgPSBuZXcgTnVjbGlkZVNvY2tldCh1cmksIG9wdGlvbnMpO1xuICAgICAgdGhpcy5fY2xpZW50ID0gbmV3IENsaWVudENvbXBvbmVudChzb2NrZXQsIGxvYWRTZXJ2aWNlc0NvbmZpZygpKTtcbiAgICB9XG4gICAgaW52YXJpYW50KHRoaXMuX2NsaWVudCk7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudDtcbiAgfVxuXG4gIF9pc1NlY3VyZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEoXG4gICAgICAgIHRoaXMuX2NvbmZpZy5jZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlXG4gICAgICAgICYmIHRoaXMuX2NvbmZpZy5jbGllbnRDZXJ0aWZpY2F0ZVxuICAgICAgICAmJiB0aGlzLl9jb25maWcuY2xpZW50S2V5XG4gICAgKTtcbiAgfVxuXG4gIGdldFJlbW90ZUhvc3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fY29uZmlnLmhvc3R9OiR7dGhpcy5fY29uZmlnLnBvcnR9YDtcbiAgfVxuXG4gIGdldFJlbW90ZUhvc3RuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5ob3N0O1xuICB9XG5cbiAgZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgodGhpcy5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSk7XG4gIH1cblxuICBnZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmN3ZDtcbiAgfVxuXG4gIGdldENvbmZpZygpOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgfVxuXG4gIHN0YXRpYyBvbkRpZEFkZFJlbW90ZUNvbm5lY3Rpb24oaGFuZGxlcjogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBfZW1pdHRlci5vbignZGlkLWFkZCcsIGhhbmRsZXIpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBfZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZGlkLWFkZCcsIGhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIG9uRGlkQ2xvc2VSZW1vdGVDb25uZWN0aW9uKGhhbmRsZXI6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgX2VtaXR0ZXIub24oJ2RpZC1jbG9zZScsIGhhbmRsZXIpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBfZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZGlkLWNsb3NlJywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0Rm9yVXJpKHVyaTogTnVjbGlkZVVyaSk6ID9SZW1vdGVDb25uZWN0aW9uIHtcbiAgICBjb25zdCB7aG9zdG5hbWUsIHBhdGh9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgaWYgKGhvc3RuYW1lID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gUmVtb3RlQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lQW5kUGF0aChob3N0bmFtZSwgcGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNhY2hlZCBjb25uZWN0aW9uIG1hdGNoIHRoZSBob3N0bmFtZSBhbmQgdGhlIHBhdGggaGFzIHRoZSBwcmVmaXggb2YgY29ubmVjdGlvbi5jd2QuXG4gICAqIEBwYXJhbSBob3N0bmFtZSBUaGUgY29ubmVjdGVkIHNlcnZlciBob3N0IG5hbWUuXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBhYnNvbHV0ZSBwYXRoIHRoYXQncyBoYXMgdGhlIHByZWZpeCBvZiBjd2Qgb2YgdGhlIGNvbm5lY3Rpb24uXG4gICAqICAgSWYgcGF0aCBpcyBudWxsLCBlbXB0eSBvciB1bmRlZmluZWQsIHRoZW4gcmV0dXJuIHRoZSBjb25uZWN0aW9uIHdoaWNoIG1hdGNoZXNcbiAgICogICB0aGUgaG9zdG5hbWUgYW5kIGlnbm9yZSB0aGUgaW5pdGlhbCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgICovXG4gIHN0YXRpYyBnZXRCeUhvc3RuYW1lQW5kUGF0aChob3N0bmFtZTogc3RyaW5nLCBwYXRoOiA/c3RyaW5nKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLl9jb25uZWN0aW9ucy5maWx0ZXIoY29ubmVjdGlvbiA9PiB7XG4gICAgICByZXR1cm4gY29ubmVjdGlvbi5nZXRSZW1vdGVIb3N0bmFtZSgpID09PSBob3N0bmFtZSAmJlxuICAgICAgICAgICghcGF0aCB8fCBwYXRoLnN0YXJ0c1dpdGgoY29ubmVjdGlvbi5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSkpO1xuICAgIH0pWzBdO1xuICB9XG5cbiAgc3RhdGljIGdldEJ5SG9zdG5hbWUoaG9zdG5hbWU6IHN0cmluZyk6IEFycmF5PFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICByZXR1cm4gUmVtb3RlQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMuZmlsdGVyKFxuICAgICAgY29ubmVjdGlvbiA9PiBjb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCkgPT09IGhvc3RuYW1lLFxuICAgICk7XG4gIH1cblxuICBnZXRTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIGNvbnN0IFtzZXJ2aWNlQ29uZmlnXSA9IG5ld1NlcnZpY2VzLmZpbHRlcihjb25maWcgPT4gY29uZmlnLm5hbWUgPT09IHNlcnZpY2VOYW1lKTtcbiAgICBpbnZhcmlhbnQoc2VydmljZUNvbmZpZyAhPSBudWxsLCBgTm8gY29uZmlnIGZvdW5kIGZvciBzZXJ2aWNlICR7c2VydmljZU5hbWV9YCk7XG4gICAgcmV0dXJuIGdldFByb3h5KHNlcnZpY2VDb25maWcubmFtZSwgc2VydmljZUNvbmZpZy5kZWZpbml0aW9uLCB0aGlzLmdldENsaWVudCgpKTtcbiAgfVxuXG4gIGdldFNvY2tldCgpOiBOdWNsaWRlU29ja2V0IHtcbiAgICByZXR1cm4gdGhpcy5nZXRDbGllbnQoKS5nZXRTb2NrZXQoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUmVtb3RlQ29ubmVjdGlvbixcbiAgX190ZXN0X186IHtcbiAgICBjb25uZWN0aW9uczogUmVtb3RlQ29ubmVjdGlvbi5fY29ubmVjdGlvbnMsXG4gICAgZ2V0UmVsb2FkS2V5c3Ryb2tlTGFiZWwsXG4gIH0sXG59O1xuIl19