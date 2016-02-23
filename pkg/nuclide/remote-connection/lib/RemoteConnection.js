'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import type {HgRepositoryDescription} from '../../source-control-helpers';

import typeof * as FileWatcherServiceType from '../../filewatcher-base';
import typeof * as SourceControlService from '../../server/lib/services/SourceControlService';

import invariant from 'assert';
import {RemoteDirectory} from './RemoteDirectory';
import {ServerConnection} from './ServerConnection';

const {CompositeDisposable, Disposable} = require('atom');
const remoteUri = require('../../remote-uri');
const logger = require('../../logging').getLogger();
const {EventEmitter} = require('events');

const {RemoteFile} = require('./RemoteFile');
const {getConnectionConfig} =
  require('./RemoteConnectionConfigurationManager');

const FILE_WATCHER_SERVICE = 'FileWatcherService';
const FILE_SYSTEM_SERVICE = 'FileSystemService';

export type RemoteConnectionConfiguration = {
  host: string; // host nuclide server is running on.
  port: number; // port to connect to.
  cwd: string; // Path to remote directory user should start in upon connection.
  certificateAuthorityCertificate?: Buffer; // certificate of certificate authority.
  clientCertificate?: Buffer; // client certificate for https connection.
  clientKey?: Buffer; // key for https connection.
}

const _emitter: EventEmitter = new EventEmitter();

// A RemoteConnection represents a directory which has been opened in Nuclide on a remote machine.
// This corresponds to what atom calls a 'root path' in a project.
//
// TODO: The _entries and _hgRepositoryDescription should not be here.
// Nuclide behaves badly when remote directories are opened which are parent/child of each other.
// And there needn't be a 1:1 relationship between RemoteConnections and hg repos.
export class RemoteConnection {
  _entries: {[path: string]: RemoteFile | RemoteDirectory};
  _cwd: string; // Path to remote directory user should start in upon connection.
  _subscriptions: CompositeDisposable;
  _hgRepositoryDescription: ?HgRepositoryDescription;
  _connection: ServerConnection;

  static async findOrCreate(config: RemoteConnectionConfiguration):
      Promise<RemoteConnection> {
    const serverConnection = await ServerConnection.getOrCreate(config);
    const connection = new RemoteConnection(serverConnection, config.cwd);
    return await connection._initialize();
  }

  // Do NOT call this directly. Use findOrCreate instead.
  constructor(connection: ServerConnection, cwd: string) {
    this._entries = {};
    this._cwd = cwd;
    this._subscriptions = new CompositeDisposable();
    this._hgRepositoryDescription = null;
    this._connection = connection;
  }

  dispose(): void {
    this._subscriptions.dispose();
  }

  static _createInsecureConnectionForTesting(
    cwd: string,
    port: number,
  ): Promise<RemoteConnection> {
    const config = {
      host: 'localhost',
      port,
      cwd,
    };
    return RemoteConnection.findOrCreate(config);
  }

  /**
   * Create a connection by reusing the configuration of last successful connection associated with
   * given host. If the server's certs has been updated or there is no previous successful
   * connection, null (resolved by promise) is returned.
   */
  static async createConnectionBySavedConfig(
    host: string,
    cwd: string,
  ): Promise<?RemoteConnection> {
    const connectionConfig = getConnectionConfig(host);
    if (!connectionConfig) {
      return null;
    }
    try {
      const config = {...connectionConfig, cwd};
      return await RemoteConnection.findOrCreate(config);
    } catch (e) {
      logger.warn(`Failed to reuse connectionConfiguration for ${host}`, e);
      return null;
    }
  }

  // A workaround before Atom 2.0: Atom's Project::setPaths currently uses
  // ::repositoryForDirectorySync, so we need the repo information to already be
  // available when the new path is added. t6913624 tracks cleanup of this.
  async _setHgRepoInfo(): Promise<void> {
    const remotePath = this.getPathForInitialWorkingDirectory();
    const {getHgRepository} = (this.getService('SourceControlService'): SourceControlService);
    this._setHgRepositoryDescription(await getHgRepository(remotePath));
  }

