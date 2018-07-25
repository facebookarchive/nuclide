"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThriftRemoteFileSystem = void 0;

function _types() {
  const data = require("../../big-dig/src/services/fs/types");

  _types = function () {
    return data;
  };

  return data;
}

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
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

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
const POLLING_INTERVAL_MS = 3000;
const logger = (0, _log4js().getLogger)('remote-fs');

class ThriftRemoteFileSystem extends _RemoteFileSystem().RemoteFileSystem {
  constructor(hostname, server) {
    super(hostname, server);
    this._pollingInterval = null;
  }

  async _startWatching(uri, options) {
    const path = this.uriToPath(uri);
    const client = await this.getThriftClient();
    await client.watch(path, options); // Start polling file change events

    this._pollingInterval = setInterval(async () => {
      const changes = await client.pollFileChanges();

      this._onFilesChanged(path, (0, _converter().convertToVSCodeFileChangeEvents)(changes));
    }, POLLING_INTERVAL_MS);
  }

  watch(uri, options) {
    try {
      this._startWatching(uri, options);
    } catch (error) {
      throw (0, _converter().createVSCodeFsError)(error, uri);
    } // Need to return a vscode.Disposable


    return new (vscode().Disposable)(() => {
      logger.info(`Stopped watching: ${uri.toString()}`);

      this._disposePollingInterval();
    });
  }

  async getThriftClient() {
    const conn = await this.getConnection();
    const client = conn.getOrCreateThriftClient();
    return client;
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

  _disposePollingInterval() {
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

exports.ThriftRemoteFileSystem = ThriftRemoteFileSystem;