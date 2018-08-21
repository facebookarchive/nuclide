/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {RemoteFileSystem} from './RemoteFileSystem';

import * as vscode from 'vscode';
import type {FileSystemProvider} from 'vscode';

export class FileSystemMultiplexer implements FileSystemProvider {
  +_onDidChangeEmitter: vscode.EventEmitter<
    vscode.FileChangeEvent[],
  > = new vscode.EventEmitter();

  +onDidChangeFile = this._onDidChangeEmitter.event;

  // Maps hostnames to file systems.
  _filesystems: Map<string, RemoteFileSystem> = new Map();

  _fsRegistration: ?IDisposable = null;

  constructor() {}

  /**
   * Unregisters this (multiplexing) filesystem from vscode and clears the
   * filesystems this multiplexes over. Use the returned disposable from
   * `addFileSystem` to remove an individual filesystem. *This does not dispose
   * of the filesystems themselves*; use their respective `dispose()` methods
   * for that.
   */
  dispose() {
    this._filesystems.clear();
    this._onDidChangeEmitter.dispose();
    if (this._fsRegistration != null) {
      this._fsRegistration.dispose();
      this._fsRegistration = null;
    }
  }

  /**
   * Registers this FileSystemProvider with vscode.
   */
  register(): void {
    if (this._fsRegistration != null) {
      throw new Error('Cannot register this filesystem more than once');
    }

    this._fsRegistration = vscode.workspace.registerFileSystemProvider(
      'big-dig',
      this,
      {
        // TODO(T28798298): automatically determine if case sensitive.
        isCaseSensitive: true,
      },
    );
  }

  /**
   * Adds the given filesystem to the multiplexer.
   * NOTE: this does not take ownership of the filesystem and the caller is
   * still responsible for disposing the filesystem.
   * @return a disposable that removes the filesystem from mlutiplexing.
   */
  addFileSystem(fs: RemoteFileSystem): vscode.IDisposable {
    const hostname = fs.pathToUri('/').authority;
    if (this._filesystems.has(hostname)) {
      throw new Error(`Filesystem has already been added for host ${hostname}`);
    }

    this._filesystems.set(hostname, fs);

    const changeHandler = fs.onDidChangeFile(event => {
      this._onDidChangeEmitter.fire(event);
    });

    return new vscode.Disposable(() => {
      changeHandler.dispose();
      this._filesystems.delete(hostname);
    });
  }

  stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    return this._withFs(uri, fs => fs.stat(uri));
  }

  readFile(uri: vscode.Uri): Promise<Uint8Array> {
    return this._withFs(uri, fs => fs.readFile(uri));
  }

  writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: {create: boolean, overwrite: boolean},
  ): Promise<void> {
    return this._withFs(uri, fs => fs.writeFile(uri, content, options));
  }

  rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: {overwrite: boolean},
  ): Promise<void> {
    return this._withFs(oldUri, fs => {
      if (!fs.handlesResource(newUri)) {
        // TODO(T28798633):
        throw new vscode.FileSystemError(
          'Not implemented: move files across file systems' +
            ` (renaming ${oldUri.toString()} to ${newUri.toString()})`,
        );
      }
      return fs.rename(oldUri, newUri, options);
    });
  }

  copy(
    source: vscode.Uri,
    destination: vscode.Uri,
    options: {overwrite: boolean},
  ): Promise<void> {
    return this._withFs(source, fs => {
      if (!fs.handlesResource(destination)) {
        // TODO(T28798633):
        throw new vscode.FileSystemError(
          'Not implemented: copying files between file systems' +
            ` (copying ${source.toString()} to ${destination.toString()})`,
        );
      }
      return fs.copy(source, destination, options);
    });
  }

  createDirectory(uri: vscode.Uri): Promise<void> {
    return this._withFs(uri, fs => fs.createDirectory(uri));
  }

  readDirectory(
    uri: vscode.Uri,
  ): Promise<Array<[string, vscode.FileTypeType]>> {
    return this._withFs(uri, fs => fs.readDirectory(uri));
  }

  watch(
    uri: vscode.Uri,
    options: {recursive: boolean, excludes: Array<string>},
  ): vscode.Disposable {
    return this._withFs(uri, fs => fs.watch(uri, options));
  }

  delete(uri: vscode.Uri, options: {recursive: boolean}): Promise<void> {
    return this._withFs(uri, fs => fs.delete(uri, options));
  }

  _withFs<T>(uri: vscode.Uri, handler: RemoteFileSystem => T): T {
    const fs = this._filesystems.get(uri.authority);
    if (fs != null) {
      return handler(fs);
    } else {
      throw vscode.FileSystemError.FileNotFound(
        `No loaded filesystem can handle ${uri.toString()}`,
      );
    }
  }
}
