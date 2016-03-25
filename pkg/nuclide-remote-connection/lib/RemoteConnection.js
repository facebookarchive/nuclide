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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _RemoteDirectory = require('./RemoteDirectory');

var _ServerConnection = require('./ServerConnection');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var remoteUri = require('../../nuclide-remote-uri');
var logger = require('../../nuclide-logging').getLogger();

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

      path = _path2['default'].normalize(path);

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

      path = _path2['default'].normalize(path);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZUNvbm5lY3Rpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFpQnNCLFFBQVE7Ozs7b0JBQ1AsTUFBTTs7OzsrQkFDQyxtQkFBbUI7O2dDQUNsQixvQkFBb0I7O2VBRVQsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBbEQsbUJBQW1CLFlBQW5CLG1CQUFtQjtJQUFFLFVBQVUsWUFBVixVQUFVOztBQUN0QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUN0RCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7Z0JBQ3JDLE9BQU8sQ0FBQyxRQUFRLENBQUM7O0lBQWpDLFlBQVksYUFBWixZQUFZOztnQkFFRSxPQUFPLENBQUMsY0FBYyxDQUFDOztJQUFyQyxVQUFVLGFBQVYsVUFBVTs7Z0JBRWYsT0FBTyxDQUFDLHdDQUF3QyxDQUFDOztJQUQ1QyxtQkFBbUIsYUFBbkIsbUJBQW1COztBQUcxQixJQUFNLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO0FBQ2xELElBQU0sbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7Ozs7QUFZaEQsSUFBTSxRQUFzQixHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7Ozs7Ozs7OztJQVFyQyxnQkFBZ0I7ZUFBaEIsZ0JBQWdCOzs2QkFRRixXQUFDLE1BQXFDLEVBQ2pDO0FBQzVCLFVBQU0sZ0JBQWdCLEdBQUcsTUFBTSxtQ0FBaUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BFLFVBQU0sVUFBVSxHQUFHLElBQUksZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0YsYUFBTyxNQUFNLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUN2Qzs7Ozs7QUFHVSxXQWhCQSxnQkFBZ0IsQ0FnQmYsVUFBNEIsRUFBRSxHQUFXLEVBQUUsWUFBb0IsRUFBRTswQkFoQmxFLGdCQUFnQjs7QUFpQnpCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBQ2hELFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7QUFDckMsUUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFDOUIsUUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7R0FDbkM7O2VBdkJVLGdCQUFnQjs7V0F5QnBCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7Ozs7Ozs2QkF5Q21CLGFBQWtCO0FBQ3BDLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDOztpQkFDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQzs7VUFBM0QsZUFBZSxRQUFmLGVBQWU7O0FBQ3RCLFVBQUksQ0FBQywyQkFBMkIsRUFBQyxNQUFNLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFDLENBQUM7S0FDckU7OztXQUVpQiw0QkFBQyxVQUFrQixFQUFVO0FBQzdDLDRCQUFvQixJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsVUFBVSxDQUFHO0tBQ3pEOzs7V0FFVyxzQkFBQyxHQUFXLEVBQVU7QUFDaEMsYUFBTyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztLQUNsQzs7O1dBRWMseUJBQUMsR0FBVyxFQUE2QztVQUEzQyxPQUFnQix5REFBRyxLQUFLOzs2QkFDdEMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7O1VBQTVCLElBQUksb0JBQUosSUFBSTs7QUFDVCxVQUFJLEdBQUcsa0JBQVcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVsQyxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQ0UsQ0FBQyxLQUFLLElBQ04sS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLElBQUksSUFDN0IsS0FBSyxDQUFDLGNBQWMsRUFBRSxLQUFLLE9BQU8sRUFDbEM7QUFDQSxZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxxQ0FDNUIsSUFBSSxFQUNKLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFDN0IsT0FBTyxFQUNQLEVBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixFQUFDLENBQ3pELENBQUM7Ozs7Ozs7T0FPSDs7QUFFRCwrQkFBVSxLQUFLLDRDQUEyQixDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN4QixjQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixHQUFHLEdBQUcsQ0FBQyxDQUFDO09BQ25EOztBQUVELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7Ozs7O1dBRzBCLHFDQUFDLHVCQUFpRCxFQUFRO0FBQ25GLFVBQUksQ0FBQyx3QkFBd0IsR0FBRyx1QkFBdUIsQ0FBQztLQUN6RDs7O1dBRVMsb0JBQUMsR0FBVyxFQUF3QztVQUF0QyxPQUFnQix5REFBRyxLQUFLOzs4QkFDakMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7O1VBQTVCLElBQUkscUJBQUosSUFBSTs7QUFDVCxVQUFJLEdBQUcsa0JBQVcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVsQyxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQ0UsQ0FBQyxLQUFLLElBQ04sS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLElBQUksSUFDN0IsS0FBSyxDQUFDLGNBQWMsRUFBRSxLQUFLLE9BQU8sRUFDbEM7QUFDQSxZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FDMUMsSUFBSSxFQUNKLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFDN0IsT0FBTyxDQUNSLENBQUM7QUFDRixZQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDbEM7O0FBRUQsK0JBQVUsS0FBSyxZQUFZLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZDLFVBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFO0FBQ3ZCLGNBQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztPQUN2Qzs7QUFFRCxhQUFPLEtBQUssQ0FBQztLQUNkOzs7V0FFbUIsOEJBQUMsS0FBbUMsRUFBUTs7O0FBQzlELFVBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFckMsVUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLFlBQU07QUFDakQsZUFBTyxNQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixjQUFLLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7T0FDN0MsQ0FBQyxDQUFDOztBQUVILFVBQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxZQUFNO0FBQ2pELGVBQU8sTUFBSyxRQUFRLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDM0MsMEJBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsMEJBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDOUIsQ0FBQyxDQUFDO0tBQ0o7Ozs2QkFFZ0IsYUFBOEI7OztBQUc3QyxVQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQyxVQUFJO0FBQ0YsWUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDL0QsWUFBTSxZQUFZLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7O0FBSXhFLFlBQUksWUFBWSxLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDOUIsY0FBTSxrQkFBa0IsR0FDcEIsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDbEYsbUNBQVUsSUFBSSxLQUFLLGtCQUFrQixDQUFDLENBQUM7QUFDdkMsY0FBSSxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7QUFDOUIsZ0JBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNiLG1CQUFPLGtCQUFrQixDQUFDO1dBQzNCOztBQUVELGNBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO1NBQzFCOzs7QUFHRCxjQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFNUIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9CLFlBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO09BQ25DLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixZQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDYixjQUFNLENBQUMsQ0FBQztPQUNUO0FBQ0QsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRXlCLHNDQUFTOzs7QUFDakMsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQztBQUNqRSxVQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDO0FBQ25FLFVBQU0sa0JBQTBDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3pGLCtCQUFVLGtCQUFrQixDQUFDLENBQUM7VUFDdkIsdUJBQXVCLEdBQUksa0JBQWtCLENBQTdDLHVCQUF1Qjs7OztBQUc5QixVQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzlELFVBQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBQSxXQUFXLEVBQUk7OztBQUd4RCxjQUFNLENBQUMsSUFBSSxnREFBOEMsZ0JBQWdCLEVBQUksV0FBVyxDQUFDLENBQUM7T0FDM0Ysb0JBQUUsV0FBTSxLQUFLLEVBQUk7QUFDaEIsWUFBSSxvQkFBb0IsR0FBRyxtREFDcEIsaUJBQWlCLHVEQUFvRCw0RUFDRCxzREFDdEIsQ0FBQzs7QUFFdEQsWUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQztBQUNsRCxjQUFNLENBQUMsS0FBSyxrRUFDcUQsa0JBQWtCLENBQ2xGLENBQUM7O0FBRUYsWUFBTSxpQkFBaUIsR0FBRyxPQUFLLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQy9ELFlBQUksTUFBTSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRTtBQUNwRCw4QkFBb0IsSUFDbEIsOEJBQTZCLGlCQUFpQixrR0FDVyw2QkFDN0IsQ0FBQztTQUNoQyxNQUFNO0FBQ0wsOEJBQW9CLElBQ2xCLGdGQUNBLGtCQUFrQixDQUFDO1NBQ3RCOztBQUVELFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7T0FDMUUsR0FBRSxZQUFNOztBQUVQLGNBQU0sQ0FBQyxJQUFJLDBDQUF3QyxnQkFBZ0IsQ0FBRyxDQUFDO09BQ3hFLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3ZDOzs7V0FFSSxpQkFBUztBQUNaLFVBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsY0FBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDbEM7OztXQUVZLHlCQUFxQjtBQUNoQyxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7S0FDekI7OztXQUVZLHlCQUFXO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN6Qzs7O1dBRU0sbUJBQVc7QUFDaEIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25DOzs7V0FFZ0IsNkJBQVc7QUFDMUIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUM7S0FDN0M7OztXQUVjLDJCQUFXO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUMzQjs7O1dBRStCLDRDQUFXO0FBQ3pDLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLENBQUM7S0FDMUU7OztXQUVnQyw2Q0FBVztBQUMxQyxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbEI7OztXQUVRLHFCQUFrQztBQUN6QywwQkFBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxJQUFFO0tBQzVGOzs7V0EwQ1Msb0JBQUMsV0FBbUIsRUFBTztBQUNuQyxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2pEOzs7V0FoU3lDLDZDQUN4QyxHQUFXLEVBQ1gsSUFBWSxFQUNlO0FBQzNCLFVBQU0sTUFBTSxHQUFHO0FBQ2IsWUFBSSxFQUFFLFdBQVc7QUFDakIsWUFBSSxFQUFKLElBQUk7QUFDSixXQUFHLEVBQUgsR0FBRztBQUNILG9CQUFZLEVBQUUsRUFBRTtPQUNqQixDQUFDO0FBQ0YsYUFBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDOUM7Ozs7Ozs7Ozs2QkFPeUMsV0FDeEMsSUFBWSxFQUNaLEdBQVcsRUFDWCxZQUFvQixFQUNRO0FBQzVCLFVBQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsVUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQ3JCLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxVQUFJO0FBQ0YsWUFBTSxNQUFNLGdCQUFPLGdCQUFnQixJQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUUsWUFBWSxFQUFaLFlBQVksR0FBQyxDQUFDO0FBQ3hELGVBQU8sTUFBTSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDcEQsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGNBQU0sQ0FBQyxJQUFJLGtEQUFnRCxJQUFJLEVBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEUsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7V0FvTjhCLGtDQUFDLE9BQStDLEVBQWM7QUFDM0YsY0FBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEMsYUFBTyxJQUFJLFVBQVUsQ0FBQyxZQUFNO0FBQzFCLGdCQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUM3QyxDQUFDLENBQUM7S0FDSjs7O1dBRWdDLG9DQUFDLE9BQStDLEVBQWM7QUFDN0YsY0FBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbEMsYUFBTyxJQUFJLFVBQVUsQ0FBQyxZQUFNO0FBQzFCLGdCQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUMvQyxDQUFDLENBQUM7S0FDSjs7O1dBRWUsbUJBQUMsR0FBZSxFQUFxQjs4QkFDMUIsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7O1VBQXRDLFFBQVEscUJBQVIsUUFBUTtVQUFFLElBQUkscUJBQUosSUFBSTs7QUFDckIsVUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxhQUFPLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM5RDs7Ozs7Ozs7Ozs7V0FTMEIsOEJBQUMsUUFBZ0IsRUFBRSxJQUFZLEVBQXFCO0FBQzdFLGFBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUNuRSxlQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxFQUFFLENBQUMsQ0FBQztPQUN4RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDUDs7O1dBRW1CLHVCQUFDLFFBQWdCLEVBQTJCO0FBQzlELFVBQU0sTUFBTSxHQUFHLG1DQUFpQixhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEQsYUFBTyxNQUFNLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdEQ7OztTQXpUVSxnQkFBZ0IiLCJmaWxlIjoiUmVtb3RlQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeURlc2NyaXB0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXNvdXJjZS1jb250cm9sLWhlbHBlcnMnO1xuXG5pbXBvcnQgdHlwZW9mICogYXMgRmlsZVdhdGNoZXJTZXJ2aWNlVHlwZSBmcm9tICcuLi8uLi9udWNsaWRlLWZpbGV3YXRjaGVyLWJhc2UnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIFNvdXJjZUNvbnRyb2xTZXJ2aWNlIGZyb20gJy4uLy4uL251Y2xpZGUtc2VydmVyL2xpYi9zZXJ2aWNlcy9Tb3VyY2VDb250cm9sU2VydmljZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoTW9kdWxlIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4vUmVtb3RlRGlyZWN0b3J5JztcbmltcG9ydCB7U2VydmVyQ29ubmVjdGlvbn0gZnJvbSAnLi9TZXJ2ZXJDb25uZWN0aW9uJztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5cbmNvbnN0IHtSZW1vdGVGaWxlfSA9IHJlcXVpcmUoJy4vUmVtb3RlRmlsZScpO1xuY29uc3Qge2dldENvbm5lY3Rpb25Db25maWd9ID1cbiAgcmVxdWlyZSgnLi9SZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbk1hbmFnZXInKTtcblxuY29uc3QgRklMRV9XQVRDSEVSX1NFUlZJQ0UgPSAnRmlsZVdhdGNoZXJTZXJ2aWNlJztcbmNvbnN0IEZJTEVfU1lTVEVNX1NFUlZJQ0UgPSAnRmlsZVN5c3RlbVNlcnZpY2UnO1xuXG5leHBvcnQgdHlwZSBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbiA9IHtcbiAgaG9zdDogc3RyaW5nOyAvLyBob3N0IG51Y2xpZGUgc2VydmVyIGlzIHJ1bm5pbmcgb24uXG4gIHBvcnQ6IG51bWJlcjsgLy8gcG9ydCB0byBjb25uZWN0IHRvLlxuICBjd2Q6IHN0cmluZzsgLy8gUGF0aCB0byByZW1vdGUgZGlyZWN0b3J5IHVzZXIgc2hvdWxkIHN0YXJ0IGluIHVwb24gY29ubmVjdGlvbi5cbiAgZGlzcGxheVRpdGxlOiBzdHJpbmc7IC8vIE5hbWUgb2YgdGhlIHNhdmVkIGNvbm5lY3Rpb24gcHJvZmlsZS5cbiAgY2VydGlmaWNhdGVBdXRob3JpdHlDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjsgLy8gY2VydGlmaWNhdGUgb2YgY2VydGlmaWNhdGUgYXV0aG9yaXR5LlxuICBjbGllbnRDZXJ0aWZpY2F0ZT86IEJ1ZmZlcjsgLy8gY2xpZW50IGNlcnRpZmljYXRlIGZvciBodHRwcyBjb25uZWN0aW9uLlxuICBjbGllbnRLZXk/OiBCdWZmZXI7IC8vIGtleSBmb3IgaHR0cHMgY29ubmVjdGlvbi5cbn1cblxuY29uc3QgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuLy8gQSBSZW1vdGVDb25uZWN0aW9uIHJlcHJlc2VudHMgYSBkaXJlY3Rvcnkgd2hpY2ggaGFzIGJlZW4gb3BlbmVkIGluIE51Y2xpZGUgb24gYSByZW1vdGUgbWFjaGluZS5cbi8vIFRoaXMgY29ycmVzcG9uZHMgdG8gd2hhdCBhdG9tIGNhbGxzIGEgJ3Jvb3QgcGF0aCcgaW4gYSBwcm9qZWN0LlxuLy9cbi8vIFRPRE86IFRoZSBfZW50cmllcyBhbmQgX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uIHNob3VsZCBub3QgYmUgaGVyZS5cbi8vIE51Y2xpZGUgYmVoYXZlcyBiYWRseSB3aGVuIHJlbW90ZSBkaXJlY3RvcmllcyBhcmUgb3BlbmVkIHdoaWNoIGFyZSBwYXJlbnQvY2hpbGQgb2YgZWFjaCBvdGhlci5cbi8vIEFuZCB0aGVyZSBuZWVkbid0IGJlIGEgMToxIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIFJlbW90ZUNvbm5lY3Rpb25zIGFuZCBoZyByZXBvcy5cbmV4cG9ydCBjbGFzcyBSZW1vdGVDb25uZWN0aW9uIHtcbiAgX2VudHJpZXM6IHtbcGF0aDogc3RyaW5nXTogUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeX07XG4gIF9jd2Q6IHN0cmluZzsgLy8gUGF0aCB0byByZW1vdGUgZGlyZWN0b3J5IHVzZXIgc2hvdWxkIHN0YXJ0IGluIHVwb24gY29ubmVjdGlvbi5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbjogP0hnUmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICBfY29ubmVjdGlvbjogU2VydmVyQ29ubmVjdGlvbjtcbiAgX2Rpc3BsYXlUaXRsZTogc3RyaW5nO1xuXG4gIHN0YXRpYyBhc3luYyBmaW5kT3JDcmVhdGUoY29uZmlnOiBSZW1vdGVDb25uZWN0aW9uQ29uZmlndXJhdGlvbik6XG4gICAgICBQcm9taXNlPFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBzZXJ2ZXJDb25uZWN0aW9uID0gYXdhaXQgU2VydmVyQ29ubmVjdGlvbi5nZXRPckNyZWF0ZShjb25maWcpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgUmVtb3RlQ29ubmVjdGlvbihzZXJ2ZXJDb25uZWN0aW9uLCBjb25maWcuY3dkLCBjb25maWcuZGlzcGxheVRpdGxlKTtcbiAgICByZXR1cm4gYXdhaXQgY29ubmVjdGlvbi5faW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgLy8gRG8gTk9UIGNhbGwgdGhpcyBkaXJlY3RseS4gVXNlIGZpbmRPckNyZWF0ZSBpbnN0ZWFkLlxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBTZXJ2ZXJDb25uZWN0aW9uLCBjd2Q6IHN0cmluZywgZGlzcGxheVRpdGxlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9lbnRyaWVzID0ge307XG4gICAgdGhpcy5fY3dkID0gY3dkO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLl9kaXNwbGF5VGl0bGUgPSBkaXNwbGF5VGl0bGU7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc3RhdGljIF9jcmVhdGVJbnNlY3VyZUNvbm5lY3Rpb25Gb3JUZXN0aW5nKFxuICAgIGN3ZDogc3RyaW5nLFxuICAgIHBvcnQ6IG51bWJlcixcbiAgKTogUHJvbWlzZTxSZW1vdGVDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICBwb3J0LFxuICAgICAgY3dkLFxuICAgICAgZGlzcGxheVRpdGxlOiAnJyxcbiAgICB9O1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmZpbmRPckNyZWF0ZShjb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGNvbm5lY3Rpb24gYnkgcmV1c2luZyB0aGUgY29uZmlndXJhdGlvbiBvZiBsYXN0IHN1Y2Nlc3NmdWwgY29ubmVjdGlvbiBhc3NvY2lhdGVkIHdpdGhcbiAgICogZ2l2ZW4gaG9zdC4gSWYgdGhlIHNlcnZlcidzIGNlcnRzIGhhcyBiZWVuIHVwZGF0ZWQgb3IgdGhlcmUgaXMgbm8gcHJldmlvdXMgc3VjY2Vzc2Z1bFxuICAgKiBjb25uZWN0aW9uLCBudWxsIChyZXNvbHZlZCBieSBwcm9taXNlKSBpcyByZXR1cm5lZC5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBjcmVhdGVDb25uZWN0aW9uQnlTYXZlZENvbmZpZyhcbiAgICBob3N0OiBzdHJpbmcsXG4gICAgY3dkOiBzdHJpbmcsXG4gICAgZGlzcGxheVRpdGxlOiBzdHJpbmdcbiAgKTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25Db25maWcgPSBnZXRDb25uZWN0aW9uQ29uZmlnKGhvc3QpO1xuICAgIGlmICghY29ubmVjdGlvbkNvbmZpZykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb25maWcgPSB7Li4uY29ubmVjdGlvbkNvbmZpZywgY3dkLCBkaXNwbGF5VGl0bGV9O1xuICAgICAgcmV0dXJuIGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uZmluZE9yQ3JlYXRlKGNvbmZpZyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLndhcm4oYEZhaWxlZCB0byByZXVzZSBjb25uZWN0aW9uQ29uZmlndXJhdGlvbiBmb3IgJHtob3N0fWAsIGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogQXRvbSdzIFByb2plY3Q6OnNldFBhdGhzIGN1cnJlbnRseSB1c2VzXG4gIC8vIDo6cmVwb3NpdG9yeUZvckRpcmVjdG9yeVN5bmMsIHNvIHdlIG5lZWQgdGhlIHJlcG8gaW5mb3JtYXRpb24gdG8gYWxyZWFkeSBiZVxuICAvLyBhdmFpbGFibGUgd2hlbiB0aGUgbmV3IHBhdGggaXMgYWRkZWQuIHQ2OTEzNjI0IHRyYWNrcyBjbGVhbnVwIG9mIHRoaXMuXG4gIGFzeW5jIF9zZXRIZ1JlcG9JbmZvKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlbW90ZVBhdGggPSB0aGlzLmdldFBhdGhGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IHtnZXRIZ1JlcG9zaXRvcnl9ID0gKHRoaXMuZ2V0U2VydmljZSgnU291cmNlQ29udHJvbFNlcnZpY2UnKTogU291cmNlQ29udHJvbFNlcnZpY2UpO1xuICAgIHRoaXMuX3NldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKGF3YWl0IGdldEhnUmVwb3NpdG9yeShyZW1vdGVQYXRoKSk7XG4gIH1cblxuICBnZXRVcmlPZlJlbW90ZVBhdGgocmVtb3RlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG51Y2xpZGU6Ly8ke3RoaXMuZ2V0UmVtb3RlSG9zdCgpfSR7cmVtb3RlUGF0aH1gO1xuICB9XG5cbiAgZ2V0UGF0aE9mVXJpKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVtb3RlVXJpLnBhcnNlKHVyaSkucGF0aDtcbiAgfVxuXG4gIGNyZWF0ZURpcmVjdG9yeSh1cmk6IHN0cmluZywgc3ltbGluazogYm9vbGVhbiA9IGZhbHNlKTogUmVtb3RlRGlyZWN0b3J5IHtcbiAgICBsZXQge3BhdGh9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgcGF0aCA9IHBhdGhNb2R1bGUubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoXG4gICAgICAhZW50cnkgfHxcbiAgICAgIGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoIHx8XG4gICAgICBlbnRyeS5pc1N5bWJvbGljTGluaygpICE9PSBzeW1saW5rXG4gICAgKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRGlyZWN0b3J5KFxuICAgICAgICB0aGlzLFxuICAgICAgICB0aGlzLmdldFVyaU9mUmVtb3RlUGF0aChwYXRoKSxcbiAgICAgICAgc3ltbGluayxcbiAgICAgICAge2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uOiB0aGlzLl9oZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbn1cbiAgICAgICk7XG4gICAgICAvLyBUT0RPOiBXZSBzaG91bGQgYWRkIHRoZSBmb2xsb3dpbmcgbGluZSB0byBrZWVwIHRoZSBjYWNoZSB1cC10by1kYXRlLlxuICAgICAgLy8gV2UgbmVlZCB0byBpbXBsZW1lbnQgb25EaWRSZW5hbWUgYW5kIG9uRGlkRGVsZXRlIGluIFJlbW90ZURpcmVjdG9yeVxuICAgICAgLy8gZmlyc3QuIEl0J3Mgb2sgdGhhdCB3ZSBkb24ndCBhZGQgdGhlIGhhbmRsZXJzIGZvciBub3cgc2luY2Ugd2UgaGF2ZVxuICAgICAgLy8gdGhlIGNoZWNrIGBlbnRyeS5nZXRMb2NhbFBhdGgoKSAhPT0gcGF0aGAgYWJvdmUuXG4gICAgICAvL1xuICAgICAgLy8gdGhpcy5fYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeSk7XG4gICAgfVxuXG4gICAgaW52YXJpYW50KGVudHJ5IGluc3RhbmNlb2YgUmVtb3RlRGlyZWN0b3J5KTtcbiAgICBpZiAoIWVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGF0aCBpcyBub3QgYSBkaXJlY3Rvcnk6JyArIHVyaSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgLy8gQSB3b3JrYXJvdW5kIGJlZm9yZSBBdG9tIDIuMDogc2VlIDo6Z2V0SGdSZXBvSW5mbyBvZiBtYWluLmpzLlxuICBfc2V0SGdSZXBvc2l0b3J5RGVzY3JpcHRpb24oaGdSZXBvc2l0b3J5RGVzY3JpcHRpb246ID9IZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2hnUmVwb3NpdG9yeURlc2NyaXB0aW9uID0gaGdSZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gIH1cblxuICBjcmVhdGVGaWxlKHVyaTogc3RyaW5nLCBzeW1saW5rOiBib29sZWFuID0gZmFsc2UpOiBSZW1vdGVGaWxlIHtcbiAgICBsZXQge3BhdGh9ID0gcmVtb3RlVXJpLnBhcnNlKHVyaSk7XG4gICAgcGF0aCA9IHBhdGhNb2R1bGUubm9ybWFsaXplKHBhdGgpO1xuXG4gICAgbGV0IGVudHJ5ID0gdGhpcy5fZW50cmllc1twYXRoXTtcbiAgICBpZiAoXG4gICAgICAhZW50cnkgfHxcbiAgICAgIGVudHJ5LmdldExvY2FsUGF0aCgpICE9PSBwYXRoIHx8XG4gICAgICBlbnRyeS5pc1N5bWJvbGljTGluaygpICE9PSBzeW1saW5rXG4gICAgKSB7XG4gICAgICB0aGlzLl9lbnRyaWVzW3BhdGhdID0gZW50cnkgPSBuZXcgUmVtb3RlRmlsZShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgocGF0aCksXG4gICAgICAgIHN5bWxpbmssXG4gICAgICApO1xuICAgICAgdGhpcy5fYWRkSGFuZGxlcnNGb3JFbnRyeShlbnRyeSk7XG4gICAgfVxuXG4gICAgaW52YXJpYW50KGVudHJ5IGluc3RhbmNlb2YgUmVtb3RlRmlsZSk7XG4gICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGF0aCBpcyBub3QgYSBmaWxlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgX2FkZEhhbmRsZXJzRm9yRW50cnkoZW50cnk6IFJlbW90ZUZpbGUgfCBSZW1vdGVEaXJlY3RvcnkpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRQYXRoID0gZW50cnkuZ2V0TG9jYWxQYXRoKCk7XG4gICAgLyogJEZsb3dGaXhNZSAqL1xuICAgIGNvbnN0IHJlbmFtZVN1YnNjcmlwdGlvbiA9IGVudHJ5Lm9uRGlkUmVuYW1lKCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9lbnRyaWVzW29sZFBhdGhdO1xuICAgICAgdGhpcy5fZW50cmllc1tlbnRyeS5nZXRMb2NhbFBhdGgoKV0gPSBlbnRyeTtcbiAgICB9KTtcbiAgICAvKiAkRmxvd0ZpeE1lICovXG4gICAgY29uc3QgZGVsZXRlU3Vic2NyaXB0aW9uID0gZW50cnkub25EaWREZWxldGUoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2VudHJpZXNbZW50cnkuZ2V0TG9jYWxQYXRoKCldO1xuICAgICAgcmVuYW1lU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGRlbGV0ZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfaW5pdGlhbGl6ZSgpOiBQcm9taXNlPFJlbW90ZUNvbm5lY3Rpb24+IHtcbiAgICAvLyBNdXN0IGFkZCBmaXJzdCB0byBwcmV2ZW50IHRoZSBTZXJ2ZXJDb25uZWN0aW9uIGZyb20gZ29pbmcgYXdheVxuICAgIC8vIGluIGEgcG9zc2libGUgcmFjZS5cbiAgICB0aGlzLl9jb25uZWN0aW9uLmFkZENvbm5lY3Rpb24odGhpcyk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IEZpbGVTeXN0ZW1TZXJ2aWNlID0gdGhpcy5nZXRTZXJ2aWNlKEZJTEVfU1lTVEVNX1NFUlZJQ0UpO1xuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gYXdhaXQgRmlsZVN5c3RlbVNlcnZpY2UucmVzb2x2ZVJlYWxQYXRoKHRoaXMuX2N3ZCk7XG5cbiAgICAgIC8vIE5vdyB0aGF0IHdlIGtub3cgdGhlIHJlYWwgcGF0aCwgaXQncyBwb3NzaWJsZSB0aGlzIGNvbGxpZGVzIHdpdGggYW4gZXhpc3RpbmcgY29ubmVjdGlvbi5cbiAgICAgIC8vIElmIHNvLCB3ZSBzaG91bGQganVzdCBzdG9wIGltbWVkaWF0ZWx5LlxuICAgICAgaWYgKHJlc29sdmVkUGF0aCAhPT0gdGhpcy5fY3dkKSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nQ29ubmVjdGlvbiA9XG4gICAgICAgICAgICBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKHRoaXMuZ2V0UmVtb3RlSG9zdG5hbWUoKSwgcmVzb2x2ZWRQYXRoKTtcbiAgICAgICAgaW52YXJpYW50KHRoaXMgIT09IGV4aXN0aW5nQ29ubmVjdGlvbik7XG4gICAgICAgIGlmIChleGlzdGluZ0Nvbm5lY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICByZXR1cm4gZXhpc3RpbmdDb25uZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY3dkID0gcmVzb2x2ZWRQYXRoO1xuICAgICAgfVxuXG4gICAgICAvLyBBIHdvcmthcm91bmQgYmVmb3JlIEF0b20gMi4wOiBzZWUgOjpnZXRIZ1JlcG9JbmZvLlxuICAgICAgYXdhaXQgdGhpcy5fc2V0SGdSZXBvSW5mbygpO1xuXG4gICAgICBfZW1pdHRlci5lbWl0KCdkaWQtYWRkJywgdGhpcyk7XG4gICAgICB0aGlzLl93YXRjaFJvb3RQcm9qZWN0RGlyZWN0b3J5KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfd2F0Y2hSb290UHJvamVjdERpcmVjdG9yeSgpOiB2b2lkIHtcbiAgICBjb25zdCByb290RGlyZWN0b3J5VXJpID0gdGhpcy5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IHJvb3REaXJlY3RvdHlQYXRoID0gdGhpcy5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgICBjb25zdCBGaWxlV2F0Y2hlclNlcnZpY2U6IEZpbGVXYXRjaGVyU2VydmljZVR5cGUgPSB0aGlzLmdldFNlcnZpY2UoRklMRV9XQVRDSEVSX1NFUlZJQ0UpO1xuICAgIGludmFyaWFudChGaWxlV2F0Y2hlclNlcnZpY2UpO1xuICAgIGNvbnN0IHt3YXRjaERpcmVjdG9yeVJlY3Vyc2l2ZX0gPSBGaWxlV2F0Y2hlclNlcnZpY2U7XG4gICAgLy8gU3RhcnQgd2F0Y2hpbmcgdGhlIHByb2plY3QgZm9yIGNoYW5nZXMgYW5kIGluaXRpYWxpemUgdGhlIHJvb3Qgd2F0Y2hlclxuICAgIC8vIGZvciBuZXh0IGNhbGxzIHRvIGB3YXRjaEZpbGVgIGFuZCBgd2F0Y2hEaXJlY3RvcnlgLlxuICAgIGNvbnN0IHdhdGNoU3RyZWFtID0gd2F0Y2hEaXJlY3RvcnlSZWN1cnNpdmUocm9vdERpcmVjdG9yeVVyaSk7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gd2F0Y2hTdHJlYW0uc3Vic2NyaWJlKHdhdGNoVXBkYXRlID0+IHtcbiAgICAgIC8vIE5vdGhpbmcgbmVlZHMgdG8gYmUgZG9uZSBpZiB0aGUgcm9vdCBkaXJlY3Rvcnkgd2FzIHdhdGNoZWQgY29ycmVjdGx5LlxuICAgICAgLy8gTGV0J3MganVzdCBjb25zb2xlIGxvZyBpdCBhbnl3YXkuXG4gICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hlciBGZWF0dXJlcyBJbml0aWFsaXplZCBmb3IgcHJvamVjdDogJHtyb290RGlyZWN0b3J5VXJpfWAsIHdhdGNoVXBkYXRlKTtcbiAgICB9LCBhc3luYyBlcnJvciA9PiB7XG4gICAgICBsZXQgd2FybmluZ01lc3NhZ2VUb1VzZXIgPSBgWW91IGp1c3QgY29ubmVjdGVkIHRvIGEgcmVtb3RlIHByb2plY3QgYCArXG4gICAgICAgIGBcXGAke3Jvb3REaXJlY3RvdHlQYXRofVxcYCBidXQgd2UgcmVjb21tZW5kIHlvdSByZW1vdmUgdGhpcyBkaXJlY3Rvcnkgbm93IGAgK1xuICAgICAgICBgYmVjYXVzZSBjcnVjaWFsIGZlYXR1cmVzIGxpa2Ugc3luY2VkIHJlbW90ZSBmaWxlIGVkaXRpbmcsIGZpbGUgc2VhcmNoLCBgICtcbiAgICAgICAgYGFuZCBNZXJjdXJpYWwtcmVsYXRlZCB1cGRhdGVzIHdpbGwgbm90IHdvcmsuPGJyLz5gO1xuXG4gICAgICBjb25zdCBsb2dnZWRFcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlIHx8IGVycm9yO1xuICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICBgV2F0Y2hlciBmYWlsZWQgdG8gc3RhcnQgLSB3YXRjaGVyIGZlYXR1cmVzIGRpc2FibGVkISBFcnJvcjogJHtsb2dnZWRFcnJvck1lc3NhZ2V9YFxuICAgICAgKTtcblxuICAgICAgY29uc3QgRmlsZVN5c3RlbVNlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoRklMRV9TWVNURU1fU0VSVklDRSk7XG4gICAgICBpZiAoYXdhaXQgRmlsZVN5c3RlbVNlcnZpY2UuaXNOZnMocm9vdERpcmVjdG90eVBhdGgpKSB7XG4gICAgICAgIHdhcm5pbmdNZXNzYWdlVG9Vc2VyICs9XG4gICAgICAgICAgYFRoaXMgcHJvamVjdCBkaXJlY3Rvcnk6IFxcYCR7cm9vdERpcmVjdG90eVBhdGh9XFxgIGlzIG9uIDxiPlxcYE5GU1xcYDwvYj4gZmlsZXN5c3RlbS4gYCArXG4gICAgICAgICAgYE51Y2xpZGUgd29ya3MgYmVzdCB3aXRoIGxvY2FsIChub24tTkZTKSByb290IGRpcmVjdG9yeS5gICtcbiAgICAgICAgICBgZS5nLiBcXGAvZGF0YS91c2Vycy8kVVNFUlxcYGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuaW5nTWVzc2FnZVRvVXNlciArPVxuICAgICAgICAgIGA8Yj48YSBocmVmPSdodHRwczovL2ZhY2Vib29rLmdpdGh1Yi5pby93YXRjaG1hbi8nPldhdGNobWFuPC9hPiBFcnJvcjo8L2I+YCArXG4gICAgICAgICAgbG9nZ2VkRXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGEgcGVyc2lzdGVudCB3YXJuaW5nIG1lc3NhZ2UgdG8gbWFrZSBzdXJlIHRoZSB1c2VyIHNlZXMgaXQgYmVmb3JlIGRpc21pc3NpbmcuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyh3YXJuaW5nTWVzc2FnZVRvVXNlciwge2Rpc21pc3NhYmxlOiB0cnVlfSk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gTm90aGluZyBuZWVkcyB0byBiZSBkb25lIGlmIHRoZSByb290IGRpcmVjdG9yeSB3YXRjaCBoYXMgZW5kZWQuXG4gICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hlciBGZWF0dXJlcyBFbmRlZCBmb3IgcHJvamVjdDogJHtyb290RGlyZWN0b3J5VXJpfWApO1xuICAgIH0pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLnJlbW92ZUNvbm5lY3Rpb24odGhpcyk7XG4gICAgX2VtaXR0ZXIuZW1pdCgnZGlkLWNsb3NlJywgdGhpcyk7XG4gIH1cblxuICBnZXRDb25uZWN0aW9uKCk6IFNlcnZlckNvbm5lY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uO1xuICB9XG5cbiAgZ2V0UmVtb3RlSG9zdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uLmdldFJlbW90ZUhvc3QoKTtcbiAgfVxuXG4gIGdldFBvcnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbi5nZXRQb3J0KCk7XG4gIH1cblxuICBnZXRSZW1vdGVIb3N0bmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uLmdldFJlbW90ZUhvc3RuYW1lKCk7XG4gIH1cblxuICBnZXREaXNwbGF5VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzcGxheVRpdGxlO1xuICB9XG5cbiAgZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRVcmlPZlJlbW90ZVBhdGgodGhpcy5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSk7XG4gIH1cblxuICBnZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY3dkO1xuICB9XG5cbiAgZ2V0Q29uZmlnKCk6IFJlbW90ZUNvbm5lY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgICByZXR1cm4gey4uLnRoaXMuX2Nvbm5lY3Rpb24uZ2V0Q29uZmlnKCksIGN3ZDogdGhpcy5fY3dkLCBkaXNwbGF5VGl0bGU6IHRoaXMuX2Rpc3BsYXlUaXRsZX07XG4gIH1cblxuICBzdGF0aWMgb25EaWRBZGRSZW1vdGVDb25uZWN0aW9uKGhhbmRsZXI6IChjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgX2VtaXR0ZXIub24oJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1hZGQnLCBoYW5kbGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBvbkRpZENsb3NlUmVtb3RlQ29ubmVjdGlvbihoYW5kbGVyOiAoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbikgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIF9lbWl0dGVyLm9uKCdkaWQtY2xvc2UnLCBoYW5kbGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2RpZC1jbG9zZScsIGhhbmRsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGdldEZvclVyaSh1cmk6IE51Y2xpZGVVcmkpOiA/UmVtb3RlQ29ubmVjdGlvbiB7XG4gICAgY29uc3Qge2hvc3RuYW1lLCBwYXRofSA9IHJlbW90ZVVyaS5wYXJzZSh1cmkpO1xuICAgIGlmIChob3N0bmFtZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIFJlbW90ZUNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZUFuZFBhdGgoaG9zdG5hbWUsIHBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjYWNoZWQgY29ubmVjdGlvbiBtYXRjaCB0aGUgaG9zdG5hbWUgYW5kIHRoZSBwYXRoIGhhcyB0aGUgcHJlZml4IG9mIGNvbm5lY3Rpb24uY3dkLlxuICAgKiBAcGFyYW0gaG9zdG5hbWUgVGhlIGNvbm5lY3RlZCBzZXJ2ZXIgaG9zdCBuYW1lLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgYWJzb2x1dGUgcGF0aCB0aGF0J3MgaGFzIHRoZSBwcmVmaXggb2YgY3dkIG9mIHRoZSBjb25uZWN0aW9uLlxuICAgKiAgIElmIHBhdGggaXMgbnVsbCwgZW1wdHkgb3IgdW5kZWZpbmVkLCB0aGVuIHJldHVybiB0aGUgY29ubmVjdGlvbiB3aGljaCBtYXRjaGVzXG4gICAqICAgdGhlIGhvc3RuYW1lIGFuZCBpZ25vcmUgdGhlIGluaXRpYWwgd29ya2luZyBkaXJlY3RvcnkuXG4gICAqL1xuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZUFuZFBhdGgoaG9zdG5hbWU6IHN0cmluZywgcGF0aDogc3RyaW5nKTogP1JlbW90ZUNvbm5lY3Rpb24ge1xuICAgIHJldHVybiBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWUoaG9zdG5hbWUpLmZpbHRlcihjb25uZWN0aW9uID0+IHtcbiAgICAgIHJldHVybiBwYXRoLnN0YXJ0c1dpdGgoY29ubmVjdGlvbi5nZXRQYXRoRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSk7XG4gICAgfSlbMF07XG4gIH1cblxuICBzdGF0aWMgZ2V0QnlIb3N0bmFtZShob3N0bmFtZTogc3RyaW5nKTogQXJyYXk8UmVtb3RlQ29ubmVjdGlvbj4ge1xuICAgIGNvbnN0IHNlcnZlciA9IFNlcnZlckNvbm5lY3Rpb24uZ2V0QnlIb3N0bmFtZShob3N0bmFtZSk7XG4gICAgcmV0dXJuIHNlcnZlciA9PSBudWxsID8gW10gOiBzZXJ2ZXIuZ2V0Q29ubmVjdGlvbnMoKTtcbiAgfVxuXG4gIGdldFNlcnZpY2Uoc2VydmljZU5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uZ2V0U2VydmljZShzZXJ2aWNlTmFtZSk7XG4gIH1cbn1cbiJdfQ==