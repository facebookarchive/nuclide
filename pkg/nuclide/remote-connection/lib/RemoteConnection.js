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
      var connection = new RemoteConnection(serverConnection, config.cwd, config.displayTitle);
      return yield connection._initialize();
    })

    // Do NOT call this directly. Use findOrCreate instead.
  }]);

  function RemoteConnection(connection, cwd, displayTitle) {
    _classCallCheck(this, RemoteConnection);

    this._entries = {};
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

      var _remoteUri$parse = remoteUri.parse(uri);

      var path = _remoteUri$parse.path;

      path = require('path').normalize(path);

      var entry = this._entries[path];
      if (!entry || entry.getLocalPath() !== path || entry.isSymbolicLink() !== symlink) {
        this._entries[path] = entry = new _RemoteDirectory.RemoteDirectory(this, this.getUriOfRemotePath(path), symlink, { hgRepositoryDescription: this._hgRepositoryDescription });
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
      var symlink = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var _remoteUri$parse2 = remoteUri.parse(uri);

      var path = _remoteUri$parse2.path;

      path = require('path').normalize(path);

      var entry = this._entries[path];
      if (!entry || entry.getLocalPath() !== path || entry.isSymbolicLink() !== symlink) {
        this._entries[path] = entry = new RemoteFile(this, this.getUriOfRemotePath(path), symlink);
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
// Name of the saved connection profile.
// certificate of certificate authority.
// client certificate for https connection.
// Path to remote directory user should start in upon connection.
//# sourceMappingURL=data:application/json;base64,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QWdCLEVBQUUsSUFBWSxFQUFxQjtBQUM3RSxhQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDbkUsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLENBQUM7T0FDeEUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ1A7OztXQUVtQix1QkFBQyxRQUFnQixFQUEyQjtBQUM5RCxVQUFNLE1BQU0sR0FBRyxtQ0FBaUIsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hELGFBQU8sTUFBTSxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3REOzs7U0F6VFUsZ0JBQWdCIiwiZmlsZSI6IlJlbW90ZUNvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5RGVzY3JpcHRpb259IGZyb20gJy4uLy4uL3NvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuXG5pbXBvcnQgdHlwZW9mICogYXMgRmlsZVdhdGNoZXJTZXJ2aWNlVHlwZSBmcm9tICcuLi8uLi9maWxld2F0Y2hlci1iYXNlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBTb3VyY2VDb250cm9sU2VydmljZSBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VzL1NvdXJjZUNvbnRyb2xTZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4vUmVtb3RlRGlyZWN0b3J5JztcbmltcG9ydCB7U2VydmVyQ29ubmVjdGlvbn0gZnJvbSAnLi9TZXJ2ZXJDb25uZWN0aW9uJztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3Qge0V2ZW50RW1pdHRlcn0gPSByZXF1aXJlKCdldmVudHMnKTtcblxuY29uc3Qge1JlbW90ZUZpbGV9ID0gcmVxdWlyZSgnLi9SZW1vdGVGaWxlJyk7XG5jb25zdCB7Z2V0Q29ubmVjdGlvbkNvbmZpZ30gPVxuICByZXF1aXJlKCcuL1JlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uTWFuYWdlcicpO1xuXG5jb25zdCBGSUxFX1dBVENIRVJfU0VSVklDRSA9ICdGaWxlV2F0Y2hlclNlcnZpY2UnO1xuY29uc3QgRklMRV9TWVNURU1fU0VSVklDRSA9ICdGaWxlU3lzdGVtU2VydmljZSc7XG5cbmV4cG9ydCB0eXBlIFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uID0ge1xuICBob3N0OiBzdHJpbmc7IC8vIGhvc3QgbnVjbGlkZSBzZXJ2ZXIgaXMgcnVubmluZyBvbi5cbiAgcG9ydDogbnVtYmVyOyAvLyBwb3J0IHRvIGNvbm5lY3QgdG8uXG4gIGN3ZDogc3RyaW5nOyAvLyBQYXRoIHRvIHJlbW90ZSBkaXJlY3RvcnkgdXNlciBzaG91bGQgc3RhcnQgaW4gdXBvbiBjb25uZWN0aW9uLlxuICBkaXNwbGF5VGl0bGU6IHN0cmluZzsgLy8gTmFtZSBvZiB0aGUgc2F2ZWQgY29ubmVjdGlvbiBwcm9maWxlLlxuICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlPzogQnVmZmVyOyAvLyBjZXJ0aWZpY2F0ZSBvZiBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXG4gIGNsaWVudENlcnRpZmljYXRlPzogQnVmZmVyOyAvLyBjbGllbnQgY2VydGlmaWNhdGUgZm9yIGh0dHBzIGNvbm5lY3Rpb24uXG4gIGNsaWVudEtleT86IEJ1ZmZlcjsgLy8ga2V5IGZvciBodHRwcyBjb25uZWN0aW9uLlxufVxuXG5jb25zdCBfZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4vLyBBIFJlbW90ZUNvbm5lY3Rpb24gcmVwcmVzZW50cyBhIGRpcmVjdG9yeSB3aGljaCBoYXMgYmVlbiBvcGVuZWQgaW4gTnVjbGlkZSBvbiBhIHJlbW90ZSBtYWNoaW5lLlxuLy8gVGhpcyBjb3JyZXNwb25kcyB0byB3aGF0IGF0b20gY2FsbHMgYSAncm9vdCBwYXRoJyBpbiBhIHByb2plY3QuXG4vL1xuLy8gVE9ETzogVGhlIF9lbnRyaWVzIGFuZCBfaGdSZXBvc2l0b3J5RGVzY3JpcHRpb24gc2hvdWxkIG5vdCBiZSBoZXJlLlxuLy8gTnVjbGlkZSBiZWhhdmVzIGJhZGx5IHdoZW4gcmVtb3RlIGRpcmVjdG9yaWVzIGFyZSBvcGVuZWQgd2hpY2ggYXJlIHBhcmVudC9jaGlsZCBvZiBlYWNoIG90aGVyLlxuLy8gQW5kIHRoZXJlIG5lZWRuJ3QgYmUgYSAxOjEgcmVsYXRpb25zaGlwIGJldHdlZW4gUmVtb3RlQ29ubmVjdGlvbnMgYW5kIGhnIHJlcG9zLlxuZXhwb3J0IGNsYXNzIFJlbW90ZUNvbm5lY3Rpb24ge1xuICBfZW50cmllczoge1twYXRoOiBzdHJpbmddOiBSZW1vdGVGaWxlIHwgUmVtb3RlRGlyZWN0b3J5fTtcbiAgX2N3ZDogc3RyaW5nOyAvLyBQYXRoIHRvIHJlbW90ZSBkaXJlY3RvcnkgdXNlciBzaG91bGQgc3RhcnQgaW4gdXBvbiBjb25uZWN0aW9uLlxuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIF9jb25uZWN0aW9uOiBTZXJ2ZXJDb25uZWN0aW9uO1xuICBfZGlzcGxheVRpdGxlOiBzdHJpbmc7XG5cbiAgc3RhdGljIGFzeW5jIGZpbmRPckNyZWF0ZShjb25maWc6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uKTpcbiAgICAgIFByb21pc2U8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IHNlcnZlckNvbm5lY3Rpb24gPSBhd2FpdCBTZXJ2ZXJDb25uZWN0aW9uLmdldE9yQ3JlYXRlKGNvbmZpZyk7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IG5ldyBSZW1vdGVDb25uZWN0aW9uKHNlcnZlckNvbm5lY3Rpb24sIGNvbmZpZy5jd2QsIGNvbmZpZy5kaXNwbGF5VGl0bGUpO1xuICAgIHJldHVybiBhd2FpdCBjb25uZWN0aW9uLl9pbml0aWFsaXplKCk7XG4gIH1cblxuICAvLyBEbyBOT1QgY2FsbCB0aGlzIGRpcmVjdGx5LiBVc2UgZmluZE9yQ3JlYXRlIGluc3RlYWQuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IFNlcnZlckNvbm5lY3Rpb24sIGN3ZDogc3RyaW5nLCBkaXNwbGF5VGl0bGU6IHN0cmluZykge1xuICAgIHRoaXMuX2VudHJpZXMgPSB7fTtcbiAgICB0aGlzLl9jd2QgPSBjd2Q7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICAgIHRoaXMuX2Rpc3BsYXlUaXRsZSA9IGRpc3BsYXlUaXRsZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBzdGF0aWMgX2NyZWF0ZUluc2VjdXJlQ29ubmVjdGlvbkZvclRlc3RpbmcoXG4gICAgY3dkOiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICApOiBQcm9taXNlPFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgIHBvcnQsXG4gICAgICBjd2QsXG4gICAgICBkaXNwbGF5VGl0bGU6ICcnLFxuICAgIH07XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uZmluZE9yQ3JlYXRlKGNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgY29ubmVjdGlvbiBieSByZXVzaW5nIHRoZSBjb25maWd1cmF0aW9uIG9mIGxhc3Qgc3VjY2Vzc2Z1bCBjb25uZWN0aW9uIGFzc29jaWF0ZWQgd2l0aFxuICAgKiBnaXZlbiBob3N0LiBJZiB0aGUgc2VydmVyJ3MgY2VydHMgaGFzIGJlZW4gdXBkYXRlZCBvciB0aGVyZSBpcyBubyBwcmV2aW91cyBzdWNjZXNzZnVsXG4gICAqIGNvbm5lY3Rpb24sIG51bGwgKHJlc29sdmVkIGJ5IHByb21pc2UpIGlzIHJldHVybmVkLlxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGNyZWF0ZUNvbm5lY3Rpb25CeVNhdmVkQ29uZmlnKFxuICAgIGhvc3Q6IHN0cmluZyxcbiAgICBjd2Q6IHN0cmluZyxcbiAgICBkaXNwbGF5VGl0bGU6IHN0cmluZ1xuICApOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29ubmVjdGlvbkNvbmZpZyA9IGdldENvbm5lY3Rpb25Db25maWcoaG9zdCk7XG4gICAgaWYgKCFjb25uZWN0aW9uQ29uZmlnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHsuLi5jb25uZWN0aW9uQ29uZmlnLCBjd2QsIGRpc3BsYXlUaXRsZX07XG4gICAgICByZXR1cm4gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5maW5kT3JDcmVhdGUoY29uZmlnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHJldXNlIGNvbm5lY3Rpb25Db25maWd1cmF0aW9uIGZvciAke2hvc3R9YCwgZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBBdG9tJ3MgUHJvamVjdDo6c2V0UGF0aHMgY3VycmVudGx5IHVzZXNcbiAgLy8gOjpyZXBvc2l0b3J5Rm9yRGlyZWN0b3J5U3luYywgc28gd2UgbmVlZCB0aGUgcmVwbyBpbmZvcm1hdGlvbiB0byBhbHJlYWR5IGJlXG4gIC8vIGF2YWlsYWJsZSB3aGVuIHRoZSBuZXcgcGF0aCBpcyBhZGRlZC4gdDY5MTM2MjQgdHJhY2tzIGNsZWFudXAgb2YgdGhpcy5cbiAgYXN5bmMgX3NldEhnUmVwb0luZm8oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVtb3RlUGF0aCA9IHRoaXMuZ2V0UGF0aEZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qge2dldEhnUmVwb3NpdG9yeX0gPSAodGhpcy5nZXRTZXJ2aWNlKCdTb3VyY2VDb250cm9sU2VydmljZScpOiBTb3VyY2VDb250cm9sU2VydmljZSk7XG4gICAgdGhpcy5fc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oYXdhaXQgZ2V0SGdSZXBvc2l0b3J5KHJlbW90ZVBhdGgpKTtcbiAgfVxuXG4gIGdldFVyaU9mUmVtb3RlUGF0aChyZW1vdGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbnVjbGlkZTovLyR7dGhpcy5nZXRSZW1vdGVIb3N0KCl9JHtyZW1vdGVQYXRofWA7XG4gIH1cblxuICBnZXRQYXRoT2ZVcmkodXJpOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiByZW1vdGVVcmkucGFyc2UodXJpKS5wYXRoO1xuICB9XG5cbiAgY3JlYXRlRGlyZWN0b3J5KHVyaTogc3RyaW5nLCBzeW1saW5rOiBib29sZWFuID0gZmFsc2UpOiBSZW1vdGVEaXJlY3Rvcnkge1xuICAgIGxldCB7cGF0aH0gPSByZW1vdGVVcmkucGFyc2UodXJpKTtcbiAgICBwYXRoID0gcmVxdWlyZSgncGF0aCcpLm5vcm1hbGl6ZShwYXRoKTtcblxuICAgIGxldCBlbnRyeSA9IHRoaXMuX2VudHJpZXNbcGF0aF07XG4gICAgaWYgKFxuICAgICAgIWVudHJ5IHx8XG4gICAgICBlbnRyeS5nZXRMb2NhbFBhdGgoKSAhPT0gcGF0aCB8fFxuICAgICAgZW50cnkuaXNTeW1ib2xpY0xpbmsoKSAhPT0gc3ltbGlua1xuICAgICkge1xuICAgICAgdGhpcy5fZW50cmllc1twYXRoXSA9IGVudHJ5ID0gbmV3IFJlbW90ZURpcmVjdG9yeShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgocGF0aCksXG4gICAgICAgIHN5bWxpbmssXG4gICAgICAgIHtoZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogdGhpcy5faGdSZXBvc2l0b3J5RGVzY3JpcHRpb259XG4gICAgICApO1xuICAgICAgLy8gVE9ETzogV2Ugc2hvdWxkIGFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8ga2VlcCB0aGUgY2FjaGUgdXAtdG8tZGF0ZS5cbiAgICAgIC8vIFdlIG5lZWQgdG8gaW1wbGVtZW50IG9uRGlkUmVuYW1lIGFuZCBvbkRpZERlbGV0ZSBpbiBSZW1vdGVEaXJlY3RvcnlcbiAgICAgIC8vIGZpcnN0LiBJdCdzIG9rIHRoYXQgd2UgZG9uJ3QgYWRkIHRoZSBoYW5kbGVycyBmb3Igbm93IHNpbmNlIHdlIGhhdmVcbiAgICAgIC8vIHRoZSBjaGVjayBgZW50cnkuZ2V0TG9jYWxQYXRoKCkgIT09IHBhdGhgIGFib3ZlLlxuICAgICAgLy9cbiAgICAgIC8vIHRoaXMuX2FkZEhhbmRsZXJzRm9yRW50cnkoZW50cnkpO1xuICAgIH1cblxuICAgIGludmFyaWFudChlbnRyeSBpbnN0YW5jZW9mIFJlbW90ZURpcmVjdG9yeSk7XG4gICAgaWYgKCFlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggaXMgbm90IGEgZGlyZWN0b3J5OicgKyB1cmkpO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIC8vIEEgd29ya2Fyb3VuZCBiZWZvcmUgQXRvbSAyLjA6IHNlZSA6OmdldEhnUmVwb0luZm8gb2YgbWFpbi5qcy5cbiAgX3NldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKGhnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiA/SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbiA9IGhnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICB9XG5cbiAgY3JlYXRlRmlsZSh1cmk6IHN0cmluZywgc3ltbGluazogYm9vbGVhbiA9IGZhbHNlKTogUmVtb3RlRmlsZSB7XG4gICAgbGV0IHtwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJykubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoXG4gICAgICAhZW50cnkgfHxcbiAgICAgIGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoIHx8XG4gICAgICBlbnRyeS5pc1N5bWJvbGljTGluaygpICE9PSBzeW1saW5rXG4gICAgKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRmlsZShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgocGF0aCksXG4gICAgICAgIHN5bWxpbmssXG4gICAgICApO1xuICAgICAgdGhpcy5fYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeSk7XG4gICAgfVxuXG4gICAgaW52YXJpYW50KGVudHJ5IGluc3RhbmNlb2YgUmVtb3RlRmlsZSk7XG4gICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGF0aCBpcyBub3QgYSBmaWxlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgX2FkZEhhbmRsZXJzRm9yRW50cnkoZW50cnk6IFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3RvcnkpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRQYXRoID0gZW50cnkuZ2V0TG9jYWxQYXRoKCk7XG4gICAgLyogJEZsb3dGaXhNZSAqL1xuICAgIGNvbnN0IHJlbmFtZVN1YnNjcmlwdGlvbiA9IGVudHJ5Lm9uRGlkUmVuYW1lKCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9lbnRyaWVzW29sZFBhdGhdO1xuICAgICAgdGhpcy5fZW50cmllc1tlbnRyeS5nZXRMb2NhbFBhdGgoKV0gPSBlbnRyeTtcbiAgICB9KTtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgY29uc3QgZGVsZXRlU3Vic2NyaXB0aW9uID0gZW50cnkub25EaWREZWxldGUoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2VudHJpZXNbZW50cnkuZ2V0TG9jYWxQYXRoKCldO1xuICAgICAgcmVuYW1lU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGRlbGV0ZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfaW5pdGlhbGl6ZSgpOiBQcm9taXNlPFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICAvLyBNdXN0IGFkZCBmaXJzdCB0byBwcmV2ZW50IHRoZSBTZXJ2ZXJDb25uZWN0aW9uIGZyb20gZ29pbmcgYXdheVxuICAgIC8vIGluIGEgcG9zc2libGUgcmFjZS5cbiAgICB0aGlzLl9jb25uZWN0aW9uLmFkZENvbm5lY3Rpb24odGhpcyk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IEZpbGVTeXN0ZW1TZXJ2aWNlID0gdGhpcy5nZXRTZXJ2aWNlKEZJTEVfU1lTVEVNX1NFUlZJQ0UpO1xuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gYXdhaXQgRmlsZVN5c3RlbVNlcnZpY2UucmVzb2x2ZVJlYWxQYXRoKHRoaXMuX2N3ZCk7XG5cbiAgICAgIC8vIE5vdyB0aGF0IHdlIGtub3cgdGhlIHJlYWwgcGF0aCwgaXQncyBwb3NzaWJsZSB0aGlzIGNvbGxpZGVzIHdpdGggYW4gZXhpc3RpbmcgY29ubmVjdGlvbi5cbiAgICAgIC8vIElmIHNvLCB3ZSBzaG91bGQganVzdCBzdG9wIGltbWVkaWF0ZWx5LlxuICAgICAgaWYgKHJlc29sdmVkUGF0aCAhPT0gdGhpcy5fY3dkKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nQ29ubmVjdGlvbiA9XG4gICAgICAgICAgICBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKHRoaXMuZ2V0UmVtb3RlSG9zdG5hbWUoKSwgcmVzb2x2ZWRQYXRoKTtcbiAgICAgICAgaW52YXJpYW50KHRoaXMgIT09IGV4aXN0aW5nQ29ubmVjdGlvbik7XG4gICAgICAgIGlmIChleGlzdGluZ0Nvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICByZXR1cm4gZXhpc3RpbmdDb25uZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3dkID0gcmVzb2x2ZWRQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBzZWUgOjpnZXRIZ1JlcG9JbmZvLlxuICAgICAgYXdhaXQgdGhpcy5fc2V0SGdSZXBvSW5mbygpO1xuXG4gICAgICBfZW1pdHRlci5lbWl0KCdkaWQtYWRkJywgdGhpcyk7XG4gICAgICB0aGlzLl93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfd2F0Y2hSb290UHJvamVjdERpcmVjdG9yeSgpOiB2b2lkIHtcbiAgICBjb25zdCByb290RGlyZWN0b3J5VXJpID0gdGhpcy5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IHJvb3REaXJlY3RvdHlQYXRoID0gdGhpcy5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgICBjb25zdCBGaWxlV2F0Y2hlclNlcnZpY2U6IEZpbGVXYXRjaGVyU2VydmljZVR5cGUgPSB0aGlzLmdldFNlcnZpY2UoRklMRV9XQVRDSEVSX1NFUlZJQ0UpO1xuICAgIGludmFyaWFudChGaWxlV2F0Y2hlclNlcnZpY2UpO1xuICAgIGNvbnN0IHt3YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZX0gPSBGaWxlV2F0Y2hlclNlcnZpY2U7XG4gICAgLy8gU3RhcnQgd2F0Y2hpbmcgdGhlIHByb2plY3QgZm9yIGNoYW5nZXMgYW5kIGluaXRpYWxpemUgdGhlIHJvb3Qgd2F0Y2hlclxuICAgIC8vIGZvciBuZXh0IGNhbGxzIHRvIGB3YXRjaEZpbGVgIGFuZCBgd2F0Y2hEaXJlY3RvcnlgLlxuICAgIGNvbnN0IHdhdGNoU3RyZWFtID0gd2F0Y2hEaXJlY3RvcnlSZWN1cnNpdmUocm9vdERpcmVjdG9yeVVyaSk7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gd2F0Y2hTdHJlYW0uc3Vic2NyaWJlKHdhdGNoVXBkYXRlID0+IHtcbiAgICAgIC8vIE5vdGhpbmcgbmVlZHMgdG8gYmUgZG9uZSBpZiB0aGUgcm9vdCBkaXJlY3Rvcnkgd2FzIHdhdGNoZWQgY29ycmVjdGx5LlxuICAgICAgLy8gTGV0J3MganVzdCBjb25zb2xlIGxvZyBpdCBhbnl3YXkuXG4gICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hlciBGZWF0dXJlcyBJbml0aWFsaXplZCBmb3IgcHJvamVjdDogJHtyb290RGlyZWN0b3J5VXJpfWAsIHdhdGNoVXBkYXRlKTtcbiAgICB9LCBhc3luYyBlcnJvciA9PiB7XG4gICAgICBsZXQgd2FybmluZ01lc3NhZ2VUb1VzZXIgPSBgWW91IGp1c3QgY29ubmVjdGVkIHRvIGEgcmVtb3RlIHByb2plY3QgYCArXG4gICAgICAgIGBcXGAke3Jvb3REaXJlY3RvdHlQYXRofVxcYCBidXQgd2UgcmVjb21tZW5kIHlvdSByZW1vdmUgdGhpcyBkaXJlY3Rvcnkgbm93IGAgK1xuICAgICAgICBgYmVjYXVzZSBjcnVjaWFsIGZlYXR1cmVzIGxpa2Ugc3luY2VkIHJlbW90ZSBmaWxlIGVkaXRpbmcsIGZpbGUgc2VhcmNoLCBgICtcbiAgICAgICAgYGFuZCBNZXJjdXJpYWwtcmVsYXRlZCB1cGRhdGVzIHdpbGwgbm90IHdvcmsuPGJyLz5gO1xuXG4gICAgICBjb25zdCBsb2dnZWRFcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlIHx8IGVycm9yO1xuICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICBgV2F0Y2hlciBmYWlsZWQgdG8gc3RhcnQgLSB3YXRjaGVyIGZlYXR1cmVzIGRpc2FibGVkISBFcnJvcjogJHtsb2dnZWRFcnJvck1lc3NhZ2V9YFxuICAgICAgKTtcblxuICAgICAgY29uc3QgRmlsZVN5c3RlbVNlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoRklMRV9TWVNURU1fU0VSVklDRSk7XG4gICAgICBpZiAoYXdhaXQgRmlsZVN5c3RlbVNlcnZpY2UuaXNOZnMocm9vdERpcmVjdG90eVBhdGgpKSB7XG4gICAgICAgIHdhcm5pbmdNZXNzYWdlVG9Vc2VyICs9XG4gICAgICAgICAgYFRoaXMgcHJvamVjdCBkaXJlY3Rvcnk6IFxcYCR7cm9vdERpcmVjdG90eVBhdGh9XFxgIGlzIG9uIDxiPlxcYE5GU1xcYDwvYj4gZmlsZXN5c3RlbS4gYCArXG4gICAgICAgICAgYE51Y2xpZGUgd29ya3MgYmVzdCB3aXRoIGxvY2FsIChub24tTkZTKSByb290IGRpcmVjdG9yeS5gICtcbiAgICAgICAgICBgZS5nLiBcXGAvZGF0YS91c2Vycy8kVVNFUlxcYGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuaW5nTWVzc2FnZVRvVXNlciArPVxuICAgICAgICAgIGA8Yj48YSBocmVmPSdodHRwczovL2ZhY2Vib29rLmdpdGh1Yi5pby93YXRjaG1hbi8nPldhdGNobWFuPC9hPiBFcnJvcjo8L2I+YCArXG4gICAgICAgICAgbG9nZ2VkRXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGEgcGVyc2lzdGVudCB3YXJuaW5nIG1lc3NhZ2UgdG8gbWFrZSBzdXJlIHRoZSB1c2VyIHNlZXMgaXQgYmVmb3JlIGRpc21pc3NpbmcuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyh3YXJuaW5nTWVzc2FnZVRvVXNlciwge2Rpc21pc3NhYmxlOiB0cnVlfSk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXRjaCBoYXMgZW5kZWQuXG4gICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hlciBGZWF0dXJlcyBFbmRlZCBmb3IgcHJvamVjdDogJHtyb290RGlyZWN0b3J5VXJpfWApO1xuICAgIH0pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLnJlbW92ZUNvbm5lY3Rpb24odGhpcyk7XG4gICAgX2VtaXR0ZXIuZW1pdCgnZGlkLWNsb3NlJywgdGhpcyk7XG4gIH1cblxuICBnZXRDb25uZWN0aW9uKCk6IFNlcnZlckNvbm5lY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uO1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uLmdldFJlbW90ZUhvc3QoKTtcbiAgfVxuXG4gIGdldFBvcnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5nZXRQb3J0KCk7XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0bmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCk7XG4gIH1cblxuICBnZXREaXNwbGF5VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzcGxheVRpdGxlO1xuICB9XG5cbiAgZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgodGhpcy5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSk7XG4gIH1cblxuICBnZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY3dkO1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgICByZXR1cm4gey4uLnRoaXMuX2Nvbm5lY3Rpb24uZ2V0Q29uZmlnKCksIGN3ZDogdGhpcy5fY3dkLCBkaXNwbGF5VGl0bGU6IHRoaXMuX2Rpc3BsYXlUaXRsZX07XG4gIH1cblxuICBzdGF0aWMgb25EaWRBZGRSZW1vdGVDb25uZWN0aW9uKGhhbmRsZXI6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgX2VtaXR0ZXIub24oJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBvbkRpZENsb3NlUmVtb3RlQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1jbG9zZScsIGhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGdldEZvclVyaSh1cmk6IE51Y2xpZGVVcmkpOiA/UmVtb3RlQ29ubmVjdGlvbiB7XG4gICAgY29uc3Qge2hvc3RuYW1lLCBwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIGlmIChob3N0bmFtZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZUFuZFBhdGgoaG9zdG5hbWUsIHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjYWNoZWQgY29ubmVjdGlvbiBtYXRjaCB0aGUgaG9zdG5hbWUgYW5kIHRoZSBwYXRoIGhhcyB0aGUgcHJlZml4IG9mIGNvbm5lY3Rpb24uY3dkLlxuICAgKiBAcGFyYW0gaG9zdG5hbWUgVGhlIGNvbm5lY3RlZCBzZXJ2ZXIgaG9zdCBuYW1lLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgYWJzb2x1dGUgcGF0aCB0aGF0J3MgaGFzIHRoZSBwcmVmaXggb2YgY3dkIG9mIHRoZSBjb25uZWN0aW9uLlxuICAgKiAgIElmIHBhdGggaXMgbnVsbCwgZW1wdHkgb3IgdW5kZWZpbmVkLCB0aGVuIHJldHVybiB0aGUgY29ubmVjdGlvbiB3aGljaCBtYXRjaGVzXG4gICAqICAgdGhlIGhvc3RuYW1lIGFuZCBpZ25vcmUgdGhlIGluaXRpYWwgd29ya2luZyBkaXJlY3RvcnkuXG4gICAqL1xuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZUFuZFBhdGgoaG9zdG5hbWU6IHN0cmluZywgcGF0aDogc3RyaW5nKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoaG9zdG5hbWUpLmZpbHRlcihjb25uZWN0aW9uID0+IHtcbiAgICAgIHJldHVybiBwYXRoLnN0YXJ0c1dpdGgoY29ubmVjdGlvbi5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSk7XG4gICAgfSlbMF07XG4gIH1cblxuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZShob3N0bmFtZTogc3RyaW5nKTogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IHNlcnZlciA9IFNlcnZlckNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZShob3N0bmFtZSk7XG4gICAgcmV0dXJuIHNlcnZlciA9PSBudWxsID8gW10gOiBzZXJ2ZXIuZ2V0Q29ubmVjdGlvbnMoKTtcbiAgfVxuXG4gIGdldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uZ2V0U2VydmljZShzZXJ2aWNlTmFtZSk7XG4gIH1cbn1cbiJdfQ==