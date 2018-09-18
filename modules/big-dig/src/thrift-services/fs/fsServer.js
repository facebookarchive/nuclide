"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteFileSystemServer = void 0;

function _thrift() {
  const data = _interopRequireDefault(require("thrift"));

  _thrift = function () {
    return data;
  };

  return data;
}

function _ThriftFileSystemService() {
  const data = _interopRequireDefault(require("./gen-nodejs/ThriftFileSystemService"));

  _ThriftFileSystemService = function () {
    return data;
  };

  return data;
}

function _ThriftFileSystemServiceHandler() {
  const data = require("./ThriftFileSystemServiceHandler");

  _ThriftFileSystemServiceHandler = function () {
    return data;
  };

  return data;
}

function _ports() {
  const data = require("../../common/ports");

  _ports = function () {
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

function _nuclideWatchmanHelpers() {
  const data = require("../../../../nuclide-watchman-helpers");

  _nuclideWatchmanHelpers = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Wrapper class of raw thrift server which provide more methods
 * e.g. initialze(), close() etc.
 */
class RemoteFileSystemServer {
  constructor(port) {
    this._port = port;
    this._logger = (0, _log4js().getLogger)('fs-thrift-server');
    this._watcher = new (_nuclideWatchmanHelpers().WatchmanClient)();
    this._serviceHandler = new (_ThriftFileSystemServiceHandler().ThriftFileSystemServiceHandler)(this._watcher);
  }

  async initialize() {
    if (this._server != null) {
      return;
    }

    this._server = _thrift().default.createServer(_ThriftFileSystemService().default, {
      watch: (uri, options) => {
        return this._serviceHandler.watch(uri, options);
      },
      unwatch: watchId => {
        return this._serviceHandler.unwatch(watchId);
      },
      pollFileChanges: watchId => {
        return this._serviceHandler.pollFileChanges(watchId);
      },
      createDirectory: uri => {
        return this._serviceHandler.createDirectory(uri);
      },
      fstat: uri => {
        return this._serviceHandler.fstat(uri);
      },
      stat: uri => {
        return this._serviceHandler.stat(uri);
      },
      readFile: uri => {
        return this._serviceHandler.readFile(uri);
      },
      writeFile: (uri, content, options) => {
        return this._serviceHandler.writeFile(uri, content, options);
      },
      rename: (oldUri, newUri, options) => {
        return this._serviceHandler.rename(oldUri, newUri, options);
      },
      copy: (source, destination, options) => {
        return this._serviceHandler.copy(source, destination, options);
      },
      deletePath: (uri, options) => {
        return this._serviceHandler.deletePath(uri, options);
      },
      readDirectory: uri => {
        return this._serviceHandler.readDirectory(uri);
      },
      open: (uri, permissionFlags, mode) => {
        return this._serviceHandler.open(uri, permissionFlags, mode);
      },
      close: fd => {
        return this._serviceHandler.close(fd);
      },
      fsync: fd => {
        return this._serviceHandler.fsync(fd);
      },
      ftruncate: (fd, len) => {
        return this._serviceHandler.ftruncate(fd, len);
      },
      utimes: (path, atime, mtime) => {
        return this._serviceHandler.utimes(path, atime, mtime);
      },
      chmod: (uri, mode) => {
        return this._serviceHandler.chmod(uri, mode);
      },
      chown: (uri, uid, gid) => {
        return this._serviceHandler.chown(uri, uid, gid);
      }
    });

    this._server.on('error', error => {
      throw error;
    });

    const isServerListening = await (0, _ports().scanPortsToListen)(this._server, String(this._port));

    if (!isServerListening) {
      throw new Error(`All ports in range "${this._port}" are already in use`);
    }
  }

  getPort() {
    return this._server.address().port;
  }

  close() {
    this._logger.info('Close remote file system thrift service server...');

    this._server = null;

    this._watcher.dispose();

    this._serviceHandler.dispose();
  }

}

exports.RemoteFileSystemServer = RemoteFileSystemServer;