  getUriOfRemotePath(remotePath: string): string {
    return `nuclide://${this.getRemoteHost()}${remotePath}`;
  }

  getPathOfUri(uri: string): string {
    return remoteUri.parse(uri).path;
  }

  createDirectory(uri: string): RemoteDirectory {
    let {path} = remoteUri.parse(uri);
    path = require('path').normalize(path);

    let entry = this._entries[path];
    if (!entry || entry.getLocalPath() !== path) {
      this._entries[path] = entry = new RemoteDirectory(
        this,
        this.getUriOfRemotePath(path),
        {hgRepositoryDescription: this._hgRepositoryDescription}
      );
      // TODO: We should add the following line to keep the cache up-to-date.
      // We need to implement onDidRename and onDidDelete in RemoteDirectory
      // first. It's ok that we don't add the handlers for now since we have
      // the check `entry.getLocalPath() !== path` above.
      //
      // this._addHandlersForEntry(entry);
    }

    invariant(entry instanceof RemoteDirectory);
    if (!entry.isDirectory()) {
      throw new Error('Path is not a directory:' + uri);
    }

    return entry;
  }

  // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
  _setHgRepositoryDescription(hgRepositoryDescription: ?HgRepositoryDescription): void {
    this._hgRepositoryDescription = hgRepositoryDescription;
  }

  createFile(uri: string): RemoteFile {
    let {path} = remoteUri.parse(uri);
    path = require('path').normalize(path);

    let entry = this._entries[path];
    if (!entry || entry.getLocalPath() !== path) {
      this._entries[path] = entry = new RemoteFile(this, this.getUriOfRemotePath(path));
      this._addHandlersForEntry(entry);
    }

    invariant(entry instanceof RemoteFile);
    if (entry.isDirectory()) {
      throw new Error('Path is not a file');
    }

    return entry;
  }

  _addHandlersForEntry(entry: RemoteFile | RemoteDirectory): void {
    const oldPath = entry.getLocalPath();
    /* $FlowFixMe */
    const renameSubscription = entry.onDidRename(() => {
      delete this._entries[oldPath];
      this._entries[entry.getLocalPath()] = entry;
    });
    /* $FlowFixMe */
    const deleteSubscription = entry.onDidDelete(() => {
      delete this._entries[entry.getLocalPath()];
      renameSubscription.dispose();
      deleteSubscription.dispose();
    });
  }

  async _initialize(): Promise<RemoteConnection> {
    // Must add first to prevent the ServerConnection from going away
    // in a possible race.
    this._connection.addConnection(this);
    try {
      const FileSystemService = this.getService(FILE_SYSTEM_SERVICE);
      const resolvedPath = await FileSystemService.resolveRealPath(this._cwd);

      // Now that we know the real path, it's possible this collides with an existing connection.
      // If so, we should just stop immediately.
      if (resolvedPath !== this._cwd) {
        const existingConnection =
            RemoteConnection.getByHostnameAndPath(this.getRemoteHostname(), resolvedPath);
        invariant(this !== existingConnection);
        if (existingConnection != null) {
          this.close();
          return existingConnection;
        }

        this._cwd = resolvedPath;
      }

      // A workaround before Atom 2.0: see ::getHgRepoInfo.
      await this._setHgRepoInfo();

      _emitter.emit('did-add', this);
      this._watchRootProjectDirectory();
    } catch (e) {
      this.close();
      throw e;
    }
    return this;
  }

