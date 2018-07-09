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

import {RemoteFileSystemClient} from 'big-dig/src/services/fs/types';
import * as vscode from 'vscode';
import {Server} from './remote/Server';
import {RemoteFileSystem} from './RemoteFileSystem';
import {
  createVSCodeFsError,
  convertToVSCodeFileStat,
  convertToVSCodeFileChangeEvents,
  convertToVSCodeFileType,
} from './util/converter';
import {getLogger} from 'log4js';
import {logToScribe} from './analytics/analytics';
import filesystem_types from 'big-dig/src/services/fs/gen-nodejs/filesystem_types';

const BUFFER_ENCODING = 'utf-8';
const POLLING_INTERVAL_MS = 3000;

const logger = getLogger('remote-fs');

export class ThriftRemoteFileSystem extends RemoteFileSystem {
  _pollingInterval: any;

  constructor(hostname: string, server: Server) {
    super(hostname, server);
    this._pollingInterval = null;
  }

  async _startWatching(
    uri: vscode.Uri,
    options: {recursive: boolean, excludes: Array<string>},
  ): Promise<void> {
    const path = this.uriToPath(uri);
    const client = await this.getThriftClient();
    await client.watch(path, options);
    // Start polling file change events
    this._pollingInterval = setInterval(async () => {
      const changes = await client.pollFileChanges();
      this._onFilesChanged(path, convertToVSCodeFileChangeEvents(changes));
    }, POLLING_INTERVAL_MS);
  }

  watch(
    uri: vscode.Uri,
    options: {recursive: boolean, excludes: Array<string>},
  ): vscode.Disposable {
    try {
      this._startWatching(uri, options);
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
    // Need to return a vscode.Disposable
    return new vscode.Disposable(() => {
      logger.info(`Stopped watching: ${uri.toString()}`);
      this._disposePollingInterval();
    });
  }

  async getThriftClient(): Promise<RemoteFileSystemClient> {
    const conn = await this.getConnection();
    const client = conn.getOrCreateThriftClient();
    return client;
  }

  async createDirectory(uri: vscode.Uri): Promise<void> {
    try {
      const client = await this.getThriftClient();
      await client.mkdir(this.uriToPath(uri));
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  // This internal method is shared by `stat` and `exists`, can throw raw Thrift
  // error type which enables us to know the real cause of the problem
  async _statPath(path: string): Promise<vscode.FileStat> {
    const client = await this.getThriftClient();
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
      await client.delete(path, options);
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

  _disposePollingInterval(): void {
    if (this._pollingInterval) {
      clearInterval(this._pollingInterval);
      this._pollingInterval = null;
    }
  }

  dispose() {
    super.dispose();
    this._disposePollingInterval();
  }
}
