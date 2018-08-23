"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileSystemMultiplexer = void 0;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class FileSystemMultiplexer {
  // Maps hostnames to file systems.
  constructor() {
    this._onDidChangeEmitter = new (vscode().EventEmitter)();
    this.onDidChangeFile = this._onDidChangeEmitter.event;
    this._filesystems = new Map();
    this._fsRegistration = null;
  }
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
   * @return a disposable that unregisters this filesystem. *Does not dispose of
   * the filesystems it multiplexes over.*
   */


  register() {
    if (this._fsRegistration != null) {
      throw new Error('Cannot register this filesystem more than once');
    }

    const sub = vscode().workspace.registerFileSystemProvider('big-dig', this, {
      // TODO(T28798298): automatically determine if case sensitive.
      isCaseSensitive: true
    });
    this._fsRegistration = sub;
    return new (vscode().Disposable)(() => {
      sub.dispose();
      this._fsRegistration = null;
    });
  }
  /**
   * Adds the given filesystem to the multiplexer.
   * NOTE: this does not take ownership of the filesystem and the caller is
   * still responsible for disposing the filesystem.
   * @return a disposable that removes the filesystem from mlutiplexing.
   */


  addFileSystem(fs) {
    const hostname = fs.pathToUri('/').authority;

    if (this._filesystems.has(hostname)) {
      throw new Error(`Filesystem has already been added for host ${hostname}`);
    }

    this._filesystems.set(hostname, fs);

    const changeHandler = fs.onDidChangeFile(event => {
      this._onDidChangeEmitter.fire(event);
    });
    return new (vscode().Disposable)(() => {
      changeHandler.dispose();

      this._filesystems.delete(hostname);
    });
  }

  stat(uri) {
    return this._withFs(uri, fs => fs.stat(uri));
  }

  readFile(uri) {
    return this._withFs(uri, fs => fs.readFile(uri));
  }

  writeFile(uri, content, options) {
    return this._withFs(uri, fs => fs.writeFile(uri, content, options));
  }

  rename(oldUri, newUri, options) {
    return this._withFs(oldUri, fs => {
      if (!fs.handlesResource(newUri)) {
        // TODO(T28798633):
        throw new (vscode().FileSystemError)('Not implemented: move files across file systems' + ` (renaming ${oldUri.toString()} to ${newUri.toString()})`);
      }

      return fs.rename(oldUri, newUri, options);
    });
  }

  copy(source, destination, options) {
    return this._withFs(source, fs => {
      if (!fs.handlesResource(destination)) {
        // TODO(T28798633):
        throw new (vscode().FileSystemError)('Not implemented: copying files between file systems' + ` (copying ${source.toString()} to ${destination.toString()})`);
      }

      return fs.copy(source, destination, options);
    });
  }

  createDirectory(uri) {
    return this._withFs(uri, fs => fs.createDirectory(uri));
  }

  readDirectory(uri) {
    return this._withFs(uri, fs => fs.readDirectory(uri));
  }

  watch(uri, options) {
    return this._withFs(uri, fs => fs.watch(uri, options));
  }

  delete(uri, options) {
    return this._withFs(uri, fs => fs.delete(uri, options));
  }

  _withFs(uri, handler) {
    const fs = this._filesystems.get(uri.authority);

    if (fs != null) {
      return handler(fs);
    } else {
      throw vscode().FileSystemError.FileNotFound(`No loaded filesystem can handle ${uri.toString()}`);
    }
  }

}

exports.FileSystemMultiplexer = FileSystemMultiplexer;