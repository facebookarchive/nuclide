'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var url = require('url');
var {Disposable, Emitter} = require('atom');
var logger = require('nuclide-logging').getLogger();

var MARKER_PROPERTY_FOR_REMOTE_DIRECTORY = '__nuclide_remote_directory__';

/* Mostly implements https://atom.io/docs/api/latest/Directory */
class RemoteDirectory {
  static isRemoteDirectory(directory: Directory | RemoteDirectory): boolean {
    return directory[MARKER_PROPERTY_FOR_REMOTE_DIRECTORY] === true;
  }

  _watchSubscription: ?FsWatcher;

  /**
   * @param uri should be of the form "nuclide://example.com:9090/path/to/directory".
   */
  constructor(remote: RemoteConnection, uri: string, options: ?any) {
    Object.defineProperty(this, MARKER_PROPERTY_FOR_REMOTE_DIRECTORY, {value: true});
    this._remote = remote;
    this._uri = uri;
    this._emitter = new Emitter();
    this._subscriptionCount = 0;
    var {path: directoryPath, protocol, host} = url.parse(uri);
    /** In the example, this would be "nuclide://example.com:9090". */
    this._host = protocol + '//' + host;
    /** In the example, this would be "/path/to/directory". */
    this._localPath = directoryPath;
    // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
    this._hgRepositoryDescription = options ? options.hgRepositoryDescription : null;
  }

  onDidChange(callback): Disposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-change', callback));
  }

  async _willAddSubscription(): Promise {
    this._subscriptionCount++;
    if (this._pendingSubscription) {
      return;
    }
    this._pendingSubscription = true;
    try {
      await this._subscribeToNativeChangeEvents();
    } catch (err) {
      logger.error('Failed to subscribe RemoteDirectory:', this._localPath, err);
    } finally {
      this._pendingSubscription = false;
    }
  }

  async _subscribeToNativeChangeEvents(): Promise {
    if (this._watchSubscription) {
      return;
    }
    this._watchSubscription = await this._remote.getClient().watchDirectory(this._localPath);
    this._watchSubscription.on('change', (change) => this._handleNativeChangeEvent(change));
  }

  _handleNativeChangeEvent(changes: Array<FileChange>) {
    this._emitter.emit('did-change', changes);
  }

  _trackUnsubscription(subscription): Disposable {
    return new Disposable(() => {
      subscription.dispose();
      this._didRemoveSubscription();
    });
  }

  _didRemoveSubscription(): Promise {
    this._subscriptionCount--;
    if (this._subscriptionCount === 0) {
      return this._unsubscribeFromNativeChangeEvents();
    }
  }

  async _unsubscribeFromNativeChangeEvents(): Promise {
    if (this._watchSubscription) {
      await this._remote.getClient().unwatchDirectory(this._localPath);
      this._watchSubscription = null;
    }
  }

  isFile(): boolean {
    return false;
  }

  isDirectory(): boolean {
    return true;
  }

  isRoot(): boolean {
    return this._isRoot(this._localPath);
  }

  _isRoot(filePath) {
    filePath = path.normalize(filePath);
    var parts = path.parse(filePath);
    return parts.root === filePath;
  }

  getPath(): string {
    return this._uri;
  }

  getLocalPath(): string {
    return this._localPath;
  }

  getHost(): string {
    return this._host;
  }

  getRealPathSync(): string {
    throw new Error('Not implemented');
  }

  getBaseName(): string {
    return path.basename(this._localPath);
  }

  relativize(uri: string): string {
    if (!uri) {
      return uri;
    }
    // Note: host of uri must match this._host.
    var subpath = url.parse(uri).path;
    return path.relative(this._localPath, subpath);
  }

  getParent(): RemoteDirectory {
    if (this.isRoot()) {
      return this;
    } else {
      var uri = this._host + path.normalize(path.join(this._localPath, '..'));
      return this._remote.createDirectory(uri);
    }
  }

  getFile(filename: string): RemoteFile {
    var uri = this._host + path.join(this._localPath, filename);
    return this._remote.createFile(uri);
  }

  getSubdirectory(dirname: string): string {
    var uri = this._host + path.join(this._localPath, dirname);
    return this._remote.createDirectory(uri);
  }

  async create(): Promise<boolean> {
    await this._remote.getClient().mkdirp(this._localPath);
    if (this._subscriptionCount > 0) {
      this._subscribeToNativeChangeEvents();
    }
  }

  async delete(): Promise {
    await this._remote.getClient().rmdir(this._localPath);
    this._unsubscribeFromNativeChangeEvents();
  }

  /**
   * Renames this directory to the given absolute path.
   */
  async rename(newPath: string): Promise {
    await this._remote.getClient().rename(this._localPath, newPath);

    // Unsubscribe from the old `this._localPath`. This must be done before
    // setting the new `this._localPath`.
    await this._unsubscribeFromNativeChangeEvents();

    var {protocol, host} = url.parse(this._uri);
    this._localPath = newPath;
    this._uri = protocol + '//' + host + this._localPath;

    // Subscribe to changes for the new `this._localPath`. This must be done
    // after setting the new `this._localPath`.
    if (this._subscriptionCount > 0) {
      await this._subscribeToNativeChangeEvents();
    }
  }

  getEntriesSync() {
    throw new Error('not implemented');
  }

  async getEntries(callback) {
    var entries = await this._remote.getClient().readdir(this._localPath);
    var directories = [];
    var files = [];
    entries.sort((a, b) => {
      return a.file.toLowerCase().localeCompare(b.file.toLowerCase());
    }).forEach((entry) => {
      var uri = this._host + path.join(this._localPath, entry.file);
      if (entry.stats.isFile()) {
        files.push(this._remote.createFile(uri));
      } else {
        directories.push(this._remote.createDirectory(uri));
      }
    });
    callback(null, directories.concat(files));
  }

  contains(pathToCheck: ?string): boolean {
    // Ideally, the type of pathToCheck would be `string` rather than `?string`;
    // however, as shown by https://github.com/atom/git-diff/pull/53,
    // `editor.getPath()` unexpectedly returns `?string` rather than `string`,
    // and its return value is often used with this method, so it is important
    // to tolerate null as an input.
    if (pathToCheck) {
      return pathToCheck.startsWith(this.getPath());
    } else {
      return false;
    }
  }

  off() {
    // This method is part of the EmitterMixin used by Atom's local Directory, but not documented
    // as part of the API - https://atom.io/docs/api/latest/Directory,
    // However, it appears to be called in project.coffee by Atom.
  }

  // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
  getHgRepositoryDescription() {
    return this._hgRepositoryDescription;
  }
}

module.exports = RemoteDirectory;
