"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThriftRemoteFileSystem = void 0;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var pathModule = _interopRequireWildcard(require("path"));

function _Server() {
  const data = require("./remote/Server");

  _Server = function () {
    return data;
  };

  return data;
}

function _RemoteFileSystem() {
  const data = require("./RemoteFileSystem");

  _RemoteFileSystem = function () {
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

function _analytics() {
  const data = require("./analytics/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _filesystem_types() {
  const data = _interopRequireDefault(require("../../big-dig/src/services/fs/gen-nodejs/filesystem_types"));

  _filesystem_types = function () {
    return data;
  };

  return data;
}

function _types() {
  const data = require("../../big-dig/src/services/fs/types");

  _types = function () {
    return data;
  };

  return data;
}

function _FileWatch() {
  const data = require("../../big-dig/src/services/fs/FileWatch");

  _FileWatch = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const BUFFER_ENCODING = 'utf-8';

class ThriftRemoteFileSystem extends _RemoteFileSystem().RemoteFileSystem {
  constructor(hostname, server) {
    super(hostname, server);
    this._idxToFileWatches = new Map();
    this._clientWrapper = null;
    this._watchRequests = new Set();
  }

  watch(uri, options) {
    const watchRequest = {
      watch: new (_FileWatch().FileWatch)(() => this.getThriftClientWrapper(), this.uriToPath(uri), options, this._handleFileChanges.bind(this)),
      watchPath: this.uriToPath(uri),
      watchOptions: options
    };

    this._watchRequests.add(watchRequest);

    return new (vscode().Disposable)(() => watchRequest.watch.dispose());
  }

  _handleFileChanges(basePath, thriftFileChanges) {
    const changes = (0, _converter().convertToVSCodeFileChangeEvents)(thriftFileChanges);
    const fileChanges = changes.map(change => ({
      type: (0, _converter().toChangeType)(change.type),
      uri: this.pathToUri(pathModule.join(basePath, change.path))
    }));

    if (fileChanges.length > 0) {
      this._onDidChangeEmitter.fire(fileChanges);
    }
  }

  _updateFileWatches() {
    this._watchRequests.forEach(watchRequest => {
      watchRequest.watch.dispose();
      watchRequest.watch = new (_FileWatch().FileWatch)(() => this.getThriftClientWrapper(), watchRequest.watchPath, watchRequest.watchOptions, this._handleFileChanges.bind(this));
    });
  }

  async getThriftClientWrapper() {
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

  async getThriftClient() {
    const clientWrapper = await this.getThriftClientWrapper();
    return clientWrapper.getClient();
  }

  async createDirectory(uri) {
    try {
      const client = await this.getThriftClient();
      await client.createDirectory(this.uriToPath(uri));
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  } // This internal method is shared by `stat` and `exists`, can throw raw Thrift
  // error type which enables us to know the real cause of the problem


  async _statPath(path) {
    const client = await this.getThriftClient(); // VSCode FileSystemProvider `stat` default: follow symlink

    const thriftStat = await client.stat(path);
    return (0, _converter().convertToVSCodeFileStat)(thriftStat);
  }

  async stat(resource) {
    return this._statPath(this.uriToPath(resource)).catch(error => Promise.reject((0, _converter().createVSCodeFsError)(error, resource)));
  }

  async readFile(uri) {
    try {
      const path = this.uriToPath(uri);
      (0, _analytics().logToScribe)('vscode.fs.read', {
        path
      });
      const client = await this.getThriftClient();
      const buffer = await client.readFile(path);
      return new Uint8Array(buffer);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  async writeFile(uri, content, options) {
    try {
      (0, _analytics().logToScribe)('vscode.fs.write', {
        path: uri.path
      });
      const client = await this.getThriftClient(); // $FlowIssue Flow types need to be updated; Buffer can accept Uint8Array

      const data = new Buffer(content, BUFFER_ENCODING);
      await client.writeFile(this.uriToPath(uri), data, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  async rename(oldUri, newUri, options) {
    try {
      const src = this.uriToPath(oldUri);
      const dst = this.uriToPath(newUri);
      const client = await this.getThriftClient();
      await client.rename(src, dst, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error);
    }
  }

  async copy(source, destination, options) {
    try {
      const src = this.uriToPath(source);
      const dst = this.uriToPath(destination);
      const client = await this.getThriftClient();
      await client.copy(src, dst, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error);
    }
  }

  async delete(uri, options) {
    try {
      const client = await this.getThriftClient();
      const path = this.uriToPath(uri);
      await client.deletePath(path, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  async readDirectory(uri) {
    try {
      const path = this.uriToPath(uri);
      const client = await this.getThriftClient();
      const fileEntries = await client.readDirectory(path);
      return fileEntries.map(entry => {
        return [entry.fname, (0, _converter().convertToVSCodeFileType)(entry)];
      });
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    }
  }

  async exists(resource) {
    try {
      await this._statPath(this.uriToPath(resource));
      return true;
    } catch (error) {
      if (error.code === _filesystem_types().default.ErrorCode.ENOENT) {
        return false;
      } else {
        throw (0, _converter().createVSCodeFsError)(error);
      }
    }
  }

  dispose() {
    super.dispose();

    this._idxToFileWatches.clear();
  }

}

exports.ThriftRemoteFileSystem = ThriftRemoteFileSystem;