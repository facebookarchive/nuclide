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

import type {FsStatResult, FsWatchData} from 'big-dig-vscode-server/Protocol';

import * as pathModule from 'path';
import * as vscode from 'vscode';
import {FileSystemProvider} from 'vscode';
import {logToScribe} from './analytics/analytics';
import {ConnectionWrapper, RpcMethodError} from './ConnectionWrapper';
import {Server} from './remote/Server';
import {getLogger} from 'log4js';
import {createVSCodeFsError} from './util/converter';

const logger = getLogger('remote-fs');

/** Timeout between attempts to reconnect to the server in case of error. */
const CLEAR_ERROR_TIMEOUT_MS = 1000;

export class RemoteFileSystem implements FileSystemProvider {
  // Event triggers when this filesystem is closed/disposed.
  +_onDisposedEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter();
  // Event triggers when remote (watched) files change.
  +_onDidChangeEmitter: vscode.EventEmitter<
    vscode.FileChangeEvent[],
  > = new vscode.EventEmitter();

  +onDidChangeFile = this._onDidChangeEmitter.event;

  // True after `dispose()` has been called.
  _disposed = false;
  _server: Server;

  /**
   * Set if there has been a recent connection error; will be unset automatically after some time
   * has passed. We use this because vscode will queue a sequence of requests (in addition to
   * parallel requests), which would otherwise cause the user to have to sit through a sequence of
   * interactive connection attempts that are likely to fail. By immediately repeating the previous
   * error for a short time, we can quickly dispell vscode's queue of requests.
   */
  _currentError: ?Error = null;
  _resetErrorTimeout: ?TimeoutID = null;
  _baseUri: vscode.Uri;

  /**
   * Creates a filesystem that connects to the remote server.
   */
  constructor(hostname: string, server: Server) {
    this._baseUri = vscode.Uri.parse(`big-dig://${hostname}/`);
    this._server = server;
  }

  /**
   * Close this filesystem and free its resources. Once disposed, a filesystem
   * may not be reused.
   */
  dispose() {
    if (this._disposed) {
      return;
    }

    this._currentError = null;
    if (this._resetErrorTimeout) {
      clearTimeout(this._resetErrorTimeout);
    }
    this._server.disconnect();
    this._onDidChangeEmitter.dispose();
    this._onDisposedEmitter.fire();
    this._onDisposedEmitter.dispose();
    this._disposed = true;
  }

  /** @returns `true` if this filesystem has been disposed. */
  isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Listen for this filesystem being disposed.
   * @returns a disposable that will stop listening.
   */
  onDisposed(listener: () => mixed): IDisposable {
    return this._onDisposedEmitter.event(listener);
  }

  /** Returns the hostname of this filesystem. */
  getHostname(): string {
    return this._baseUri.authority;
  }

  getWorkspaceFolders(): vscode.WorkspaceFolder[] {
    const workspaces = vscode.workspace.workspaceFolders || [];
    return workspaces.filter(workspace => this.handlesResource(workspace.uri));
  }

  getServer(): Server {
    return this._server;
  }

  async getConnection(): Promise<ConnectionWrapper> {
    if (this._currentError != null) {
      throw vscode.FileSystemError.Unavailable(this._currentError.message);
    }

    try {
      return await this._server.connect();
    } catch (error) {
      if (this._currentError == null) {
        this._currentError = error;

        this._resetErrorTimeout = setTimeout(
          () => (this._currentError = null),
          CLEAR_ERROR_TIMEOUT_MS,
        );

        // Show an error for just the first caller.
        vscode.window.showErrorMessage(error.message);
      }
      throw vscode.FileSystemError.Unavailable(error.message);
    }
  }

  uriToLspFileUri(resource: vscode.Uri): string {
    return resource.with({authority: '', scheme: 'file'}).toString();
  }

  uriToPath(resource: vscode.Uri): string {
    return resource.path;
  }

  pathToUri(path: string): vscode.Uri {
    return this._baseUri.with({path});
  }

  handlesResource(uri: vscode.Uri): boolean {
    return (
      uri.scheme === this._baseUri.scheme &&
      uri.authority === this._baseUri.authority
    );
  }

  async _statPath(path: string): Promise<vscode.FileStat> {
    const conn = await this.getConnection();
    const result = await conn.fsStat(path);
    return toStat(result);
  }

  stat(resource: vscode.Uri): Promise<vscode.FileStat> {
    return this._statPath(this.uriToPath(resource)).catch(error =>
      Promise.reject(createVSCodeFsError(error, resource)),
    );
  }