  _watchRootProjectDirectory(): void {
    const rootDirectoryUri = this.getUriForInitialWorkingDirectory();
    const rootDirectotyPath = this.getPathForInitialWorkingDirectory();
    const FileWatcherService: FileWatcherServiceType = this.getService(FILE_WATCHER_SERVICE);
    invariant(FileWatcherService);
    const {watchDirectoryRecursive} = FileWatcherService;
    // Start watching the project for changes and initialize the root watcher
    // for next calls to `watchFile` and `watchDirectory`.
    const watchStream = watchDirectoryRecursive(rootDirectoryUri);
    const subscription = watchStream.subscribe(watchUpdate => {
      // Nothing needs to be done if the root directory was watched correctly.
      // Let's just console log it anyway.
      logger.info(`Watcher Features Initialized for project: ${rootDirectoryUri}`, watchUpdate);
    }, async error => {
      let warningMessageToUser = `You just connected to a remote project ` +
        `\`${rootDirectotyPath}\` but we recommend you remove this directory now ` +
        `because crucial features like synced remote file editing, file search, ` +
        `and Mercurial-related updates will not work.<br/>`;

      const loggedErrorMessage = error.message || error;
      logger.error(
        `Watcher failed to start - watcher features disabled! Error: ${loggedErrorMessage}`
      );

      const FileSystemService = this.getService(FILE_SYSTEM_SERVICE);
      if (await FileSystemService.isNfs(rootDirectotyPath)) {
        warningMessageToUser +=
          `This project directory: \`${rootDirectotyPath}\` is on <b>\`NFS\`</b> filesystem. ` +
          `Nuclide works best with local (non-NFS) root directory.` +
          `e.g. \`/data/users/$USER\``;
      } else {
        warningMessageToUser +=
          `<b><a href='https://facebook.github.io/watchman/'>Watchman</a> Error:</b>` +
          loggedErrorMessage;
      }
      // Add a persistent warning message to make sure the user sees it before dismissing.
      atom.notifications.addWarning(warningMessageToUser, {dismissable: true});
    }, () => {
      // Nothing needs to be done if the root directory watch has ended.
      logger.info(`Watcher Features Ended for project: ${rootDirectoryUri}`);
    });
    this._subscriptions.add(subscription);
  }

  close(): void {
    this._connection.removeConnection(this);
    _emitter.emit('did-close', this);
  }

  getConnection(): ServerConnection {
    return this._connection;
  }

  getRemoteHost(): string {
    return this._connection.getRemoteHost();
  }

  getPort(): number {
    return this._connection.getPort();
  }

  getRemoteHostname(): string {
    return this._connection.getRemoteHostname();
  }

  getUriForInitialWorkingDirectory(): string {
    return this.getUriOfRemotePath(this.getPathForInitialWorkingDirectory());
  }

  getPathForInitialWorkingDirectory(): string {
    return this._cwd;
  }

  getConfig(): RemoteConnectionConfiguration {
    return {...this._connection.getConfig(), cwd: this._cwd};
  }

  static onDidAddRemoteConnection(handler: (connection: RemoteConnection) => void): Disposable {
    _emitter.on('did-add', handler);
    return new Disposable(() => {
      _emitter.removeListener('did-add', handler);
    });
  }

  static onDidCloseRemoteConnection(handler: (connection: RemoteConnection) => void): Disposable {
    _emitter.on('did-close', handler);
    return new Disposable(() => {
      _emitter.removeListener('did-close', handler);
    });
  }

  static getForUri(uri: NuclideUri): ?RemoteConnection {
    const {hostname, path} = remoteUri.parse(uri);
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
  static getByHostnameAndPath(hostname: string, path: string): ?RemoteConnection {
    return RemoteConnection.getByHostname(hostname).filter(connection => {
      return path.startsWith(connection.getPathForInitialWorkingDirectory());
    })[0];
  }

  static getByHostname(hostname: string): Array<RemoteConnection> {
    const server = ServerConnection.getByHostname(hostname);
    return server == null ? [] : server.getConnections();
  }

  getService(serviceName: string): any {
    return this._connection.getService(serviceName);
  }
}
