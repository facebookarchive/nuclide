'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileSystemService} from '../../nuclide-server/lib/services/FileSystemServiceType';
import type {ServerConnection} from './ServerConnection';
import type {HgRepositoryDescription} from '../../nuclide-source-control-helpers';
import type {RemoteFile} from './RemoteFile';

import typeof * as FileWatcherService from '../../nuclide-filewatcher-base';

import invariant from 'assert';
import path from 'path';
import {Disposable, Emitter} from 'atom';
import {getLogger} from '../../nuclide-logging';
import remoteUri from '../../nuclide-remote-uri';

const posixPath = path.posix;

const logger = getLogger();

const MARKER_PROPERTY_FOR_REMOTE_DIRECTORY = '__nuclide_remote_directory__';

/* Mostly implements https://atom.io/docs/api/latest/Directory */
export class RemoteDirectory {
  static isRemoteDirectory(directory: atom$Directory | RemoteDirectory): boolean {
    /* $FlowFixMe */
    return directory[MARKER_PROPERTY_FOR_REMOTE_DIRECTORY] === true;
  }

  _watchSubscription: ?rx$ISubscription;
  _server: ServerConnection;
  _uri: string;
  _emitter: atom$Emitter;
  _subscriptionCount: number;
  _host: string;
  _localPath: string;
  _hgRepositoryDescription: ?HgRepositoryDescription;
  _symlink: boolean;

  /**
   * @param uri should be of the form "nuclide://example.com:9090/path/to/directory".
   */
  constructor(
    server: ServerConnection,
    uri: string,
    symlink: boolean = false,
    options: ?any,
  ) {
    Object.defineProperty(this, MARKER_PROPERTY_FOR_REMOTE_DIRECTORY, {value: true});
    this._server = server;
    this._uri = uri;
    this._emitter = new Emitter();
    this._subscriptionCount = 0;
    this._symlink = symlink;
    const {path: directoryPath, protocol, host} = remoteUri.parse(uri);
    invariant(protocol);
    invariant(host);
    /** In the example, this would be "nuclide://example.com:9090". */
    this._host = protocol + '//' + host;
    /** In the example, this would be "/path/to/directory". */
    this._localPath = directoryPath;
    // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
    this._hgRepositoryDescription = options ? options.hgRepositoryDescription : null;
  }

