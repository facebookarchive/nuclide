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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideCommons = require('../../nuclide-commons');

var _ServerConnection = require('./ServerConnection');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var remoteUri = require('../../nuclide-remote-uri');
var logger = require('../../nuclide-logging').getLogger();

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var _require3 = require('./RemoteConnectionConfigurationManager');

var getConnectionConfig = _require3.getConnectionConfig;

var FILE_WATCHER_SERVICE = 'FileWatcherService';
var FILE_SYSTEM_SERVICE = 'FileSystemService';

// key for https connection.

var _emitter = new EventEmitter();

// A RemoteConnection represents a directory which has been opened in Nuclide on a remote machine.
// This corresponds to what atom calls a 'root path' in a project.
//
// TODO: The _entries and _hgRepositoryDescription should not be here.
// Nuclide behaves badly when remote directories are opened which are parent/child of each other.
// And there needn't be a 1:1 relationship between RemoteConnections and hg repos.

var RemoteConnection = (function () {
  _createClass(RemoteConnection, null, [{
    key: 'findOrCreate',
    value: _asyncToGenerator(function* (config) {
      var serverConnection = yield _ServerConnection.ServerConnection.getOrCreate(config);
      var connection = new RemoteConnection(serverConnection, config.cwd, config.displayTitle);
      return yield connection._initialize();
    })

    // Do NOT call this directly. Use findOrCreate instead.
  }]);

  function RemoteConnection(connection, cwd, displayTitle) {
    _classCallCheck(this, RemoteConnection);

    this._cwd = cwd;
    this._subscriptions = new CompositeDisposable();
    this._hgRepositoryDescription = null;
    this._connection = connection;
    this._displayTitle = displayTitle;
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
      var symlink = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return this._connection.createDirectory(uri, this._hgRepositoryDescription, symlink);
    }

    // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
  }, {
    key: '_setHgRepositoryDescription',
    value: function _setHgRepositoryDescription(hgRepositoryDescription) {
      this._hgRepositoryDescription = hgRepositoryDescription;
    }
  }, {
    key: 'getHgRepositoryDescription',
    value: function getHgRepositoryDescription() {
      return this._hgRepositoryDescription;
    }
  }, {
    key: 'createFile',
    value: function createFile(uri) {
      var symlink = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return this._connection.createFile(uri, symlink);
    }
  }, {
    key: '_initialize',
    value: _asyncToGenerator(function* () {
      var attemptShutdown = false;
      // Must add first to prevent the ServerConnection from going away
      // in a possible race.
      this._connection.addConnection(this);
      try {
        var FileSystemService = this.getService(FILE_SYSTEM_SERVICE);
        var resolvedPath = yield FileSystemService.resolveRealPath(this._cwd);

        // Now that we know the real path, it's possible this collides with an existing connection.
        // If so, we should just stop immediately.
        if (resolvedPath !== this._cwd) {
          var existingConnection = RemoteConnection.getByHostnameAndPath(this.getRemoteHostname(), resolvedPath);
          (0, _assert2['default'])(this !== existingConnection);
          if (existingConnection != null) {
            this.close(attemptShutdown);
            return existingConnection;
          }

          this._cwd = resolvedPath;
        }

        // A workaround before Atom 2.0: see ::getHgRepoInfo.
        yield this._setHgRepoInfo();

        _emitter.emit('did-add', this);
        this._watchRootProjectDirectory();
      } catch (e) {
        this.close(attemptShutdown);
        throw e;
      }
      return this;
    })
  }, {
    key: '_watchRootProjectDirectory',
    value: function _watchRootProjectDirectory() {
      var _this = this;

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

        var FileSystemService = _this.getService(FILE_SYSTEM_SERVICE);
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
      this._subscriptions.add(new _nuclideCommons.DisposableSubscription(subscription));
    }
  }, {
    key: 'close',
    value: function close(shutdownIfLast) {
      this._connection.removeConnection(this, shutdownIfLast);
      _emitter.emit('did-close', this);
    }
  }, {
    key: 'getConnection',
    value: function getConnection() {
      return this._connection;
    }
  }, {
    key: 'getRemoteHost',
    value: function getRemoteHost() {
      return this._connection.getRemoteHost();
    }
  }, {
    key: 'getPort',
    value: function getPort() {
      return this._connection.getPort();
    }
  }, {
    key: 'getRemoteHostname',
    value: function getRemoteHostname() {
      return this._connection.getRemoteHostname();
    }
  }, {
    key: 'getDisplayTitle',
    value: function getDisplayTitle() {
      return this._displayTitle;
    }
  }, {
    key: 'getUriForInitialWorkingDirectory',
    value: function getUriForInitialWorkingDirectory() {
      return this.getUriOfRemotePath(this.getPathForInitialWorkingDirectory());
    }
  }, {
    key: 'getPathForInitialWorkingDirectory',
    value: function getPathForInitialWorkingDirectory() {
      return this._cwd;
    }
  }, {
    key: 'getConfig',
    value: function getConfig() {
      return _extends({}, this._connection.getConfig(), { cwd: this._cwd, displayTitle: this._displayTitle });
    }
  }, {
    key: 'getService',
    value: function getService(serviceName) {
      return this._connection.getService(serviceName);
    }
  }, {
    key: 'isOnlyConnection',
    value: function isOnlyConnection() {
      return this._connection.getConnections().length === 1;
    }
  }], [{
    key: '_createInsecureConnectionForTesting',
    value: function _createInsecureConnectionForTesting(cwd, port) {
      var config = {
        host: 'localhost',
        port: port,
        cwd: cwd,
        displayTitle: ''
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
    value: _asyncToGenerator(function* (host, cwd, displayTitle) {
      var connectionConfig = getConnectionConfig(host);
      if (!connectionConfig) {
        return null;
      }
      try {
        var config = _extends({}, connectionConfig, { cwd: cwd, displayTitle: displayTitle });
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
      var _remoteUri$parse = remoteUri.parse(uri);

      var hostname = _remoteUri$parse.hostname;
      var path = _remoteUri$parse.path;

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
      return RemoteConnection.getByHostname(hostname).filter(function (connection) {
        return path.startsWith(connection.getPathForInitialWorkingDirectory());
      })[0];
    }
  }, {
    key: 'getByHostname',
    value: function getByHostname(hostname) {
      var server = _ServerConnection.ServerConnection.getByHostname(hostname);
      return server == null ? [] : server.getConnections();
    }
  }]);

  return RemoteConnection;
})();

exports.RemoteConnection = RemoteConnection;
// host nuclide server is running on.
// port to connect to.
// Path to remote directory user should start in upon connection.
// Name of the saved connection profile.
// certificate of certificate authority.
// client certificate for https connection.
// Path to remote directory user should start in upon connection.
//# sourceMappingURL=data:application/json;base64,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QUM3QyxDQUFDLENBQUM7S0FDSjs7O1dBRWdDLG9DQUFDLE9BQStDLEVBQWM7QUFDN0YsY0FBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbEMsYUFBTyxJQUFJLFVBQVUsQ0FBQyxZQUFNO0FBQzFCLGdCQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUMvQyxDQUFDLENBQUM7S0FDSjs7O1dBRWUsbUJBQUMsR0FBZSxFQUFxQjs2QkFDMUIsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7O1VBQXRDLFFBQVEsb0JBQVIsUUFBUTtVQUFFLElBQUksb0JBQUosSUFBSTs7QUFDckIsVUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxhQUFPLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM5RDs7Ozs7Ozs7Ozs7V0FTMEIsOEJBQUMsUUFBZ0IsRUFBRSxJQUFZLEVBQXFCO0FBQzdFLGFBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUNuRSxlQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxFQUFFLENBQUMsQ0FBQztPQUN4RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDUDs7O1dBRW1CLHVCQUFDLFFBQWdCLEVBQTJCO0FBQzlELFVBQU0sTUFBTSxHQUFHLG1DQUFpQixhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEQsYUFBTyxNQUFNLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdEQ7OztTQTNQVSxnQkFBZ0IiLCJmaWxlIjoiUmVtb3RlQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeURlc2NyaXB0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXNvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuXG5pbXBvcnQgdHlwZW9mICogYXMgRmlsZVdhdGNoZXJTZXJ2aWNlVHlwZSBmcm9tICcuLi8uLi9udWNsaWRlLWZpbGV3YXRjaGVyLWJhc2UnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFNvdXJjZUNvbnRyb2xTZXJ2aWNlIGZyb20gJy4uLy4uL251Y2xpZGUtc2VydmVyL2xpYi9zZXJ2aWNlcy9Tb3VyY2VDb250cm9sU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7UmVtb3RlRmlsZX0gZnJvbSAnLi9SZW1vdGVGaWxlJztcbmltcG9ydCB0eXBlIHtSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4vUmVtb3RlRGlyZWN0b3J5JztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtEaXNwb3NhYmxlU3Vic2NyaXB0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtTZXJ2ZXJDb25uZWN0aW9ufSBmcm9tICcuL1NlcnZlckNvbm5lY3Rpb24nO1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3Qge0V2ZW50RW1pdHRlcn0gPSByZXF1aXJlKCdldmVudHMnKTtcblxuY29uc3Qge2dldENvbm5lY3Rpb25Db25maWd9ID1cbiAgcmVxdWlyZSgnLi9SZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbk1hbmFnZXInKTtcblxuY29uc3QgRklMRV9XQVRDSEVSX1NFUlZJQ0UgPSAnRmlsZVdhdGNoZXJTZXJ2aWNlJztcbmNvbnN0IEZJTEVfU1lTVEVNX1NFUlZJQ0UgPSAnRmlsZVN5c3RlbVNlcnZpY2UnO1xuXG5leHBvcnQgdHlwZSBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nOyAvLyBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb24uXG4gIHBvcnQ6IG51bWJlcjsgLy8gcG9ydCB0byBjb25uZWN0IHRvLlxuICBjd2Q6IHN0cmluZzsgLy8gUGF0aCB0byByZW1vdGUgZGlyZWN0b3J5IHVzZXIgc2hvdWxkIHN0YXJ0IGluIHVwb24gY29ubmVjdGlvbi5cbiAgZGlzcGxheVRpdGxlOiBzdHJpbmc7IC8vIE5hbWUgb2YgdGhlIHNhdmVkIGNvbm5lY3Rpb24gcHJvZmlsZS5cbiAgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjsgLy8gY2VydGlmaWNhdGUgb2YgY2VydGlmaWNhdGUgYXV0aG9yaXR5LlxuICBjbGllbnRDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjsgLy8gY2xpZW50IGNlcnRpZmljYXRlIGZvciBodHRwcyBjb25uZWN0aW9uLlxuICBjbGllbnRLZXk/OiBCdWZmZXI7IC8vIGtleSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbn07XG5cbmNvbnN0IF9lbWl0dGVyOiBFdmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbi8vIEEgUmVtb3RlQ29ubmVjdGlvbiByZXByZXNlbnRzIGEgZGlyZWN0b3J5IHdoaWNoIGhhcyBiZWVuIG9wZW5lZCBpbiBOdWNsaWRlIG9uIGEgcmVtb3RlIG1hY2hpbmUuXG4vLyBUaGlzIGNvcnJlc3BvbmRzIHRvIHdoYXQgYXRvbSBjYWxscyBhICdyb290IHBhdGgnIGluIGEgcHJvamVjdC5cbi8vXG4vLyBUT0RPOiBUaGUgX2VudHJpZXMgYW5kIF9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiBzaG91bGQgbm90IGJlIGhlcmUuXG4vLyBOdWNsaWRlIGJlaGF2ZXMgYmFkbHkgd2hlbiByZW1vdGUgZGlyZWN0b3JpZXMgYXJlIG9wZW5lZCB3aGljaCBhcmUgcGFyZW50L2NoaWxkIG9mIGVhY2ggb3RoZXIuXG4vLyBBbmQgdGhlcmUgbmVlZG4ndCBiZSBhIDE6MSByZWxhdGlvbnNoaXAgYmV0d2VlbiBSZW1vdGVDb25uZWN0aW9ucyBhbmQgaGcgcmVwb3MuXG5leHBvcnQgY2xhc3MgUmVtb3RlQ29ubmVjdGlvbiB7XG4gIF9jd2Q6IHN0cmluZzsgLy8gUGF0aCB0byByZW1vdGUgZGlyZWN0b3J5IHVzZXIgc2hvdWxkIHN0YXJ0IGluIHVwb24gY29ubmVjdGlvbi5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICBfY29ubmVjdGlvbjogU2VydmVyQ29ubmVjdGlvbjtcbiAgX2Rpc3BsYXlUaXRsZTogc3RyaW5nO1xuXG4gIHN0YXRpYyBhc3luYyBmaW5kT3JDcmVhdGUoY29uZmlnOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbik6XG4gICAgICBQcm9taXNlPFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBzZXJ2ZXJDb25uZWN0aW9uID0gYXdhaXQgU2VydmVyQ29ubmVjdGlvbi5nZXRPckNyZWF0ZShjb25maWcpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgUmVtb3RlQ29ubmVjdGlvbihzZXJ2ZXJDb25uZWN0aW9uLCBjb25maWcuY3dkLCBjb25maWcuZGlzcGxheVRpdGxlKTtcbiAgICByZXR1cm4gYXdhaXQgY29ubmVjdGlvbi5faW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgLy8gRG8gTk9UIGNhbGwgdGhpcyBkaXJlY3RseS4gVXNlIGZpbmRPckNyZWF0ZSBpbnN0ZWFkLlxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBTZXJ2ZXJDb25uZWN0aW9uLCBjd2Q6IHN0cmluZywgZGlzcGxheVRpdGxlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9jd2QgPSBjd2Q7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICAgIHRoaXMuX2Rpc3BsYXlUaXRsZSA9IGRpc3BsYXlUaXRsZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBzdGF0aWMgX2NyZWF0ZUluc2VjdXJlQ29ubmVjdGlvbkZvclRlc3RpbmcoXG4gICAgY3dkOiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICApOiBQcm9taXNlPFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgIHBvcnQsXG4gICAgICBjd2QsXG4gICAgICBkaXNwbGF5VGl0bGU6ICcnLFxuICAgIH07XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uZmluZE9yQ3JlYXRlKGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgY29ubmVjdGlvbiBieSByZXVzaW5nIHRoZSBjb25maWd1cmF0aW9uIG9mIGxhc3Qgc3VjY2Vzc2Z1bCBjb25uZWN0aW9uIGFzc29jaWF0ZWQgd2l0aFxuICAgKiBnaXZlbiBob3N0LiBJZiB0aGUgc2VydmVyJ3MgY2VydHMgaGFzIGJlZW4gdXBkYXRlZCBvciB0aGVyZSBpcyBubyBwcmV2aW91cyBzdWNjZXNzZnVsXG4gICAqIGNvbm5lY3Rpb24sIG51bGwgKHJlc29sdmVkIGJ5IHByb21pc2UpIGlzIHJldHVybmVkLlxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGNyZWF0ZUNvbm5lY3Rpb25CeVNhdmVkQ29uZmlnKFxuICAgIGhvc3Q6IHN0cmluZyxcbiAgICBjd2Q6IHN0cmluZyxcbiAgICBkaXNwbGF5VGl0bGU6IHN0cmluZ1xuICApOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29ubmVjdGlvbkNvbmZpZyA9IGdldENvbm5lY3Rpb25Db25maWcoaG9zdCk7XG4gICAgaWYgKCFjb25uZWN0aW9uQ29uZmlnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHsuLi5jb25uZWN0aW9uQ29uZmlnLCBjd2QsIGRpc3BsYXlUaXRsZX07XG4gICAgICByZXR1cm4gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5maW5kT3JDcmVhdGUoY29uZmlnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHJldXNlIGNvbm5lY3Rpb25Db25maWd1cmF0aW9uIGZvciAke2hvc3R9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBBdG9tJ3MgUHJvamVjdDo6c2V0UGF0aHMgY3VycmVudGx5IHVzZXNcbiAgLy8gOjpyZXBvc2l0b3J5Rm9yRGlyZWN0b3J5U3luYywgc28gd2UgbmVlZCB0aGUgcmVwbyBpbmZvcm1hdGlvbiB0byBhbHJlYWR5IGJlXG4gIC8vIGF2YWlsYWJsZSB3aGVuIHRoZSBuZXcgcGF0aCBpcyBhZGRlZC4gdDY5MTM2MjQgdHJhY2tzIGNsZWFudXAgb2YgdGhpcy5cbiAgYXN5bmMgX3NldEhnUmVwb0luZm8oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVtb3RlUGF0aCA9IHRoaXMuZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qge2dldEhnUmVwb3NpdG9yeX0gPSAodGhpcy5nZXRTZXJ2aWNlKCdTb3VyY2VDb250cm9sU2VydmljZScpOiBTb3VyY2VDb250cm9sU2VydmljZSk7XG4gICAgdGhpcy5fc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oYXdhaXQgZ2V0SGdSZXBvc2l0b3J5KHJlbW90ZVBhdGgpKTtcbiAgfVxuXG4gIGdldFVyaU9mUmVtb3RlUGF0aChyZW1vdGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbnVjbGlkZTovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9JHtyZW1vdGVQYXRofWA7XG4gIH1cblxuICBnZXRQYXRoT2ZVcmkodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiByZW1vdGVVcmkucGFyc2UodXJpKS5wYXRoO1xuICB9XG5cbiAgY3JlYXRlRGlyZWN0b3J5KHVyaTogc3RyaW5nLCBzeW1saW5rOiBib29sZWFuID0gZmFsc2UpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uLmNyZWF0ZURpcmVjdG9yeSh1cmksIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uLCBzeW1saW5rKTtcbiAgfVxuXG4gIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8gb2YgbWFpbi5qcy5cbiAgX3NldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKGhnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiA9IGhnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICB9XG5cbiAgZ2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oKTogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIH1cblxuICBjcmVhdGVGaWxlKHVyaTogc3RyaW5nLCBzeW1saW5rOiBib29sZWFuID0gZmFsc2UpOiBSZW1vdGVGaWxlIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5jcmVhdGVGaWxlKHVyaSwgc3ltbGluayk7XG4gIH1cblxuICBhc3luYyBfaW5pdGlhbGl6ZSgpOiBQcm9taXNlPFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBhdHRlbXB0U2h1dGRvd24gPSBmYWxzZTtcbiAgICAvLyBNdXN0IGFkZCBmaXJzdCB0byBwcmV2ZW50IHRoZSBTZXJ2ZXJDb25uZWN0aW9uIGZyb20gZ29pbmcgYXdheVxuICAgIC8vIGluIGEgcG9zc2libGUgcmFjZS5cbiAgICB0aGlzLl9jb25uZWN0aW9uLmFkZENvbm5lY3Rpb24odGhpcyk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IEZpbGVTeXN0ZW1TZXJ2aWNlID0gdGhpcy5nZXRTZXJ2aWNlKEZJTEVfU1lTVEVNX1NFUlZJQ0UpO1xuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gYXdhaXQgRmlsZVN5c3RlbVNlcnZpY2UucmVzb2x2ZVJlYWxQYXRoKHRoaXMuX2N3ZCk7XG5cbiAgICAgIC8vIE5vdyB0aGF0IHdlIGtub3cgdGhlIHJlYWwgcGF0aCwgaXQncyBwb3NzaWJsZSB0aGlzIGNvbGxpZGVzIHdpdGggYW4gZXhpc3RpbmcgY29ubmVjdGlvbi5cbiAgICAgIC8vIElmIHNvLCB3ZSBzaG91bGQganVzdCBzdG9wIGltbWVkaWF0ZWx5LlxuICAgICAgaWYgKHJlc29sdmVkUGF0aCAhPT0gdGhpcy5fY3dkKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nQ29ubmVjdGlvbiA9XG4gICAgICAgICAgICBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKHRoaXMuZ2V0UmVtb3RlSG9zdG5hbWUoKSwgcmVzb2x2ZWRQYXRoKTtcbiAgICAgICAgaW52YXJpYW50KHRoaXMgIT09IGV4aXN0aW5nQ29ubmVjdGlvbik7XG4gICAgICAgIGlmIChleGlzdGluZ0Nvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuY2xvc2UoYXR0ZW1wdFNodXRkb3duKTtcbiAgICAgICAgICByZXR1cm4gZXhpc3RpbmdDb25uZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3dkID0gcmVzb2x2ZWRQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBzZWUgOjpnZXRIZ1JlcG9JbmZvLlxuICAgICAgYXdhaXQgdGhpcy5fc2V0SGdSZXBvSW5mbygpO1xuXG4gICAgICBfZW1pdHRlci5lbWl0KCdkaWQtYWRkJywgdGhpcyk7XG4gICAgICB0aGlzLl93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5jbG9zZShhdHRlbXB0U2h1dGRvd24pO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfd2F0Y2hSb290UHJvamVjdERpcmVjdG9yeSgpOiB2b2lkIHtcbiAgICBjb25zdCByb290RGlyZWN0b3J5VXJpID0gdGhpcy5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IHJvb3REaXJlY3RvdHlQYXRoID0gdGhpcy5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgICBjb25zdCBGaWxlV2F0Y2hlclNlcnZpY2U6IEZpbGVXYXRjaGVyU2VydmljZVR5cGUgPSB0aGlzLmdldFNlcnZpY2UoRklMRV9XQVRDSEVSX1NFUlZJQ0UpO1xuICAgIGludmFyaWFudChGaWxlV2F0Y2hlclNlcnZpY2UpO1xuICAgIGNvbnN0IHt3YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZX0gPSBGaWxlV2F0Y2hlclNlcnZpY2U7XG4gICAgLy8gU3RhcnQgd2F0Y2hpbmcgdGhlIHByb2plY3QgZm9yIGNoYW5nZXMgYW5kIGluaXRpYWxpemUgdGhlIHJvb3Qgd2F0Y2hlclxuICAgIC8vIGZvciBuZXh0IGNhbGxzIHRvIGB3YXRjaEZpbGVgIGFuZCBgd2F0Y2hEaXJlY3RvcnlgLlxuICAgIGNvbnN0IHdhdGNoU3RyZWFtID0gd2F0Y2hEaXJlY3RvcnlSZWN1cnNpdmUocm9vdERpcmVjdG9yeVVyaSk7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gd2F0Y2hTdHJlYW0uc3Vic2NyaWJlKHdhdGNoVXBkYXRlID0+IHtcbiAgICAgIC8vIE5vdGhpbmcgbmVlZHMgdG8gYmUgZG9uZSBpZiB0aGUgcm9vdCBkaXJlY3Rvcnkgd2FzIHdhdGNoZWQgY29ycmVjdGx5LlxuICAgICAgLy8gTGV0J3MganVzdCBjb25zb2xlIGxvZyBpdCBhbnl3YXkuXG4gICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hlciBGZWF0dXJlcyBJbml0aWFsaXplZCBmb3IgcHJvamVjdDogJHtyb290RGlyZWN0b3J5VXJpfWAsIHdhdGNoVXBkYXRlKTtcbiAgICB9LCBhc3luYyBlcnJvciA9PiB7XG4gICAgICBsZXQgd2FybmluZ01lc3NhZ2VUb1VzZXIgPSBgWW91IGp1c3QgY29ubmVjdGVkIHRvIGEgcmVtb3RlIHByb2plY3QgYCArXG4gICAgICAgIGBcXGAke3Jvb3REaXJlY3RvdHlQYXRofVxcYCBidXQgd2UgcmVjb21tZW5kIHlvdSByZW1vdmUgdGhpcyBkaXJlY3Rvcnkgbm93IGAgK1xuICAgICAgICBgYmVjYXVzZSBjcnVjaWFsIGZlYXR1cmVzIGxpa2Ugc3luY2VkIHJlbW90ZSBmaWxlIGVkaXRpbmcsIGZpbGUgc2VhcmNoLCBgICtcbiAgICAgICAgYGFuZCBNZXJjdXJpYWwtcmVsYXRlZCB1cGRhdGVzIHdpbGwgbm90IHdvcmsuPGJyLz5gO1xuXG4gICAgICBjb25zdCBsb2dnZWRFcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlIHx8IGVycm9yO1xuICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICBgV2F0Y2hlciBmYWlsZWQgdG8gc3RhcnQgLSB3YXRjaGVyIGZlYXR1cmVzIGRpc2FibGVkISBFcnJvcjogJHtsb2dnZWRFcnJvck1lc3NhZ2V9YFxuICAgICAgKTtcblxuICAgICAgY29uc3QgRmlsZVN5c3RlbVNlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoRklMRV9TWVNURU1fU0VSVklDRSk7XG4gICAgICBpZiAoYXdhaXQgRmlsZVN5c3RlbVNlcnZpY2UuaXNOZnMocm9vdERpcmVjdG90eVBhdGgpKSB7XG4gICAgICAgIHdhcm5pbmdNZXNzYWdlVG9Vc2VyICs9XG4gICAgICAgICAgYFRoaXMgcHJvamVjdCBkaXJlY3Rvcnk6IFxcYCR7cm9vdERpcmVjdG90eVBhdGh9XFxgIGlzIG9uIDxiPlxcYE5GU1xcYDwvYj4gZmlsZXN5c3RlbS4gYCArXG4gICAgICAgICAgYE51Y2xpZGUgd29ya3MgYmVzdCB3aXRoIGxvY2FsIChub24tTkZTKSByb290IGRpcmVjdG9yeS5gICtcbiAgICAgICAgICBgZS5nLiBcXGAvZGF0YS91c2Vycy8kVVNFUlxcYGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuaW5nTWVzc2FnZVRvVXNlciArPVxuICAgICAgICAgIGA8Yj48YSBocmVmPSdodHRwczovL2ZhY2Vib29rLmdpdGh1Yi5pby93YXRjaG1hbi8nPldhdGNobWFuPC9hPiBFcnJvcjo8L2I+YCArXG4gICAgICAgICAgbG9nZ2VkRXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGEgcGVyc2lzdGVudCB3YXJuaW5nIG1lc3NhZ2UgdG8gbWFrZSBzdXJlIHRoZSB1c2VyIHNlZXMgaXQgYmVmb3JlIGRpc21pc3NpbmcuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyh3YXJuaW5nTWVzc2FnZVRvVXNlciwge2Rpc21pc3NhYmxlOiB0cnVlfSk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXRjaCBoYXMgZW5kZWQuXG4gICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hlciBGZWF0dXJlcyBFbmRlZCBmb3IgcHJvamVjdDogJHtyb290RGlyZWN0b3J5VXJpfWApO1xuICAgIH0pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbikpO1xuICB9XG5cbiAgY2xvc2Uoc2h1dGRvd25JZkxhc3Q6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLnJlbW92ZUNvbm5lY3Rpb24odGhpcywgc2h1dGRvd25JZkxhc3QpO1xuICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1jbG9zZScsIHRoaXMpO1xuICB9XG5cbiAgZ2V0Q29ubmVjdGlvbigpOiBTZXJ2ZXJDb25uZWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbjtcbiAgfVxuXG4gIGdldFJlbW90ZUhvc3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5nZXRSZW1vdGVIb3N0KCk7XG4gIH1cblxuICBnZXRQb3J0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uZ2V0UG9ydCgpO1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5nZXRSZW1vdGVIb3N0bmFtZSgpO1xuICB9XG5cbiAgZ2V0RGlzcGxheVRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc3BsYXlUaXRsZTtcbiAgfVxuXG4gIGdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHRoaXMuZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCkpO1xuICB9XG5cbiAgZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N3ZDtcbiAgfVxuXG4gIGdldENvbmZpZygpOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gICAgcmV0dXJuIHsuLi50aGlzLl9jb25uZWN0aW9uLmdldENvbmZpZygpLCBjd2Q6IHRoaXMuX2N3ZCwgZGlzcGxheVRpdGxlOiB0aGlzLl9kaXNwbGF5VGl0bGV9O1xuICB9XG5cbiAgc3RhdGljIG9uRGlkQWRkUmVtb3RlQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtYWRkJywgaGFuZGxlcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgb25EaWRDbG9zZVJlbW90ZUNvbm5lY3Rpb24oaGFuZGxlcjogKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICBfZW1pdHRlci5vbignZGlkLWNsb3NlJywgaGFuZGxlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRGb3JVcmkodXJpOiBOdWNsaWRlVXJpKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIGNvbnN0IHtob3N0bmFtZSwgcGF0aH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBpZiAoaG9zdG5hbWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lLCBwYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY2FjaGVkIGNvbm5lY3Rpb24gbWF0Y2ggdGhlIGhvc3RuYW1lIGFuZCB0aGUgcGF0aCBoYXMgdGhlIHByZWZpeCBvZiBjb25uZWN0aW9uLmN3ZC5cbiAgICogQHBhcmFtIGhvc3RuYW1lIFRoZSBjb25uZWN0ZWQgc2VydmVyIGhvc3QgbmFtZS5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIHBhdGggdGhhdCdzIGhhcyB0aGUgcHJlZml4IG9mIGN3ZCBvZiB0aGUgY29ubmVjdGlvbi5cbiAgICogICBJZiBwYXRoIGlzIG51bGwsIGVtcHR5IG9yIHVuZGVmaW5lZCwgdGhlbiByZXR1cm4gdGhlIGNvbm5lY3Rpb24gd2hpY2ggbWF0Y2hlc1xuICAgKiAgIHRoZSBob3N0bmFtZSBhbmQgaWdub3JlIHRoZSBpbml0aWFsIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAgKi9cbiAgc3RhdGljIGdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6ID9SZW1vdGVDb25uZWN0aW9uIHtcbiAgICByZXR1cm4gUmVtb3RlQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lKGhvc3RuYW1lKS5maWx0ZXIoY29ubmVjdGlvbiA9PiB7XG4gICAgICByZXR1cm4gcGF0aC5zdGFydHNXaXRoKGNvbm5lY3Rpb24uZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCkpO1xuICAgIH0pWzBdO1xuICB9XG5cbiAgc3RhdGljIGdldEJ5SG9zdG5hbWUoaG9zdG5hbWU6IHN0cmluZyk6IEFycmF5PFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBzZXJ2ZXIgPSBTZXJ2ZXJDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoaG9zdG5hbWUpO1xuICAgIHJldHVybiBzZXJ2ZXIgPT0gbnVsbCA/IFtdIDogc2VydmVyLmdldENvbm5lY3Rpb25zKCk7XG4gIH1cblxuICBnZXRTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uLmdldFNlcnZpY2Uoc2VydmljZU5hbWUpO1xuICB9XG5cbiAgaXNPbmx5Q29ubmVjdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5nZXRDb25uZWN0aW9ucygpLmxlbmd0aCA9PT0gMTtcbiAgfVxufVxuIl19