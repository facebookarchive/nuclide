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

var _RemoteDirectory = require('./RemoteDirectory');

var _ServerConnection = require('./ServerConnection');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var remoteUri = require('../../remote-uri');
var logger = require('../../logging').getLogger();

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var _require3 = require('./RemoteFile');

var RemoteFile = _require3.RemoteFile;

var _require4 = require('./RemoteConnectionConfigurationManager');

var getConnectionConfig = _require4.getConnectionConfig;

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
      var connection = new RemoteConnection(serverConnection, config.cwd);
      return yield connection._initialize();
    })

    // Do NOT call this directly. Use findOrCreate instead.
  }]);

  function RemoteConnection(connection, cwd) {
    _classCallCheck(this, RemoteConnection);

    this._entries = {};
    this._cwd = cwd;
    this._subscriptions = new CompositeDisposable();
    this._hgRepositoryDescription = null;
    this._connection = connection;
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
      var _remoteUri$parse = remoteUri.parse(uri);

      var path = _remoteUri$parse.path;

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
      var _remoteUri$parse2 = remoteUri.parse(uri);

      var path = _remoteUri$parse2.path;

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
    key: '_initialize',
    value: _asyncToGenerator(function* () {
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
            this.close();
            return existingConnection;
          }

          this._cwd = resolvedPath;
        }

        // A workaround before Atom 2.0: see ::getHgRepoInfo.
        yield this._setHgRepoInfo();

        _emitter.emit('did-add', this);
        this._watchRootProjectDirectory();
      } catch (e) {
        this.close();
        throw e;
      }
      return this;
    })
  }, {
    key: '_watchRootProjectDirectory',
    value: function _watchRootProjectDirectory() {
      var _this2 = this;

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

        var FileSystemService = _this2.getService(FILE_SYSTEM_SERVICE);
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
      this._connection.removeConnection(this);
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
      return _extends({}, this._connection.getConfig(), { cwd: this._cwd });
    }
  }, {
    key: 'getService',
    value: function getService(serviceName) {
      return this._connection.getService(serviceName);
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
      var _remoteUri$parse3 = remoteUri.parse(uri);

      var hostname = _remoteUri$parse3.hostname;
      var path = _remoteUri$parse3.path;

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
// certificate of certificate authority.
// client certificate for https connection.
// Path to remote directory user should start in upon connection.
//# sourceMappingURL=data:application/json;base64,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O1NBcFNVLGdCQUFnQiIsImZpbGUiOiJSZW1vdGVDb25uZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeURlc2NyaXB0aW9ufSBmcm9tICcuLi8uLi9zb3VyY2UtY29udHJvbC1oZWxwZXJzJztcblxuaW1wb3J0IHR5cGVvZiAqIGFzIEZpbGVXYXRjaGVyU2VydmljZVR5cGUgZnJvbSAnLi4vLi4vZmlsZXdhdGNoZXItYmFzZSc7XG5pbXBvcnQgdHlwZW9mICogYXMgU291cmNlQ29udHJvbFNlcnZpY2UgZnJvbSAnLi4vLi4vc2VydmVyL2xpYi9zZXJ2aWNlcy9Tb3VyY2VDb250cm9sU2VydmljZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7UmVtb3RlRGlyZWN0b3J5fSBmcm9tICcuL1JlbW90ZURpcmVjdG9yeSc7XG5pbXBvcnQge1NlcnZlckNvbm5lY3Rpb259IGZyb20gJy4vU2VydmVyQ29ubmVjdGlvbic7XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS11cmknKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5cbmNvbnN0IHtSZW1vdGVGaWxlfSA9IHJlcXVpcmUoJy4vUmVtb3RlRmlsZScpO1xuY29uc3Qge2dldENvbm5lY3Rpb25Db25maWd9ID1cbiAgcmVxdWlyZSgnLi9SZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbk1hbmFnZXInKTtcblxuY29uc3QgRklMRV9XQVRDSEVSX1NFUlZJQ0UgPSAnRmlsZVdhdGNoZXJTZXJ2aWNlJztcbmNvbnN0IEZJTEVfU1lTVEVNX1NFUlZJQ0UgPSAnRmlsZVN5c3RlbVNlcnZpY2UnO1xuXG5leHBvcnQgdHlwZSBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nOyAvLyBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb24uXG4gIHBvcnQ6IG51bWJlcjsgLy8gcG9ydCB0byBjb25uZWN0IHRvLlxuICBjd2Q6IHN0cmluZzsgLy8gUGF0aCB0byByZW1vdGUgZGlyZWN0b3J5IHVzZXIgc2hvdWxkIHN0YXJ0IGluIHVwb24gY29ubmVjdGlvbi5cbiAgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjsgLy8gY2VydGlmaWNhdGUgb2YgY2VydGlmaWNhdGUgYXV0aG9yaXR5LlxuICBjbGllbnRDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjsgLy8gY2xpZW50IGNlcnRpZmljYXRlIGZvciBodHRwcyBjb25uZWN0aW9uLlxuICBjbGllbnRLZXk/OiBCdWZmZXI7IC8vIGtleSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbn1cblxuY29uc3QgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuLy8gQSBSZW1vdGVDb25uZWN0aW9uIHJlcHJlc2VudHMgYSBkaXJlY3Rvcnkgd2hpY2ggaGFzIGJlZW4gb3BlbmVkIGluIE51Y2xpZGUgb24gYSByZW1vdGUgbWFjaGluZS5cbi8vIFRoaXMgY29ycmVzcG9uZHMgdG8gd2hhdCBhdG9tIGNhbGxzIGEgJ3Jvb3QgcGF0aCcgaW4gYSBwcm9qZWN0LlxuLy9cbi8vIFRPRE86IFRoZSBfZW50cmllcyBhbmQgX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uIHNob3VsZCBub3QgYmUgaGVyZS5cbi8vIE51Y2xpZGUgYmVoYXZlcyBiYWRseSB3aGVuIHJlbW90ZSBkaXJlY3RvcmllcyBhcmUgb3BlbmVkIHdoaWNoIGFyZSBwYXJlbnQvY2hpbGQgb2YgZWFjaCBvdGhlci5cbi8vIEFuZCB0aGVyZSBuZWVkbid0IGJlIGEgMToxIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIFJlbW90ZUNvbm5lY3Rpb25zIGFuZCBoZyByZXBvcy5cbmV4cG9ydCBjbGFzcyBSZW1vdGVDb25uZWN0aW9uIHtcbiAgX2VudHJpZXM6IHtbcGF0aDogc3RyaW5nXTogUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeX07XG4gIF9jd2Q6IHN0cmluZzsgLy8gUGF0aCB0byByZW1vdGUgZGlyZWN0b3J5IHVzZXIgc2hvdWxkIHN0YXJ0IGluIHVwb24gY29ubmVjdGlvbi5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICBfY29ubmVjdGlvbjogU2VydmVyQ29ubmVjdGlvbjtcblxuICBzdGF0aWMgYXN5bmMgZmluZE9yQ3JlYXRlKGNvbmZpZzogUmVtb3RlQ29ubmVjdGlvbkNvbmZpZ3VyYXRpb24pOlxuICAgICAgUHJvbWlzZTxSZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgY29uc3Qgc2VydmVyQ29ubmVjdGlvbiA9IGF3YWl0IFNlcnZlckNvbm5lY3Rpb24uZ2V0T3JDcmVhdGUoY29uZmlnKTtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IFJlbW90ZUNvbm5lY3Rpb24oc2VydmVyQ29ubmVjdGlvbiwgY29uZmlnLmN3ZCk7XG4gICAgcmV0dXJuIGF3YWl0IGNvbm5lY3Rpb24uX2luaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8vIERvIE5PVCBjYWxsIHRoaXMgZGlyZWN0bHkuIFVzZSBmaW5kT3JDcmVhdGUgaW5zdGVhZC5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogU2VydmVyQ29ubmVjdGlvbiwgY3dkOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9lbnRyaWVzID0ge307XG4gICAgdGhpcy5fY3dkID0gY3dkO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBzdGF0aWMgX2NyZWF0ZUluc2VjdXJlQ29ubmVjdGlvbkZvclRlc3RpbmcoXG4gICAgY3dkOiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICApOiBQcm9taXNlPFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgIHBvcnQsXG4gICAgICBjd2QsXG4gICAgfTtcbiAgICByZXR1cm4gUmVtb3RlQ29ubmVjdGlvbi5maW5kT3JDcmVhdGUoY29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBjb25uZWN0aW9uIGJ5IHJldXNpbmcgdGhlIGNvbmZpZ3VyYXRpb24gb2YgbGFzdCBzdWNjZXNzZnVsIGNvbm5lY3Rpb24gYXNzb2NpYXRlZCB3aXRoXG4gICAqIGdpdmVuIGhvc3QuIElmIHRoZSBzZXJ2ZXIncyBjZXJ0cyBoYXMgYmVlbiB1cGRhdGVkIG9yIHRoZXJlIGlzIG5vIHByZXZpb3VzIHN1Y2Nlc3NmdWxcbiAgICogY29ubmVjdGlvbiwgbnVsbCAocmVzb2x2ZWQgYnkgcHJvbWlzZSkgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY3JlYXRlQ29ubmVjdGlvbkJ5U2F2ZWRDb25maWcoXG4gICAgaG9zdDogc3RyaW5nLFxuICAgIGN3ZDogc3RyaW5nLFxuICApOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29ubmVjdGlvbkNvbmZpZyA9IGdldENvbm5lY3Rpb25Db25maWcoaG9zdCk7XG4gICAgaWYgKCFjb25uZWN0aW9uQ29uZmlnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHsuLi5jb25uZWN0aW9uQ29uZmlnLCBjd2R9O1xuICAgICAgcmV0dXJuIGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uZmluZE9yQ3JlYXRlKGNvbmZpZyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLndhcm4oYEZhaWxlZCB0byByZXVzZSBjb25uZWN0aW9uQ29uZmlndXJhdGlvbiBmb3IgJHtob3N0fWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogQXRvbSdzIFByb2plY3Q6OnNldFBhdGhzIGN1cnJlbnRseSB1c2VzXG4gIC8vIDo6cmVwb3NpdG9yeUZvckRpcmVjdG9yeVN5bmMsIHNvIHdlIG5lZWQgdGhlIHJlcG8gaW5mb3JtYXRpb24gdG8gYWxyZWFkeSBiZVxuICAvLyBhdmFpbGFibGUgd2hlbiB0aGUgbmV3IHBhdGggaXMgYWRkZWQuIHQ2OTEzNjI0IHRyYWNrcyBjbGVhbnVwIG9mIHRoaXMuXG4gIGFzeW5jIF9zZXRIZ1JlcG9JbmZvKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlbW90ZVBhdGggPSB0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IHtnZXRIZ1JlcG9zaXRvcnl9ID0gKHRoaXMuZ2V0U2VydmljZSgnU291cmNlQ29udHJvbFNlcnZpY2UnKTogU291cmNlQ29udHJvbFNlcnZpY2UpO1xuICAgIHRoaXMuX3NldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKGF3YWl0IGdldEhnUmVwb3NpdG9yeShyZW1vdGVQYXRoKSk7XG4gIH1cblxuICBnZXRVcmlPZlJlbW90ZVBhdGgocmVtb3RlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG51Y2xpZGU6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfSR7cmVtb3RlUGF0aH1gO1xuICB9XG5cbiAgZ2V0UGF0aE9mVXJpKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVtb3RlVXJpLnBhcnNlKHVyaSkucGF0aDtcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdG9yeSh1cmk6IHN0cmluZyk6IFJlbW90ZURpcmVjdG9yeSB7XG4gICAgbGV0IHtwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJykubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRGlyZWN0b3J5KFxuICAgICAgICB0aGlzLFxuICAgICAgICB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSxcbiAgICAgICAge2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbn1cbiAgICAgICk7XG4gICAgICAvLyBUT0RPOiBXZSBzaG91bGQgYWRkIHRoZSBmb2xsb3dpbmcgbGluZSB0byBrZWVwIHRoZSBjYWNoZSB1cC10by1kYXRlLlxuICAgICAgLy8gV2UgbmVlZCB0byBpbXBsZW1lbnQgb25EaWRSZW5hbWUgYW5kIG9uRGlkRGVsZXRlIGluIFJlbW90ZURpcmVjdG9yeVxuICAgICAgLy8gZmlyc3QuIEl0J3Mgb2sgdGhhdCB3ZSBkb24ndCBhZGQgdGhlIGhhbmRsZXJzIGZvciBub3cgc2luY2Ugd2UgaGF2ZVxuICAgICAgLy8gdGhlIGNoZWNrIGBlbnRyeS5nZXRMb2NhbFBhdGgoKSAhPT0gcGF0aGAgYWJvdmUuXG4gICAgICAvL1xuICAgICAgLy8gdGhpcy5fYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeSk7XG4gICAgfVxuXG4gICAgaW52YXJpYW50KGVudHJ5IGluc3RhbmNlb2YgUmVtb3RlRGlyZWN0b3J5KTtcbiAgICBpZiAoIWVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGF0aCBpcyBub3QgYSBkaXJlY3Rvcnk6JyArIHVyaSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mbyBvZiBtYWluLmpzLlxuICBfc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oaGdSZXBvc2l0b3J5RGVzY3JpcHRpb246ID9IZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uID0gaGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIH1cblxuICBjcmVhdGVGaWxlKHVyaTogc3RyaW5nKTogUmVtb3RlRmlsZSB7XG4gICAgbGV0IHtwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJykubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoIWVudHJ5IHx8IGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRmlsZSh0aGlzLCB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSk7XG4gICAgICB0aGlzLl9hZGRIYW5kbGVyc0ZvckVudHJ5KGVudHJ5KTtcbiAgICB9XG5cbiAgICBpbnZhcmlhbnQoZW50cnkgaW5zdGFuY2VvZiBSZW1vdGVGaWxlKTtcbiAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGlzIG5vdCBhIGZpbGUnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICBfYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeTogUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeSk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFBhdGggPSBlbnRyeS5nZXRMb2NhbFBhdGgoKTtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgY29uc3QgcmVuYW1lU3Vic2NyaXB0aW9uID0gZW50cnkub25EaWRSZW5hbWUoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2VudHJpZXNbb2xkUGF0aF07XG4gICAgICB0aGlzLl9lbnRyaWVzW2VudHJ5LmdldExvY2FsUGF0aCgpXSA9IGVudHJ5O1xuICAgIH0pO1xuICAgIC8qICRGbG93Rml4TWUgKi9cbiAgICBjb25zdCBkZWxldGVTdWJzY3JpcHRpb24gPSBlbnRyeS5vbkRpZERlbGV0ZSgoKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5fZW50cmllc1tlbnRyeS5nZXRMb2NhbFBhdGgoKV07XG4gICAgICByZW5hbWVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgZGVsZXRlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9pbml0aWFsaXplKCk6IFByb21pc2U8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIC8vIE11c3QgYWRkIGZpcnN0IHRvIHByZXZlbnQgdGhlIFNlcnZlckNvbm5lY3Rpb24gZnJvbSBnb2luZyBhd2F5XG4gICAgLy8gaW4gYSBwb3NzaWJsZSByYWNlLlxuICAgIHRoaXMuX2Nvbm5lY3Rpb24uYWRkQ29ubmVjdGlvbih0aGlzKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgRmlsZVN5c3RlbVNlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoRklMRV9TWVNURU1fU0VSVklDRSk7XG4gICAgICBjb25zdCByZXNvbHZlZFBhdGggPSBhd2FpdCBGaWxlU3lzdGVtU2VydmljZS5yZXNvbHZlUmVhbFBhdGgodGhpcy5fY3dkKTtcblxuICAgICAgLy8gTm93IHRoYXQgd2Uga25vdyB0aGUgcmVhbCBwYXRoLCBpdCdzIHBvc3NpYmxlIHRoaXMgY29sbGlkZXMgd2l0aCBhbiBleGlzdGluZyBjb25uZWN0aW9uLlxuICAgICAgLy8gSWYgc28sIHdlIHNob3VsZCBqdXN0IHN0b3AgaW1tZWRpYXRlbHkuXG4gICAgICBpZiAocmVzb2x2ZWRQYXRoICE9PSB0aGlzLl9jd2QpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdDb25uZWN0aW9uID1cbiAgICAgICAgICAgIFJlbW90ZUNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZUFuZFBhdGgodGhpcy5nZXRSZW1vdGVIb3N0bmFtZSgpLCByZXNvbHZlZFBhdGgpO1xuICAgICAgICBpbnZhcmlhbnQodGhpcyAhPT0gZXhpc3RpbmdDb25uZWN0aW9uKTtcbiAgICAgICAgaWYgKGV4aXN0aW5nQ29ubmVjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybiBleGlzdGluZ0Nvbm5lY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jd2QgPSByZXNvbHZlZFBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8uXG4gICAgICBhd2FpdCB0aGlzLl9zZXRIZ1JlcG9JbmZvKCk7XG5cbiAgICAgIF9lbWl0dGVyLmVtaXQoJ2RpZC1hZGQnLCB0aGlzKTtcbiAgICAgIHRoaXMuX3dhdGNoUm9vdFByb2plY3REaXJlY3RvcnkoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3REaXJlY3RvcnlVcmkgPSB0aGlzLmdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qgcm9vdERpcmVjdG90eVBhdGggPSB0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IEZpbGVXYXRjaGVyU2VydmljZTogRmlsZVdhdGNoZXJTZXJ2aWNlVHlwZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1dBVENIRVJfU0VSVklDRSk7XG4gICAgaW52YXJpYW50KEZpbGVXYXRjaGVyU2VydmljZSk7XG4gICAgY29uc3Qge3dhdGNoRGlyZWN0b3J5UmVjdXJzaXZlfSA9IEZpbGVXYXRjaGVyU2VydmljZTtcbiAgICAvLyBTdGFydCB3YXRjaGluZyB0aGUgcHJvamVjdCBmb3IgY2hhbmdlcyBhbmQgaW5pdGlhbGl6ZSB0aGUgcm9vdCB3YXRjaGVyXG4gICAgLy8gZm9yIG5leHQgY2FsbHMgdG8gYHdhdGNoRmlsZWAgYW5kIGB3YXRjaERpcmVjdG9yeWAuXG4gICAgY29uc3Qgd2F0Y2hTdHJlYW0gPSB3YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZShyb290RGlyZWN0b3J5VXJpKTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB3YXRjaFN0cmVhbS5zdWJzY3JpYmUod2F0Y2hVcGRhdGUgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXMgd2F0Y2hlZCBjb3JyZWN0bHkuXG4gICAgICAvLyBMZXQncyBqdXN0IGNvbnNvbGUgbG9nIGl0IGFueXdheS5cbiAgICAgIGxvZ2dlci5pbmZvKGBXYXRjaGVyIEZlYXR1cmVzIEluaXRpYWxpemVkIGZvciBwcm9qZWN0OiAke3Jvb3REaXJlY3RvcnlVcml9YCwgd2F0Y2hVcGRhdGUpO1xuICAgIH0sIGFzeW5jIGVycm9yID0+IHtcbiAgICAgIGxldCB3YXJuaW5nTWVzc2FnZVRvVXNlciA9IGBZb3UganVzdCBjb25uZWN0ZWQgdG8gYSByZW1vdGUgcHJvamVjdCBgICtcbiAgICAgICAgYFxcYCR7cm9vdERpcmVjdG90eVBhdGh9XFxgIGJ1dCB3ZSByZWNvbW1lbmQgeW91IHJlbW92ZSB0aGlzIGRpcmVjdG9yeSBub3cgYCArXG4gICAgICAgIGBiZWNhdXNlIGNydWNpYWwgZmVhdHVyZXMgbGlrZSBzeW5jZWQgcmVtb3RlIGZpbGUgZWRpdGluZywgZmlsZSBzZWFyY2gsIGAgK1xuICAgICAgICBgYW5kIE1lcmN1cmlhbC1yZWxhdGVkIHVwZGF0ZXMgd2lsbCBub3Qgd29yay48YnIvPmA7XG5cbiAgICAgIGNvbnN0IGxvZ2dlZEVycm9yTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3I7XG4gICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgIGBXYXRjaGVyIGZhaWxlZCB0byBzdGFydCAtIHdhdGNoZXIgZmVhdHVyZXMgZGlzYWJsZWQhIEVycm9yOiAke2xvZ2dlZEVycm9yTWVzc2FnZX1gXG4gICAgICApO1xuXG4gICAgICBjb25zdCBGaWxlU3lzdGVtU2VydmljZSA9IHRoaXMuZ2V0U2VydmljZShGSUxFX1NZU1RFTV9TRVJWSUNFKTtcbiAgICAgIGlmIChhd2FpdCBGaWxlU3lzdGVtU2VydmljZS5pc05mcyhyb290RGlyZWN0b3R5UGF0aCkpIHtcbiAgICAgICAgd2FybmluZ01lc3NhZ2VUb1VzZXIgKz1cbiAgICAgICAgICBgVGhpcyBwcm9qZWN0IGRpcmVjdG9yeTogXFxgJHtyb290RGlyZWN0b3R5UGF0aH1cXGAgaXMgb24gPGI+XFxgTkZTXFxgPC9iPiBmaWxlc3lzdGVtLiBgICtcbiAgICAgICAgICBgTnVjbGlkZSB3b3JrcyBiZXN0IHdpdGggbG9jYWwgKG5vbi1ORlMpIHJvb3QgZGlyZWN0b3J5LmAgK1xuICAgICAgICAgIGBlLmcuIFxcYC9kYXRhL3VzZXJzLyRVU0VSXFxgYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm5pbmdNZXNzYWdlVG9Vc2VyICs9XG4gICAgICAgICAgYDxiPjxhIGhyZWY9J2h0dHBzOi8vZmFjZWJvb2suZ2l0aHViLmlvL3dhdGNobWFuLyc+V2F0Y2htYW48L2E+IEVycm9yOjwvYj5gICtcbiAgICAgICAgICBsb2dnZWRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICAvLyBBZGQgYSBwZXJzaXN0ZW50IHdhcm5pbmcgbWVzc2FnZSB0byBtYWtlIHN1cmUgdGhlIHVzZXIgc2VlcyBpdCBiZWZvcmUgZGlzbWlzc2luZy5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHdhcm5pbmdNZXNzYWdlVG9Vc2VyLCB7ZGlzbWlzc2FibGU6IHRydWV9KTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBOb3RoaW5nIG5lZWRzIHRvIGJlIGRvbmUgaWYgdGhlIHJvb3QgZGlyZWN0b3J5IHdhdGNoIGhhcyBlbmRlZC5cbiAgICAgIGxvZ2dlci5pbmZvKGBXYXRjaGVyIEZlYXR1cmVzIEVuZGVkIGZvciBwcm9qZWN0OiAke3Jvb3REaXJlY3RvcnlVcml9YCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24ucmVtb3ZlQ29ubmVjdGlvbih0aGlzKTtcbiAgICBfZW1pdHRlci5lbWl0KCdkaWQtY2xvc2UnLCB0aGlzKTtcbiAgfVxuXG4gIGdldENvbm5lY3Rpb24oKTogU2VydmVyQ29ubmVjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb247XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdCgpO1xuICB9XG5cbiAgZ2V0UG9ydCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uLmdldFBvcnQoKTtcbiAgfVxuXG4gIGdldFJlbW90ZUhvc3RuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKTtcbiAgfVxuXG4gIGdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VXJpT2ZSZW1vdGVQYXRoKHRoaXMuZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCkpO1xuICB9XG5cbiAgZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N3ZDtcbiAgfVxuXG4gIGdldENvbmZpZygpOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiB7XG4gICAgcmV0dXJuIHsuLi50aGlzLl9jb25uZWN0aW9uLmdldENvbmZpZygpLCBjd2Q6IHRoaXMuX2N3ZH07XG4gIH1cblxuICBzdGF0aWMgb25EaWRBZGRSZW1vdGVDb25uZWN0aW9uKGhhbmRsZXI6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgX2VtaXR0ZXIub24oJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBvbkRpZENsb3NlUmVtb3RlQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1jbG9zZScsIGhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGdldEZvclVyaSh1cmk6IE51Y2xpZGVVcmkpOiA/UmVtb3RlQ29ubmVjdGlvbiB7XG4gICAgY29uc3Qge2hvc3RuYW1lLCBwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIGlmIChob3N0bmFtZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZUFuZFBhdGgoaG9zdG5hbWUsIHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjYWNoZWQgY29ubmVjdGlvbiBtYXRjaCB0aGUgaG9zdG5hbWUgYW5kIHRoZSBwYXRoIGhhcyB0aGUgcHJlZml4IG9mIGNvbm5lY3Rpb24uY3dkLlxuICAgKiBAcGFyYW0gaG9zdG5hbWUgVGhlIGNvbm5lY3RlZCBzZXJ2ZXIgaG9zdCBuYW1lLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgYWJzb2x1dGUgcGF0aCB0aGF0J3MgaGFzIHRoZSBwcmVmaXggb2YgY3dkIG9mIHRoZSBjb25uZWN0aW9uLlxuICAgKiAgIElmIHBhdGggaXMgbnVsbCwgZW1wdHkgb3IgdW5kZWZpbmVkLCB0aGVuIHJldHVybiB0aGUgY29ubmVjdGlvbiB3aGljaCBtYXRjaGVzXG4gICAqICAgdGhlIGhvc3RuYW1lIGFuZCBpZ25vcmUgdGhlIGluaXRpYWwgd29ya2luZyBkaXJlY3RvcnkuXG4gICAqL1xuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZUFuZFBhdGgoaG9zdG5hbWU6IHN0cmluZywgcGF0aDogc3RyaW5nKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoaG9zdG5hbWUpLmZpbHRlcihjb25uZWN0aW9uID0+IHtcbiAgICAgIHJldHVybiBwYXRoLnN0YXJ0c1dpdGgoY29ubmVjdGlvbi5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSk7XG4gICAgfSlbMF07XG4gIH1cblxuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZShob3N0bmFtZTogc3RyaW5nKTogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IHNlcnZlciA9IFNlcnZlckNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZShob3N0bmFtZSk7XG4gICAgcmV0dXJuIHNlcnZlciA9PSBudWxsID8gW10gOiBzZXJ2ZXIuZ2V0Q29ubmVjdGlvbnMoKTtcbiAgfVxuXG4gIGdldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uZ2V0U2VydmljZShzZXJ2aWNlTmFtZSk7XG4gIH1cbn1cbiJdfQ==