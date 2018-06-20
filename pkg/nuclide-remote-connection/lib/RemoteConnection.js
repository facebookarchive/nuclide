'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteConnection = undefined;

var _ProjectManager;

function _load_ProjectManager() {
  return _ProjectManager = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/ProjectManager'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _lookupPreferIpV;

function _load_lookupPreferIpV() {
  return _lookupPreferIpV = _interopRequireDefault(require('./lookup-prefer-ip-v6'));
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
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

  static async findOrCreate(config) {
    const serverConnection = await (_ServerConnection || _load_ServerConnection()).ServerConnection.getOrCreate(config);
    const { path, displayTitle, promptReconnectOnFailure } = config;
    let roots;

    try {
      const fsService = serverConnection.getService(FILE_SYSTEM_SERVICE);
      const realPath = await fsService.resolveRealPath(path);

      if (hasAtomProjectFormat(path)) {
        await (_ProjectManager || _load_ProjectManager()).default.open(serverConnection.getUriOfRemotePath(realPath));
        // $FlowFixMe: Upstream this and add to our type defs
        roots = atom.project.getSpecification().paths;
      } else {
        // Now that we know the real path, it's possible this collides with an existing connection.
        if (realPath !== path && (_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
          const existingConnection = this.getByHostnameAndPath((_nuclideUri || _load_nuclideUri()).default.getHostname(path), realPath);
          if (existingConnection != null) {
            return existingConnection;
          }
        }
        roots = [realPath];
      }
    } catch (err) {
      // Don't leave server connections hanging:
      // if we created a server connection from getOrCreate but failed above
      // then we need to make sure the connection gets closed.
      if (serverConnection.getConnections().length === 0) {
        serverConnection.close();
      }
      throw err;
    }
    const connections = await Promise.all(roots.map((dir, i) => {
      const connection = new RemoteConnection(serverConnection, dir, i === 0 ? displayTitle : '', promptReconnectOnFailure !== false);
      return connection._initialize();
    }));
    // We need to return one connection from this function,
    // even though many connections are being created to support projects.
    return connections[0];
  }

  // Do NOT call this directly. Use findOrCreate instead.
  // Path to remote directory user should start in upon connection.
  constructor(connection, path, displayTitle, promptReconnectOnFailure) {
    this._path = path;
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._hgRepositoryDescription = null;
    this._connection = connection;
    this._displayTitle = displayTitle;
    this._alwaysShutdownIfLast = false;
    this._promptReconnectOnFailure = promptReconnectOnFailure;
  }

  static _createInsecureConnectionForTesting(path, port) {
    const config = {
      host: 'localhost',
      port,
      path,
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
  static async _createConnectionBySavedConfig(host, path, displayTitle, promptReconnectOnFailure = true) {
    const connectionConfig = await (0, (_RemoteConnectionConfigurationManager || _load_RemoteConnectionConfigurationManager()).getConnectionConfig)(host);
    if (!connectionConfig) {
      return null;
    }
    try {
      const config = Object.assign({}, connectionConfig, {
        path,
        displayTitle,
        promptReconnectOnFailure
      });
      return await RemoteConnection.findOrCreate(config);
    } catch (e) {
      // Returning null from this method signals that we should
      // should restart the handshake process with same config.
      // But there are some errors for which we don't want to do that
      // (like if the connection fails because the directory doesn't exist).
      if (e.code === 'ENOENT') {
        e.sshHandshakeErrorType = 'DIRECTORY_NOT_FOUND';
        throw e;
      }

      const log = e.name === 'VersionMismatchError' ? logger.warn.bind(logger) : logger.error.bind(logger);

      log(`Failed to reuse connectionConfiguration for ${host}`, e);
      return null;
    }
  }

  /**
   * Attempts to connect to an open or previously open remote connection.
   */
  static async reconnect(host, path, displayTitle, promptReconnectOnFailure = true) {
    logger.info('Attempting to reconnect', {
      host,
      path,
      displayTitle,
      promptReconnectOnFailure
    });

    if (!hasAtomProjectFormat(path)) {
      const connection = RemoteConnection.getByHostnameAndPath(host, path);

      if (connection != null) {
        return connection;
      }
    }

    let connection = await RemoteConnection._createConnectionBySavedConfig(host, path, displayTitle, promptReconnectOnFailure);
    if (connection == null) {
      try {
        // Connection configs are also stored by IP address to share between hostnames.
        const { address } = await (0, (_lookupPreferIpV || _load_lookupPreferIpV()).default)(host);
        connection = await RemoteConnection._createConnectionBySavedConfig(address, path, displayTitle, promptReconnectOnFailure);
      } catch (err) {
        // It's OK if the backup IP check fails.
      }
    }
    return connection;
  }

  // A workaround before Atom 2.0: Atom's Project::setPaths currently uses
  // ::repositoryForDirectorySync, so we need the repo information to already be
  // available when the new path is added. t6913624 tracks cleanup of this.
  async _setHgRepoInfo() {
    const remotePath = this.getPath();
    const { getHgRepository } = this.getConnection().getService('SourceControlService');
    this._setHgRepositoryDescription((await getHgRepository(remotePath)));
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

  async _initialize() {
    const attemptShutdown = false;
    // Must add first to prevent the ServerConnection from going away
    // in a possible race.
    this._connection.addConnection(this);
    try {
      // A workaround before Atom 2.0: see ::getHgRepoInfo.
      await this._setHgRepoInfo();

      RemoteConnection._emitter.emit('did-add', this);
      this._watchRootProjectDirectory();
    } catch (e) {
      this.close(attemptShutdown);
      throw e;
    }
    return this;
  }

  _watchRootProjectDirectory() {
    const rootDirectoryUri = this.getUri();
    const rootDirectoryPath = this.getPath();
    const FileWatcherService = this.getConnection().getService(FILE_WATCHER_SERVICE);

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
    }, async error => {
      let warningMessageToUser = '';
      let detail;
      const fileSystemService = this.getConnection().getService(FILE_SYSTEM_SERVICE);
      if (await fileSystemService.isNfs(rootDirectoryUri)) {
        warningMessageToUser += `This project directory: \`${rootDirectoryPath}\` is on <b>\`NFS\`</b> filesystem. ` + 'Nuclide works best with local (non-NFS) root directory.' + 'e.g. `/data/users/$USER`' + 'features such as synced remote file editing, file search, ' + 'and Mercurial-related updates will not work.<br/>';
      } else {
        warningMessageToUser += 'You just connected to a remote project ' + `\`${rootDirectoryPath}\` without Watchman support, which means that ` + 'crucial features such as synced remote file editing, file search, ' + 'and Mercurial-related updates will not work.';
        detail = error.message || error;
        logger.error('Watchman failed to start - watcher features disabled!', error);
      }
      // Add a persistent warning message to make sure the user sees it before dismissing.
      atom.notifications.addWarning(warningMessageToUser, {
        dismissable: true,
        detail
      });
    }, () => {
      // Nothing needs to be done if the root directory watch has ended.
      logger.info(`Watcher Features Ended for project: ${rootDirectoryUri}`);
    });
    this._subscriptions.add(subscription);
  }

  async close(shutdownIfLast) {
    logger.info('Received close command!', {
      shutdownIfLast,
      stack: Error('stack').stack
    });
    this._subscriptions.dispose();
    await this._connection.removeConnection(this, shutdownIfLast);
    RemoteConnection._emitter.emit('did-close', this);
  }

  getConnection() {
    return this._connection;
  }

  getDisplayTitle() {
    return this._displayTitle;
  }

  getUri() {
    return this.getConnection().getUriOfRemotePath(this.getPath());
  }

  getPath() {
    return this._path;
  }

  getConfig() {
    return Object.assign({}, this._connection.getConfig(), {
      path: this._path,
      displayTitle: this._displayTitle,
      promptReconnectOnFailure: this._promptReconnectOnFailure
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
   * Get cached connection match the hostname and the path has the prefix of connection.path.
   * @param hostname The connected server host name.
   * @param path The absolute path that's has the prefix of path of the connection.
   *   If path is null, empty or undefined, then return the connection which matches
   *   the hostname and ignore the initial working directory.
   */
  static getByHostnameAndPath(hostname, path) {
    return RemoteConnection.getByHostname(hostname).filter(connection => {
      return (_nuclideUri || _load_nuclideUri()).default.contains(connection.getPath(), path);
    })[0];
  }

  static getByHostname(hostname) {
    const server = (_ServerConnection || _load_ServerConnection()).ServerConnection.getByHostname(hostname);
    return server == null ? [] : server.getConnections();
  }

  setAlwaysShutdownIfLast(alwaysShutdownIfLast) {
    this._alwaysShutdownIfLast = alwaysShutdownIfLast;
  }

  alwaysShutdownIfLast() {
    return this._alwaysShutdownIfLast;
  }
}

exports.RemoteConnection = RemoteConnection;
RemoteConnection._emitter = new (_eventKit || _load_eventKit()).Emitter();
function hasAtomProjectFormat(filepath) {
  const ext = (_nuclideUri || _load_nuclideUri()).default.extname(filepath);
  return ext === '.json' || ext === '.cson' || ext === '.toml';
}