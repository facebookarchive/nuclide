'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnection} from './RemoteConnection';
import type RemoteDirectory from './RemoteDirectory';
import type {FileSystemService} from '../../server/lib/services/FileSystemServiceType';

import invariant from 'assert';
import pathUtil from 'path';
import crypto from 'crypto';
import {Disposable, Emitter} from 'atom';
import remoteUri from '../../remote-uri';
import {getLogger} from '../../logging';

const logger = getLogger();

/* Mostly implements https://atom.io/docs/api/latest/File */
class RemoteFile {

  _cachedContents: ?string;
  _deleted: boolean;
  _emitter: Emitter;
  _encoding: ?string;
  _localPath: string;
  _path: string;
  _realpath: ?string;
  _remote: RemoteConnection;
  _subscriptionCount: number;
  _watchSubscription: ?atom$IDisposable;
  _digest: ?string;

  constructor(remote: RemoteConnection, remotePath: string) {
    this._remote = remote;
    const {path: localPath} = remoteUri.parse(remotePath);
    this._localPath = localPath;
    this._path = remotePath;
    this._emitter = new Emitter();
    this._subscriptionCount = 0;
    this._cachedContents = null;
    this._deleted = false;
  }

  onDidChange(callback: () => mixed): atom$IDisposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-change', callback));
  }

  onDidRename(callback: () => mixed): atom$IDisposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-rename', callback));
  }

  onDidDelete(callback: () => mixed): atom$IDisposable {
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
    const {watchFile} = this._getService('FileWatcherService');
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
    const oldContents = this._cachedContents;
    try {
      const newContents = await this.read(/*flushCache*/ true);
      if (oldContents !== newContents) {
        this._emitter.emit('did-change');
      }
    } catch (error) {
      // We can't read the file, so we cancel the watcher subscription.
      this._unsubscribeFromNativeChangeEvents();
      let handled = false;
      const handle = () => {
        handled = true;
      };
      error.eventType = 'change';
      this._emitter.emit('will-throw-watch-error', {error, handle});
      if (!handled) {
        const newError = new Error(`Cannot read file after file change event: ${this._path}`);
        // $FlowFixMe non-existing property.
        newError.originalError = error;
        // $FlowFixMe non-existing property.
        newError.code = 'ENOENT';
        throw newError;
      }
    }
  }

  _handleNativeRenameEvent(newPath: string): void {
    this._unsubscribeFromNativeChangeEvents();
    this._cachedContents = null;
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
    this._cachedContents = null;
    if (!this._deleted) {
      this._deleted = true;
      this._emitter.emit('did-delete');
    }
  }

  /*
   * Return a new Disposable that upon dispose, will remove the bound watch subscription.
   * When the number of subscriptions reach 0, the file is unwatched.
   */
  _trackUnsubscription(subscription: atom$IDisposable): atom$IDisposable {
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
      this._watchSubscription.dispose();
      this._watchSubscription = null;
    }
  }

  onWillThrowWatchError(
    callback: (watchError: {error: Error, handle: () => void}) => mixed,
  ): atom$IDisposable {
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
    return pathUtil.basename(this._path);
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
    // TODO: return cachedContents if exists and !flushCache
    // This involves the reload scenario, where the same instance of the file is read(),
    // but the file contents should reload.
    const data = await this._getFileSystemService().readFile(this._localPath);
    const contents = data.toString();
    this._setDigest(contents);
    this._cachedContents = contents;
    // TODO: respect encoding
    return contents;
  }

  readSync(flushcache: boolean): Promise<string> {
    throw new Error('readSync is not supported in RemoteFile');
  }

  async write(text: string): Promise<void> {
    const previouslyExisted = await this.exists();
    await this._getFileSystemService().writeFile(this._localPath, text);
    this._cachedContents = text;
    if (!previouslyExisted && this._subscriptionCount > 0) {
      this._subscribeToNativeChangeEvents();
    }
  }

  getParent(): RemoteDirectory {
    const {path: localPath, protocol, host} = remoteUri.parse(this._path);
    invariant(protocol);
    invariant(host);
    const directoryPath = protocol + '//' + host + pathUtil.dirname(localPath);
    return this._remote.createDirectory(directoryPath);
  }

  _getFileSystemService(): FileSystemService {
    return this._getService('FileSystemService');
  }

  _getService(serviceName: string): any {
    return this._remote.getService(serviceName);
  }
}

module.exports = RemoteFile;
