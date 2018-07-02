"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createThriftClient = createThriftClient;
exports.RemoteFileSystemClient = void 0;

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

function _filesystem_types() {
  const data = _interopRequireDefault(require("./gen-nodejs/filesystem_types"));

  _filesystem_types = function () {
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
 * Wrapper class of raw thrift client which provide more methods, e.g. close()
 * e.g. initialze(), close() etc.
 */
class RemoteFileSystemClient {
  constructor(options) {
    this._options = options;
    this._logger = (0, _log4js().getLogger)('fs-thrift-client');
  }

  async initialize() {
    if (this._client != null) {
      return;
    }

    const transport = _thrift().default.TBufferedTransport();

    const protocol = _thrift().default.TBinaryProtocol(); // Here we always create connection connected to localhost


    this._connection = _thrift().default.createConnection('localhost', this._options.port, {
      transport,
      protocol
    });

    this._connection.on('error', error => {
      throw error;
    });

    this._client = _thrift().default.createClient(_RemoteFileSystemService().default, this._connection);
  }

  watch(path, options) {
    const watchOpts = options || {
      recursive: true,
      excludes: []
    };
    return this._client.watch(path, watchOpts);
  }
  /**
   * @return Promise<Array<filesystem_types.FileChangeEvent>>
   */


  pollFileChanges() {
    return this._client.pollFileChanges();
  }

  mkdir(path) {
    return this._client.createDirectory(path);
  }

  stat(path) {
    return this._client.stat(path);
  }

  readFile(path) {
    return this._client.readFile(path);
  }

  writeFile(path, content, options) {
    return this._client.writeFile(path, content, options);
  }

  rename(oldUri, newUri, options) {
    return this._client.rename(oldUri, newUri, options);
  }

  copy(source, destination, options) {
    return this._client.copy(source, destination, options);
  }

  delete(uri, options) {
    return this._client.deletePath(uri, options);
  }

  readDirectory(uri) {
    return this._client.readDirectory(uri);
  }

  getOptions() {
    return this._options;
  }

  close() {
    this._logger.info('Close remote file system thrift service client...');

    this._connection.end();
  }

}
/**
 * Creates a remote file system thrift client.
 */


exports.RemoteFileSystemClient = RemoteFileSystemClient;

async function createThriftClient(options) {
  try {
    const client = new RemoteFileSystemClient(options);
    await client.initialize();
    return client;
  } catch (err) {
    (0, _log4js().getLogger)().error('Failed to created remote file system thrift client!');
    throw err;
  }
}