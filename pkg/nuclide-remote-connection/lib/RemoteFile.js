'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ServerConnection} from './ServerConnection';
import type {RemoteDirectory} from './RemoteDirectory';
import type {FileSystemService} from '../../nuclide-server/lib/services/FileSystemServiceType';
import typeof * as FileWatcherService from '../../nuclide-filewatcher-base';

import invariant from 'assert';
import path from 'path';
import crypto from 'crypto';
import {Disposable, Emitter} from 'atom';
import remoteUri from '../../nuclide-remote-uri';
import {getLogger} from '../../nuclide-logging';

const logger = getLogger();

/* Mostly implements https://atom.io/docs/api/latest/File */
export class RemoteFile {

  _deleted: boolean;
  _emitter: Emitter;
  _encoding: ?string;
  _localPath: string;
  _path: string;
  _realpath: ?string;
  _server: ServerConnection;
  _subscriptionCount: number;
  _watchSubscription: ?rx$ISubscription;
  _digest: ?string;
  _symlink: boolean;

  constructor(
    server: ServerConnection,
    remotePath: string,
    symlink: boolean = false,
  ) {
    this._server = server;
    const {path: localPath} = remoteUri.parse(remotePath);
    this._localPath = localPath;
    this._path = remotePath;
    this._emitter = new Emitter();
    this._subscriptionCount = 0;
    this._deleted = false;
    this._symlink = symlink;
  }

  onDidChange(callback: () => mixed): IDisposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-change', callback));
  }

  onDidRename(callback: () => mixed): IDisposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-rename', callback));
  }

  onDidDelete(callback: () => mixed): IDisposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-delete', callback));
  }

  _willAddSubscription(): void {
    this._subscriptionCount++;
    return this._subscribeToNativeChangeEvents();
  }

  _subscribeToNativeChangeEvents(): void {
    if (this._watchSubscription) {
      return;
    }
    const {watchFile} = (this._getService('FileWatcherService'): FileWatcherService);
    const watchStream = watchFile(this._path);
    this._watchSubscription = watchStream.subscribe(watchUpdate => {
      logger.debug('watchFile update:', watchUpdate);
      switch (watchUpdate.type) {
        case 'change':
          return this._handleNativeChangeEvent();
        case 'delete':
          return this._handleNativeDeleteEvent();
        case 'rename':
          return this._handleNativeRenameEvent(watchUpdate.path);
      }
    }, error => {
      logger.error('Failed to subscribe RemoteFile:', this._path, error);
    }, () => {
      // Nothing needs to be done if the root directory watch has ended.
      logger.debug(`watchFile ended: ${this._path}`);
    });
  }

  async _handleNativeChangeEvent(): Promise {
    // Don't bother checking the file - this can be very expensive.
    this._emitter.emit('did-change');
  }

  _handleNativeRenameEvent(newPath: string): void {
    this._unsubscribeFromNativeChangeEvents();
    const {protocol, host} = remoteUri.parse(this._path);
    this._localPath = newPath;
    invariant(protocol);
    invariant(host);
    this._path = protocol + '//' + host + this._localPath;
    this._subscribeToNativeChangeEvents();
    this._emitter.emit('did-rename');
  }

  _handleNativeDeleteEvent(): void {
    this._unsubscribeFromNativeChangeEvents();
    if (!this._deleted) {
      this._deleted = true;
      this._emitter.emit('did-delete');
    }
  }

  /*
   * Return a new Disposable that upon dispose, will remove the bound watch subscription.
   * When the number of subscriptions reach 0, the file is unwatched.
   */
  _trackUnsubscription(subscription: IDisposable): IDisposable {
    return new Disposable(() => {
      subscription.dispose();
      this._didRemoveSubscription();
    });
  }

  _didRemoveSubscription(): void {
    this._subscriptionCount--;
    if (this._subscriptionCount === 0) {
      this._unsubscribeFromNativeChangeEvents();
    }
  }

  _unsubscribeFromNativeChangeEvents(): void {
    if (this._watchSubscription) {
      this._watchSubscription.unsubscribe();
      this._watchSubscription = null;
    }
  }

  onWillThrowWatchError(
    callback: (watchError: {error: Error; handle: () => void}) => mixed,
  ): IDisposable {
    return this._emitter.on('will-throw-watch-error', callback);
  }

  isFile(): boolean {
    return true;
  }

  isDirectory(): boolean {
    return false;
  }

  exists(): Promise<boolean> {
    return this._getFileSystemService().exists(this._localPath);
  }

  existsSync(): boolean {
    return true;
  }

  getDigestSync(): string {
    if (this._digest) {
      return this._digest;
    } else {
      throw new Error('getDigestSync is not supported in RemoteFile');
    }
  }

  async getDigest(): Promise<string> {
    if (this._digest) {
      return this._digest;
    }
    await this.read();
    invariant(this._digest);
    return this._digest;
  }

  _setDigest(contents: string) {
    const hash = crypto.createHash('sha1').update(contents || '');
    invariant(hash);
    this._digest = hash.digest('hex');
  }

  setEncoding(encoding: string) {
    this._encoding = encoding;
  }

  getEncoding(): ?string {
    return this._encoding;
  }

  getPath(): string {
    return this._path;
  }

  getLocalPath(): string {
    return this._localPath;
  }

  getRealPathSync(): string {
    return this._realpath || this._path;
  }

  async getRealPath(): Promise<string> {
    if (this._realpath == null) {
      this._realpath = await this._getFileSystemService().realpath(this._localPath);
    }
    invariant(this._realpath);
    return this._realpath;
  }

  getBaseName(): string {
    return path.basename(this._path);
  }

  async create(): Promise<boolean> {
    const wasCreated = await this._getFileSystemService().newFile(this._localPath);
    if (this._subscriptionCount > 0) {
      this._subscribeToNativeChangeEvents();
    }
    return wasCreated;
  }

  async delete(): Promise {
    try {
      await this._getFileSystemService().unlink(this._localPath);
      this._handleNativeDeleteEvent();
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async rename(newPath: string): Promise {
    await this._getFileSystemService().rename(this._localPath, newPath);
    this._handleNativeRenameEvent(newPath);
  }

  async copy(newPath: string): Promise<boolean> {
    const wasCopied = await this._getFileSystemService().copy(this._localPath, newPath);
    this._subscribeToNativeChangeEvents();
    return wasCopied;
  }

  async read(flushCache?: boolean): Promise<string> {
    const data = await this._getFileSystemService().readFile(this._localPath);
    const contents = data.toString();
    this._setDigest(contents);
    // TODO: respect encoding
    return contents;
  }

  readSync(flushcache: boolean): Promise<string> {
    throw new Error('readSync is not supported in RemoteFile');
  }

  async write(text: string): Promise<void> {
    const previouslyExisted = await this.exists();
    await this._getFileSystemService().writeFile(this._localPath, text);
    if (!previouslyExisted && this._subscriptionCount > 0) {
      this._subscribeToNativeChangeEvents();
    }
  }

  getParent(): RemoteDirectory {
    const {path: localPath, protocol, host} = remoteUri.parse(this._path);
    invariant(protocol);
    invariant(host);
    const directoryPath = protocol + '//' + host + path.dirname(localPath);
    const remoteConnection = this._server.getRemoteConnectionForUri(this._path);
    const hgRepositoryDescription = remoteConnection != null ?
      remoteConnection.getHgRepositoryDescription() :
      null;
    return this._server.createDirectory(directoryPath, hgRepositoryDescription);
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
