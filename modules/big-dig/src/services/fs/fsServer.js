"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createThriftServer = createThriftServer;
exports.RemoteFileSystemServer = void 0;

function _thrift() {
  const data = _interopRequireDefault(require("thrift"));

  _thrift = function () {
    return data;
  };

  return data;
}

function _RemoteFileSystemService() {
  const data = _interopRequireDefault(require("./gen-nodejs/RemoteFileSystemService"));

  _RemoteFileSystemService = function () {
    return data;
  };

  return data;
}

function _RemoteFileSystemServiceHandler() {
  const data = require("./RemoteFileSystemServiceHandler");

  _RemoteFileSystemServiceHandler = function () {
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
  constructor(options) {
    this._options = options;
    this._logger = (0, _log4js().getLogger)('fs-thrift-server');
    this._watcher = new (_nuclideWatchmanHelpers().WatchmanClient)();
    this._serviceHandler = new (_RemoteFileSystemServiceHandler().RemoteFileSystemServiceHandler)(this._watcher);
  }

  async initialize() {
    if (this._server != null) {
      return;
    }

    this._server = _thrift().default.createServer(_RemoteFileSystemService().default, {
      watch: (uri, options) => {
        return this._serviceHandler.watch(uri, options);
      },
      pollFileChanges: () => {
        return this._serviceHandler.pollFileChanges();
      },
      createDirectory: uri => {
        return this._serviceHandler.createDirectory(uri);
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
      }
    });

    this._server.on('error', error => {
      throw error;
    });

    if (!(await (0, _ports().scanPortsToListen)(this._server, this._options.ports))) {
      throw new Error(`All ports in range "${this._options.ports}" are already in use`);
    }
  }

  close() {
    this._logger.info('Close remote file system thrift service server...');

    this._server = null;

    this._watcher.dispose();
  }

}
/**
 * Creates a remote file system thrift server.
 */


exports.RemoteFileSystemServer = RemoteFileSystemServer;

async function createThriftServer(options) {
  const server = new RemoteFileSystemServer(options); // Make sure we successfully start a thrift server

  await server.initialize();
  return server;
}