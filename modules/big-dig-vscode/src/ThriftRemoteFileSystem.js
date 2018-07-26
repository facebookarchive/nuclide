/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {ThriftClient} from 'big-dig/src/services/thrift/types';

import * as vscode from 'vscode';
import * as pathModule from 'path';
import {Server} from './remote/Server';
import {RemoteFileSystem} from './RemoteFileSystem';
import {
  toChangeType,
  createVSCodeFsError,
  convertToVSCodeFileStat,
  convertToVSCodeFileType,
  convertToVSCodeFileChangeEvents,
} from './util/converter';
import {logToScribe} from './analytics/analytics';
import filesystem_types from 'big-dig/src/services/fs/gen-nodejs/filesystem_types';
import {RemoteFileSystemClient} from 'big-dig/src/services/fs/types';
import {FileWatch} from 'big-dig/src/services/fs/FileWatch';

type WatchOptions = {recursive: boolean, excludes: Array<string>};

const BUFFER_ENCODING = 'utf-8';

export class ThriftRemoteFileSystem extends RemoteFileSystem {
  _idxToFileWatches: Map<number, FileWatch>;
  _fileWatchIndex: number;
  _clientWrapper: ?ThriftClient;
  _watchRequests: Set<{
    watch: FileWatch,
    watchPath: string,
    watchOptions: WatchOptions,
  }>;

  constructor(hostname: string, server: Server) {
    super(hostname, server);
    this._idxToFileWatches = new Map();
    this._clientWrapper = null;
    this._watchRequests = new Set();
  }

  watch(uri: vscode.Uri, options: WatchOptions): vscode.Disposable {
    const watchRequest = {
      watch: new FileWatch(
        () => this.getThriftClientWrapper(),
        this.uriToPath(uri),
        options,
        this._handleFileChanges.bind(this),
      ),
      watchPath: this.uriToPath(uri),
      watchOptions: options,
    };
    this._watchRequests.add(watchRequest);
    return new vscode.Disposable(() => watchRequest.watch.dispose());
  }

  _handleFileChanges(
    basePath: string,
    thriftFileChanges: Array<filesystem_types.FileChangeEvent>,
  ) {
    const changes = convertToVSCodeFileChangeEvents(thriftFileChanges);
    const fileChanges: Array<vscode.FileChangeEvent> = changes.map(change => ({
      type: toChangeType(change.type),
      uri: this.pathToUri(pathModule.join(basePath, change.path)),
    }));
    if (fileChanges.length > 0) {
      this._onDidChangeEmitter.fire(fileChanges);
    }
  }

  _updateFileWatches(): void {
    this._watchRequests.forEach(watchRequest => {
      watchRequest.watch.dispose();
      watchRequest.watch = new FileWatch(
        () => this.getThriftClientWrapper(),
        watchRequest.watchPath,
        watchRequest.watchOptions,
        this._handleFileChanges.bind(this),
      );
    });
  }

  async getThriftClientWrapper(): Promise<ThriftClient> {
    const conn = await this.getConnection();
    const clientWrapper = await conn.getOrCreateThriftClient();
    if (this._clientWrapper == null) {
      this._clientWrapper = clientWrapper;
    } else if (clientWrapper !== this._clientWrapper) {
      this._clientWrapper = clientWrapper;
      this._updateFileWatches();
    }
    return clientWrapper;
  }

  async getThriftClient(): Promise<RemoteFileSystemClient> {
    const clientWrapper = await this.getThriftClientWrapper();
    return clientWrapper.getClient();
  }

  async createDirectory(uri: vscode.Uri): Promise<void> {
    try {
      const client = await this.getThriftClient();
      await client.createDirectory(this.uriToPath(uri));
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  // This internal method is shared by `stat` and `exists`, can throw raw Thrift
  // error type which enables us to know the real cause of the problem
  async _statPath(path: string): Promise<vscode.FileStat> {
    const client = await this.getThriftClient();
    // VSCode FileSystemProvider `stat` default: follow symlink
    const thriftStat = await client.stat(path);
    return convertToVSCodeFileStat(thriftStat);
  }

  async stat(resource: vscode.Uri): Promise<vscode.FileStat> {
    return this._statPath(this.uriToPath(resource)).catch(error =>
      Promise.reject(createVSCodeFsError(error, resource)),
    );
  }

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    try {
      const path = this.uriToPath(uri);
      logToScribe('vscode.fs.read', {path});

      const client = await this.getThriftClient();
      const buffer = await client.readFile(path);
      return new Uint8Array(buffer);
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: {create: boolean, overwrite: boolean},
  ): Promise<void> {
    try {
      logToScribe('vscode.fs.write', {
        path: uri.path,
      });

      const client = await this.getThriftClient();
      // $FlowIssue Flow types need to be updated; Buffer can accept Uint8Array
      const data = new Buffer(content, BUFFER_ENCODING);
      await client.writeFile(this.uriToPath(uri), data, options);
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  async rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: {overwrite: boolean},
  ): Promise<void> {
    try {
      const src = this.uriToPath(oldUri);
      const dst = this.uriToPath(newUri);
      const client = await this.getThriftClient();
      await client.rename(src, dst, options);
    } catch (error) {
      throw createVSCodeFsError(error);
    }
  }

  async copy(
    source: vscode.Uri,
    destination: vscode.Uri,
    options: {overwrite: boolean},
  ): Promise<void> {
    try {
      const src = this.uriToPath(source);
      const dst = this.uriToPath(destination);
      const client = await this.getThriftClient();
      await client.copy(src, dst, options);
    } catch (error) {
      throw createVSCodeFsError(error);
    }
  }

  async delete(uri: vscode.Uri, options: {recursive: boolean}): Promise<void> {
    try {
      const client = await this.getThriftClient();
      const path = this.uriToPath(uri);
      await client.deletePath(path, options);
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  async readDirectory(
    uri: vscode.Uri,
  ): Promise<Array<[string, vscode.FileTypeType]>> {
    try {
      const path = this.uriToPath(uri);
      const client = await this.getThriftClient();
      const fileEntries = await client.readDirectory(path);
      return fileEntries.map(entry => {
        return [entry.fname, convertToVSCodeFileType(entry)];
      });
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  async exists(resource: vscode.Uri): Promise<boolean> {
    try {
      await this._statPath(this.uriToPath(resource));
      return true;
    } catch (error) {
      if (error.code === filesystem_types.ErrorCode.ENOENT) {
        return false;
      } else {
        throw createVSCodeFsError(error);
      }
    }
  }

  dispose() {
    super.dispose();
    this._idxToFileWatches.clear();
  }
}