  async exists(resource: vscode.Uri): Promise<boolean> {
    try {
      await this._statPath(this.uriToPath(resource));
      return true;
    } catch (error) {
      if (
        error instanceof RpcMethodError &&
        error.parameters.code === 'ENOENT'
      ) {
        return false;
      } else {
        throw createVSCodeFsError(error);
      }
    }
  }

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    try {
      const path = this.uriToPath(uri);
      logToScribe('vscode.fs.read', {path});

      const conn = await this.getConnection();

      const result = await conn.fsGetFileContents(path);
      return new Uint8Array(Buffer.from(result, 'utf8'));
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

      const conn = await this.getConnection();
      // $FlowIssue Flow types need to be updated; Buffer can accept Uint8Array
      const data = new Buffer(content);
      await conn.fsWrite(this.uriToPath(uri), data, options);
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
      const conn = await this.getConnection();
      const src = this.uriToPath(oldUri);
      const dst = this.uriToPath(newUri);
      await conn.fsMove(src, dst, options);
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
      const conn = await this.getConnection();
      const src = this.uriToPath(source);
      const dst = this.uriToPath(destination);
      await conn.fsCopy(src, dst, options);
    } catch (error) {
      throw createVSCodeFsError(error);
    }
  }

  async createDirectory(uri: vscode.Uri): Promise<void> {
    try {
      const conn = await this.getConnection();
      await conn.fsMkdir(this.uriToPath(uri));
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  async readDirectory(
    uri: vscode.Uri,
  ): Promise<Array<[string, vscode.FileTypeType]>> {
    try {
      const conn = await this.getConnection();
      const path = this.uriToPath(uri);
      const files = await conn.fsReaddir(path);
      return files.map(([file, stat]) => {
        return [file, toFileType(stat)];
      });
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  watch(
    uri: vscode.Uri,
    options: {recursive: boolean, excludes: Array<string>},
  ): vscode.Disposable {
    try {
      const {recursive, excludes: exclude} = options;
      logger.info(`Watching ${uri.toString()} ${JSON.stringify(options)}`);
      const path = this.uriToPath(uri);

      return this._server.onEachConnection(conn => {
        const watchSub = conn
          .fsWatch(path, {recursive, exclude})
          .subscribe(
            changes => this._onFilesChanged(path, changes),
            error => logger.error(error),
          );
        return () => {
          watchSub.unsubscribe();
          logger.info(`Stopped watching: ${uri.toString()}`);
        };
      });
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  async delete(uri: vscode.Uri, options: {recursive: boolean}): Promise<void> {
    try {
      const conn = await this.getConnection();
      const path = this.uriToPath(uri);
      await conn.fsDelete(path, options);
    } catch (error) {
      throw createVSCodeFsError(error, uri);
    }
  }

  /**
   * Coerces the file to a directory.
   * @returns `file` if it is a directory, or its parent if not.
   */
  async toDir(uri: vscode.Uri): Promise<vscode.Uri> {
    const {type} = await this.stat(uri);
    if (type === vscode.FileType.Directory) {
      return uri;
    } else {
      return uri.with({path: pathModule.dirname(uri.path)});
    }
  }

  _onFilesChanged(basePath: string, changes: FsWatchData) {
    const fileChanges: Array<vscode.FileChangeEvent> = changes.map(change => ({
      type: toChangeType(change.type),
      uri: this.pathToUri(pathModule.join(basePath, change.path)),
    }));
    if (fileChanges.length > 0) {
      this._onDidChangeEmitter.fire(fileChanges);
    }
  }
}

function toChangeType(ch: 'a' | 'd' | 'u'): vscode.FileChangeTypeType {
  switch (ch) {
    case 'a':
      return vscode.FileChangeType.Created;
    case 'd':
      return vscode.FileChangeType.Deleted;
    case 'u':
      return vscode.FileChangeType.Changed;
    default:
      logger.warn(`Unknown file change type ${ch}`);
      return vscode.FileChangeType.Changed;
  }
}

function toFileType(stat: FsStatResult): vscode.FileTypeType {
  if (stat.isFile && stat.isDirectory) {
    logger.warn('Encountered a path that is both a file and directory.');
  }

  const flags = [
    stat.isFile ? vscode.FileType.File : 0,
    stat.isDirectory ? vscode.FileType.Directory : 0,
    stat.isSymlink ? vscode.FileType.SymbolicLink : 0,
  ] // eslint-disable-next-line no-bitwise
    .reduce((acc, f) => acc | f, 0);
  return ((flags: any): vscode.FileTypeType);
}

function toStat(stat: FsStatResult): vscode.FileStat {
  const {mtime, ctime, size} = stat;
  return {mtime, ctime, size, type: toFileType(stat)};
}
