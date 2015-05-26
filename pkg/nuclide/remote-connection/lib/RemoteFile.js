'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var pathUtil = require('path');
var crypto = require('crypto');
var {Disposable, Emitter} = require('atom');
var url = require('url');
var logger = require('nuclide-logging').getLogger();

/* Mostly implements https://atom.io/docs/api/latest/File */
class RemoteFile {

  _realpath: ?string;
  _watchSubscription: ?FsWatcher;

  constructor(remote: RemoteConnection, remotePath: string) {
    this._remote = remote;
    var {path: localPath} = url.parse(remotePath);
    this._localPath = localPath;
    this._path = remotePath;
    this._emitter = new Emitter();
    this._subscriptionCount = 0;
    this._cachedContents = null;
    this._deleted = false;
  }

  onDidChange(callback): Disposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-change', callback));
  }

  onDidRename(callback): Disposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-rename', callback));
  }

  onDidDelete(callback): Disposable {
    this._willAddSubscription();
    return this._trackUnsubscription(this._emitter.on('did-delete', callback));
  }

  _willAddSubscription(): Promise {
    this._subscriptionCount++;
    return this._subscribeToNativeChangeEvents();
  }

  async _subscribeToNativeChangeEvents(): Promise {
    if (this._watchSubscription) {
      return;
    }
    if (this._pendingSubscription) {
      return;
    }
    this._pendingSubscription = true;
    try {
      this._watchSubscription = await this._remote.getClient().watchFile(this._localPath);
    } catch (err) {
      logger.error('Failed to subscribe RemoteFile:', this._path, err);
    } finally {
      this._pendingSubscription = false;
    }
    if (this._watchSubscription) {
      this._watchSubscription.on('change', () => this._handleNativeChangeEvent());
      this._watchSubscription.on('rename', () => this._handleNativeRenameEvent());
      this._watchSubscription.on('delete', () => this._handleNativeDeleteEvent());
    }
  }

  async _handleNativeChangeEvent(): Promise {
    var oldContents = this._cachedContents;
    try {
      var newContents = await this.read(/*flushCache*/ true);
      if (oldContents !== newContents) {
        this._emitter.emit('did-change');
      }
    } catch (error) {
      // We can't read the file, so we cancel the watcher subscription.
      await this._unsubscribeFromNativeChangeEvents();
      var handled = false;
      var handle = () => {
        handled = true;
      };
      error.eventType = 'change';
      this._emitter.emit('will-throw-watch-error', {error, handle});
      if (!handled) {
        var newError = new Error(`Cannot read file after file change event: ${this._path}`);
        newError.originalError = error;
        newError.code = 'ENOENT';
        throw newError;
      }
    }
  }

  async _handleNativeRenameEvent(newPath: string): Promise {
    await this._unsubscribeFromNativeChangeEvents();
    this._cachedContents = null;
    var {protocol, host} = url.parse(this._path);
    this._localPath = newPath;
    this._path = protocol + '//' + host + this._localPath;
    await this._subscribeToNativeChangeEvents();
    this._emitter.emit('did-rename');
  }

  async _handleNativeDeleteEvent(): Promise {
    await this._unsubscribeFromNativeChangeEvents();
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
  _trackUnsubscription(subscription: Disposable): Disposable {
    return new Disposable(() => {
      subscription.dispose();
      this._didRemoveSubscription();
    });
  }

  async _didRemoveSubscription(): Promise {
    this._subscriptionCount--;
    if (this._subscriptionCount === 0) {
      await this._unsubscribeFromNativeChangeEvents();
    }
  }

  async _unsubscribeFromNativeChangeEvents(): Promise {
    if (this._watchSubscription) {
      await this._remote.getClient().unwatchFile(this._localPath);
      this._watchSubscription = null;
    }
  }

  onWillThrowWatchError(callback): Disposable {
    return this._emitter.on('will-throw-watch-error', callback);
  }

  isFile(): boolean {
    return true;
  }

  isDirectory(): boolean {
    return false;
  }

  exists(): Promise<boolean> {
    return this._remote.getClient().exists(this._localPath);
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
    return this._digest;
  }

  _setDigest(contents: string) {
    this._digest = crypto.createHash('sha1').update(contents || '').digest('hex');
  }

  setEncoding(encoding: string) {
    this._encoding = encoding;
  }

  getEncoding(): string {
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
    if (!this._realpath) {
      this._realpath = await this._remote.getClient().realpath(this._localPath);
    }
    return this._realpath;
  }

  getBaseName(): string {
    return pathUtil.basename(this._path);
  }

  async create(): Promise {
    await this._remote.getClient().newFile(this._localPath);
    if (this._subscriptionCount > 0) {
      this._subscribeToNativeChangeEvents();
    }
  }

  async delete(): Promise {
    try {
      await this._remote.getClient().unlink(this._localPath);
      this._handleNativeDeleteEvent();
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async rename(newPath: string): Promise {
    await this._remote.getClient().rename(this._localPath, newPath);
    await this._handleNativeRenameEvent(newPath);
  }

  async read(flushCache: boolean): Promise<string> {
    // TODO: return cachedContents if exists and !flushCache
    // This involves the reload scenario, where the same instance of the file is read(),
    // but the file contents should reload.
    var data = await this._remote.getClient().readFile(this._localPath);
    var contents = data.toString();
    this._setDigest(contents);
    this._cachedContents = contents;
    // TODO: respect encoding
    return contents;
  }

  readSync(flushcache: boolean): Promise<string> {
    throw new Error('readSync is not supported in RemoteFile');
  }

  async write(text: string): Promise {
    var previouslyExisted = await this.exists();
    await this._remote.getClient().writeFile(this._localPath, text);
    this._cachedContents = text;
    if (!previouslyExisted && this._subscriptionCount > 0) {
      await this._subscribeToNativeChangeEvents();
    }
  }

  getParent(): RemoteDirectory {
    var {path: localPath, protocol, host} = url.parse(this._path);
    var directoryPath = protocol + '//' + host + pathUtil.dirname(localPath);
    return this._remote.createDirectory(directoryPath);
  }
}

module.exports = RemoteFile;
