"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteFileSystem = void 0;

var pathModule = _interopRequireWildcard(require("path"));

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("./analytics/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _ConnectionWrapper() {
  const data = require("./ConnectionWrapper");

  _ConnectionWrapper = function () {
    return data;
  };

  return data;
}

function _Server() {
  const data = require("./remote/Server");

  _Server = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _converter() {
  const data = require("./util/converter");

  _converter = function () {
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
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('remote-fs');
/** Timeout between attempts to reconnect to the server in case of error. */

const CLEAR_ERROR_TIMEOUT_MS = 1000;

class RemoteFileSystem {
  // Event triggers when this filesystem is closed/disposed.
  // Event triggers when remote (watched) files change.
  // True after `dispose()` has been called.

  /**
   * Set if there has been a recent connection error; will be unset automatically after some time
   * has passed. We use this because vscode will queue a sequence of requests (in addition to
   * parallel requests), which would otherwise cause the user to have to sit through a sequence of
   * interactive connection attempts that are likely to fail. By immediately repeating the previous
   * error for a short time, we can quickly dispell vscode's queue of requests.
   */

  /**
   * Creates a filesystem that connects to the remote server.
   */
  constructor(hostname, server) {
    this._onDisposedEmitter = new (vscode().EventEmitter)();
    this._onDidChangeEmitter = new (vscode().EventEmitter)();
    this.onDidChangeFile = this._onDidChangeEmitter.event;
    this._disposed = false;
    this._currentError = null;
    this._resetErrorTimeout = null;
    this._baseUri = vscode().Uri.parse(`big-dig://${hostname}/`);
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


  isDisposed() {
    return this._disposed;
  }
  /**
   * Listen for this filesystem being disposed.
   * @returns a disposable that will stop listening.
   */


  onDisposed(listener) {
    return this._onDisposedEmitter.event(listener);
  }
  /** Returns the hostname of this filesystem. */


  getHostname() {
    return this._baseUri.authority;
  }

  getWorkspaceFolders() {
    const workspaces = vscode().workspace.workspaceFolders || [];
    return workspaces.filter(workspace => this.handlesResource(workspace.uri));
  }

  getServer() {
    return this._server;
  }

  async getConnection() {
    if (this._currentError != null) {
      throw vscode().FileSystemError.Unavailable(this._currentError.message);
    }

    try {
      return await this._server.connect();
    } catch (error) {
      if (this._currentError == null) {
        this._currentError = error;
        this._resetErrorTimeout = setTimeout(() => this._currentError = null, CLEAR_ERROR_TIMEOUT_MS); // Show an error for just the first caller.

        vscode().window.showErrorMessage(error.message);
      }

      throw vscode().FileSystemError.Unavailable(error.message);
    }
  }

  uriToLspFileUri(resource) {
    return resource.with({
      authority: '',
      scheme: 'file'
    }).toString();
  }

  uriToPath(resource) {
    return resource.path;
  }

  pathToUri(path) {
    return this._baseUri.with({
      path
    });
  }

  handlesResource(uri) {
    return uri.scheme === this._baseUri.scheme && uri.authority === this._baseUri.authority;
  }

  async _statPath(path) {
    const conn = await this.getConnection();
    const result = await conn.fsStat(path);
    return (0, _converter().toStat)(result);
  }

  stat(resource) {
    return this._statPath(this.uriToPath(resource)).catch(error => Promise.reject((0, _converter().createVSCodeFsError)(error, resource)));
  }

  async exists(resource) {
    try {
      await this._statPath(this.uriToPath(resource));
      return true;
    } catch (error) {
      if (error instanceof _ConnectionWrapper().RpcMethodError && error.parameters.code === 'ENOENT') {
        return false;
      } else {
        throw (0, _converter().createVSCodeFsError)(error);
      }
    }
  }

  async readFile(uri) {
    try {
      const path = this.uriToPath(uri);
      (0, _analytics().logToScribe)('vscode.fs.read', {
        path
      });
      const conn = await this.getConnection();
      const result = await conn.fsGetFileContents(path);
      return new Uint8Array(Buffer.from(result, 'utf8'));
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  async writeFile(uri, content, options) {
    try {
      (0, _analytics().logToScribe)('vscode.fs.write', {
        path: uri.path
      });
      const conn = await this.getConnection(); // $FlowIssue Flow types need to be updated; Buffer can accept Uint8Array

      const data = new Buffer(content);
      await conn.fsWrite(this.uriToPath(uri), data, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  async rename(oldUri, newUri, options) {
    try {
      const conn = await this.getConnection();
      const src = this.uriToPath(oldUri);
      const dst = this.uriToPath(newUri);
      await conn.fsMove(src, dst, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error);
    }
  }

  async copy(source, destination, options) {
    try {
      const conn = await this.getConnection();
      const src = this.uriToPath(source);
      const dst = this.uriToPath(destination);
      await conn.fsCopy(src, dst, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error);
    }
  }

  async createDirectory(uri) {
    try {
      const conn = await this.getConnection();
      await conn.fsMkdir(this.uriToPath(uri));
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  async readDirectory(uri) {
    try {
      const conn = await this.getConnection();
      const path = this.uriToPath(uri);
      const files = await conn.fsReaddir(path);
      return files.map(([file, stat]) => {
        return [file, (0, _converter().toFileType)(stat)];
      });
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  watch(uri, options) {
    try {
      const {
        recursive,
        excludes: exclude
      } = options;
      logger.info(`Watching ${uri.toString()} ${JSON.stringify(options)}`);
      const path = this.uriToPath(uri);
      return this._server.onEachConnection(conn => {
        const watchSub = conn.fsWatch(path, {
          recursive,
          exclude
        }).subscribe(changes => this._onFilesChanged(path, changes), error => logger.error(error));
        return () => {
          watchSub.unsubscribe();
          logger.info(`Stopped watching: ${uri.toString()}`);
        };
      });
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  async delete(uri, options) {
    try {
      const conn = await this.getConnection();
      const path = this.uriToPath(uri);
      await conn.fsDelete(path, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }
  /**
   * Coerces the file to a directory.
   * @returns `file` if it is a directory, or its parent if not.
   */


  async toDir(uri) {
    const {
      type
    } = await this.stat(uri);

    if (type === vscode().FileType.Directory) {
      return uri;
    } else {
      return uri.with({
        path: pathModule.dirname(uri.path)
      });
    }
  }

  _onFilesChanged(basePath, changes) {
    const fileChanges = changes.map(change => ({
      type: (0, _converter().toChangeType)(change.type),
      uri: this.pathToUri(pathModule.join(basePath, change.path))
    }));

    if (fileChanges.length > 0) {
      this._onDidChangeEmitter.fire(fileChanges);
    }
  }

}

exports.RemoteFileSystem = RemoteFileSystem;