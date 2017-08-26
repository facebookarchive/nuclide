'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteConnection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _RemoteConnectionConfigurationManager;

function _load_RemoteConnectionConfigurationManager() {
  return _RemoteConnectionConfigurationManager = require('./RemoteConnectionConfigurationManager');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection');

const FILE_WATCHER_SERVICE = 'FileWatcherService';
const FILE_SYSTEM_SERVICE = 'FileSystemService';

// A RemoteConnection represents a directory which has been opened in Nuclide on a remote machine.
// This corresponds to what atom calls a 'root path' in a project.
//
// TODO: The _entries and _hgRepositoryDescription should not be here.
// Nuclide behaves badly when remote directories are opened which are parent/child of each other.
// And there needn't be a 1:1 relationship between RemoteConnections and hg repos.
class RemoteConnection {
  // Path to remote directory user should start in upon connection.
  static findOrCreate(config) {
    return (0, _asyncToGenerator.default)(function* () {
      const serverConnection = yield (_ServerConnection || _load_ServerConnection()).ServerConnection.getOrCreate(config);
      return RemoteConnection.findOrCreateFromConnection(serverConnection, config.cwd, config.displayTitle);
    })();
  }

  static findOrCreateFromConnection(serverConnection, cwd, displayTitle) {
    const connection = new RemoteConnection(serverConnection, cwd, displayTitle);
    return connection._initialize();
  }

  // Do NOT call this directly. Use findOrCreate instead.
  constructor(connection, cwd, displayTitle) {
    this._cwd = cwd;
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._hgRepositoryDescription = null;
    this._connection = connection;
    this._displayTitle = displayTitle;
    this._alwaysShutdownIfLast = false;
  }

  static _createInsecureConnectionForTesting(cwd, port) {
    const config = {
      host: 'localhost',
      port,
      cwd,
      displayTitle: ''
    };
    return RemoteConnection.findOrCreate(config);
  }

  /**
   * Create a connection by reusing the configuration of last successful connection associated with
   * given host. If the server's certs has been updated or there is no previous successful
   * connection, null (resolved by promise) is returned.
   * Configurations may also be retrieved by IP address.
   */
  static createConnectionBySavedConfig(hostOrIp, cwd, displayTitle) {
    return (0, _asyncToGenerator.default)(function* () {
      const connectionConfig = (0, (_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).getConnectionConfig)(hostOrIp);
      if (!connectionConfig) {
        return null;
      }
      try {
        const config = Object.assign({}, connectionConfig, { cwd, displayTitle });
        return yield RemoteConnection.findOrCreate(config);
      } catch (e) {
        const log = e.name === 'VersionMismatchError' ? logger.warn.bind(logger) : logger.error.bind(logger);
        log(`Failed to reuse connectionConfiguration for ${hostOrIp}`, e);
        return null;
      }
    })();
  }

  // A workaround before Atom 2.0: Atom's Project::setPaths currently uses
  // ::repositoryForDirectorySync, so we need the repo information to already be
  // available when the new path is added. t6913624 tracks cleanup of this.
  _setHgRepoInfo() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const remotePath = _this.getPathForInitialWorkingDirectory();
      const { getHgRepository } = _this.getService('SourceControlService');
      _this._setHgRepositoryDescription((yield getHgRepository(remotePath)));
    })();
  }

  getUriOfRemotePath(remotePath) {
    return `nuclide://${this.getRemoteHostname()}${remotePath}`;
  }

  getPathOfUri(uri) {
    return (_nuclideUri || _load_nuclideUri()).default.parse(uri).path;
  }

  createDirectory(uri, symlink = false) {
    return this._connection.createDirectory(uri, this._hgRepositoryDescription, symlink);
  }

  // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
  _setHgRepositoryDescription(hgRepositoryDescription) {
    this._hgRepositoryDescription = hgRepositoryDescription;
  }

  getHgRepositoryDescription() {
    return this._hgRepositoryDescription;
  }

  createFile(uri, symlink = false) {
    return this._connection.createFile(uri, symlink);
  }

  _initialize() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const attemptShutdown = false;
      // Must add first to prevent the ServerConnection from going away
      // in a possible race.
      _this2._connection.addConnection(_this2);
      try {
        const fileSystemService = _this2.getService(FILE_SYSTEM_SERVICE);
        const resolvedPath = yield fileSystemService.resolveRealPath(_this2._cwd);

        // Now that we know the real path, it's possible this collides with an existing connection.
        // If so, we should just stop immediately.
        if (resolvedPath !== _this2._cwd) {
          const existingConnection = RemoteConnection.getByHostnameAndPath(_this2.getRemoteHostname(), resolvedPath);

          if (!(_this2 !== existingConnection)) {
            throw new Error('Invariant violation: "this !== existingConnection"');
          }

          if (existingConnection != null) {
            _this2.close(attemptShutdown);
            return existingConnection;
          }

          _this2._cwd = resolvedPath;
        }

        // A workaround before Atom 2.0: see ::getHgRepoInfo.
        yield _this2._setHgRepoInfo();

        RemoteConnection._emitter.emit('did-add', _this2);
        _this2._watchRootProjectDirectory();
      } catch (e) {
        _this2.close(attemptShutdown);
        throw e;
      }
      return _this2;
    })();
  }

  _watchRootProjectDirectory() {
    var _this3 = this;

    const rootDirectoryUri = this.getUriForInitialWorkingDirectory();
    const rootDirectoryPath = this.getPathForInitialWorkingDirectory();
    const FileWatcherService = this.getService(FILE_WATCHER_SERVICE);

    if (!FileWatcherService) {
      throw new Error('Invariant violation: "FileWatcherService"');
    }

    const { watchDirectoryRecursive } = FileWatcherService;
    // Start watching the project for changes and initialize the root watcher
    // for next calls to `watchFile` and `watchDirectory`.
    const watchStream = watchDirectoryRecursive(rootDirectoryUri).refCount();
    const subscription = watchStream.subscribe(watchUpdate => {
      // Nothing needs to be done if the root directory was watched correctly.
      // Let's just console log it anyway.
      logger.info(`Watcher Features Initialized for project: ${rootDirectoryUri}`, watchUpdate);
    }, (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (error) {
        let warningMessageToUser = '';
        let detail;
        const fileSystemService = _this3.getService(FILE_SYSTEM_SERVICE);
        if (yield fileSystemService.isNfs(rootDirectoryUri)) {
          warningMessageToUser += `This project directory: \`${rootDirectoryPath}\` is on <b>\`NFS\`</b> filesystem. ` + 'Nuclide works best with local (non-NFS) root directory.' + 'e.g. `/data/users/$USER`' + 'features such as synced remote file editing, file search, ' + 'and Mercurial-related updates will not work.<br/>';
        } else {
          warningMessageToUser += 'You just connected to a remote project ' + `\`${rootDirectoryPath}\` without Watchman support, which means that ` + 'crucial features such as synced remote file editing, file search, ' + 'and Mercurial-related updates will not work.';

          const watchmanConfig = yield fileSystemService.findNearestAncestorNamed('.watchmanconfig', rootDirectoryUri).catch(function () {
            return null;
          });
          if (watchmanConfig == null) {
            warningMessageToUser += '<br/><br/>A possible workaround is to create an empty `.watchmanconfig` file ' + 'in the remote folder, which will enable Watchman if you have it installed.';
          }
          detail = error.message || error;
          logger.error('Watchman failed to start - watcher features disabled!', error);
        }
        // Add a persistent warning message to make sure the user sees it before dismissing.
        atom.notifications.addWarning(warningMessageToUser, {
          dismissable: true,
          detail
        });
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })(), () => {
      // Nothing needs to be done if the root directory watch has ended.
      logger.info(`Watcher Features Ended for project: ${rootDirectoryUri}`);
    });
    this._subscriptions.add(subscription);
  }

  close(shutdownIfLast) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this4._subscriptions.dispose();
      yield _this4._connection.removeConnection(_this4, shutdownIfLast);
      RemoteConnection._emitter.emit('did-close', _this4);
    })();
  }

  getConnection() {
    return this._connection;
  }

  getPort() {
    return this._connection.getPort();
  }

  getRemoteHostname() {
    return this._connection.getRemoteHostname();
  }

  getDisplayTitle() {
    return this._displayTitle;
  }

  getUriForInitialWorkingDirectory() {
    return this.getUriOfRemotePath(this.getPathForInitialWorkingDirectory());
  }

  getPathForInitialWorkingDirectory() {
    return this._cwd;
  }

  getConfig() {
    return Object.assign({}, this._connection.getConfig(), {
      cwd: this._cwd,
      displayTitle: this._displayTitle
    });
  }

  static onDidAddRemoteConnection(handler) {
    return RemoteConnection._emitter.on('did-add', handler);
  }

  static onDidCloseRemoteConnection(handler) {
    return RemoteConnection._emitter.on('did-close', handler);
  }

  static getForUri(uri) {
    const { hostname, path } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
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
  static getByHostnameAndPath(hostname, path) {
    return RemoteConnection.getByHostname(hostname).filter(connection => {
      return path.startsWith(connection.getPathForInitialWorkingDirectory());
    })[0];
  }

  static getByHostname(hostname) {
    const server = (_ServerConnection || _load_ServerConnection()).ServerConnection.getByHostname(hostname);
    return server == null ? [] : server.getConnections();
  }

  getService(serviceName) {
    return this._connection.getService(serviceName);
  }

  isOnlyConnection() {
    return this._connection.getConnections().length === 1;
  }

  setAlwaysShutdownIfLast(alwaysShutdownIfLast) {
    this._alwaysShutdownIfLast = alwaysShutdownIfLast;
  }

  alwaysShutdownIfLast() {
    return this._alwaysShutdownIfLast;
  }
}
exports.RemoteConnection = RemoteConnection;
RemoteConnection._emitter = new _atom.Emitter();