  onDidChange(callback: () => any): IDisposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-change', callback));
  }

  _willAddSubscription(): void {
    this._subscriptionCount++;
    try {
      this._subscribeToNativeChangeEvents();
    } catch (err) {
      logger.error('Failed to subscribe RemoteDirectory:', this._localPath, err);
    }
  }

  _subscribeToNativeChangeEvents(): void {
    if (this._watchSubscription) {
      return;
    }
    const {watchDirectory} = (this._getService('FileWatcherService'): FileWatcherService);
    const watchStream = watchDirectory(this._uri);
    this._watchSubscription = watchStream.subscribe(watchUpdate => {
      logger.debug('watchDirectory update:', watchUpdate);
      if (watchUpdate.type === 'change') {
        return this._handleNativeChangeEvent();
      }
    }, error => {
      logger.error('Failed to subscribe RemoteDirectory:', this._uri, error);
      this._watchSubscription = null;
    }, () => {
      // Nothing needs to be done if the root directory watch has ended.
      logger.debug(`watchDirectory ended: ${this._uri}`);
      this._watchSubscription = null;
    });
  }

  _handleNativeChangeEvent(): void {
    this._emitter.emit('did-change');
  }

  _trackUnsubscription(subscription: IDisposable): IDisposable {
    return new Disposable(() => {
      subscription.dispose();
      this._didRemoveSubscription();
    });
  }

  _didRemoveSubscription(): void {
    this._subscriptionCount--;
    if (this._subscriptionCount === 0) {
      return this._unsubscribeFromNativeChangeEvents();
    }
  }

  _unsubscribeFromNativeChangeEvents(): void {
    if (this._watchSubscription) {
      this._watchSubscription.unsubscribe();
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

  exists(): Promise<boolean> {
    return this._getFileSystemService().exists(this._localPath);
  }

  existsSync(): boolean {
    return false;
  }

  _isRoot(filePath: string): boolean {
    filePath = posixPath.normalize(filePath);
    const parts = posixPath.parse(filePath);
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
    return posixPath.basename(this._localPath);
  }

  relativize(uri: string): string {
    if (!uri) {
      return uri;
    }
    // Note: host of uri must match this._host.
    const subpath = remoteUri.parse(uri).path;
    return posixPath.relative(this._localPath, subpath);
  }

  getParent(): RemoteDirectory {
    if (this.isRoot()) {
      return this;
    } else {
      const uri = this._host + posixPath.normalize(posixPath.join(this._localPath, '..'));
      return this._server.createDirectory(uri, this._hgRepositoryDescription);
    }
  }

  getFile(filename: string): RemoteFile {
    const uri = this._host + posixPath.join(this._localPath, filename);
    return this._server.createFile(uri);
  }

  getSubdirectory(dirname: string): RemoteDirectory {
    const uri = this._host + posixPath.join(this._localPath, dirname);
    return this._server.createDirectory(uri, this._hgRepositoryDescription);
  }

  async create(): Promise<boolean> {
    const created = await this._getFileSystemService().mkdirp(this._localPath);
    if (this._subscriptionCount > 0) {
      this._subscribeToNativeChangeEvents();
    }
    return created;
  }

  async delete(): Promise {
    await this._getFileSystemService().rmdir(this._localPath);
    this._unsubscribeFromNativeChangeEvents();
  }

  /**
   * Renames this directory to the given absolute path.
   */
  async rename(newPath: string): Promise {
    await this._getFileSystemService().rename(this._localPath, newPath);

    // Unsubscribe from the old `this._localPath`. This must be done before
    // setting the new `this._localPath`.
    this._unsubscribeFromNativeChangeEvents();

    const {protocol, host} = remoteUri.parse(this._uri);
    this._localPath = newPath;
    invariant(protocol);
    invariant(host);
    this._uri = protocol + '//' + host + this._localPath;

    // Subscribe to changes for the new `this._localPath`. This must be done
    // after setting the new `this._localPath`.
    if (this._subscriptionCount > 0) {
      this._subscribeToNativeChangeEvents();
    }
  }

  getEntriesSync(): Array<RemoteFile | RemoteDirectory> {
    throw new Error('not implemented');
  }

  /*
   * Calls `callback` with either an Array of entries or an Error if there was a problem fetching
   * those entries.
   *
   * Note: Although this function is `async`, it never rejects. Check whether the `error` argument
   * passed to `callback` is `null` to determine if there was an error.
   */
  async getEntries(
    callback: (error: ?atom$GetEntriesError, entries: ?Array<RemoteDirectory | RemoteFile>) => any,
  ): Promise<void> {
    let entries;
    try {
      entries = await this._getFileSystemService().readdir(this._localPath);
    } catch (e) {
      callback(e, null);
      return;
    }

    const directories : Array<RemoteDirectory> = [];
    const files = [];
    entries.sort((a, b) => {
      return a.file.toLowerCase().localeCompare(b.file.toLowerCase());
    }).forEach(entry => {
      invariant(entry);
      const uri = this._host + posixPath.join(this._localPath, entry.file);
      const symlink = entry.isSymbolicLink;
      if (entry.stats && entry.stats.isFile()) {
        files.push(this._server.createFile(uri, symlink));
      } else {
        directories.push(this._server.createDirectory(uri, this._hgRepositoryDescription, symlink));
      }
    });
    callback(null, directories.concat(files));
  }

  contains(pathToCheck: ?string): boolean {
    // Can't just do startsWith here. If this directory is "www" and you
    // are trying to check "www-base", just using startsWith would return
    // true, even though "www-base" is at the same level as "Www", not
    // contained in it.
    // So first check startsWith. If so, then if the two path lengths are
    // equal OR if the next character in the path to check is a path
    // separator, then we know the checked path is in this path.
    const endIndex = this.getPath().slice(-1) === posixPath.sep
                   ? this.getPath().length - 1
                   : this.getPath().length;
    return pathToCheck != null
      && pathToCheck.startsWith(this.getPath())
      && (pathToCheck.length === this.getPath().length
          || pathToCheck.charAt(endIndex) === posixPath.sep);
  }

  off() {
    // This method is part of the EmitterMixin used by Atom's local Directory, but not documented
    // as part of the API - https://atom.io/docs/api/latest/Directory,
    // However, it appears to be called in project.coffee by Atom.
  }

  // A workaround before Atom 2.0: see ::getHgRepoInfo of main.js.
  getHgRepositoryDescription(): ?HgRepositoryDescription {
    return this._hgRepositoryDescription;
  }

  isSymbolicLink(): boolean {
    return this._symlink;
  }

  _getFileSystemService(): FileSystemService {
    return this._getService('FileSystemService');
  }

  _getService(serviceName: string): any {
    return this._server.getService(serviceName);
  }
}
