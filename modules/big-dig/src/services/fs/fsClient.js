'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteFileSystemClient = undefined;
exports.createThriftClient = createThriftClient;

var _thrift;

function _load_thrift() {
  return _thrift = _interopRequireDefault(require('thrift'));
}

var _RemoteFileSystemService;

function _load_RemoteFileSystemService() {
  return _RemoteFileSystemService = _interopRequireDefault(require('./gen-nodejs/RemoteFileSystemService'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper class of raw thrift client which provide more methods, e.g. close()
 * e.g. initialze(), close() etc.
 */
class RemoteFileSystemClient {

  constructor(options) {
    this._options = options;
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('fs-thrift-client');
  }

  async initialize() {
    if (this._client != null) {
      return;
    }
    const transport = (_thrift || _load_thrift()).default.TBufferedTransport();
    const protocol = (_thrift || _load_thrift()).default.TBinaryProtocol();

    // Here we always create connection connected to localhost
    this._connection = (_thrift || _load_thrift()).default.createConnection('localhost', this._options.port, {
      transport,
      protocol
    });
    this._connection.on('error', error => {
      throw error;
    });
    this._client = (_thrift || _load_thrift()).default.createClient((_RemoteFileSystemService || _load_RemoteFileSystemService()).default, this._connection);
  }

  mkdir(path) {
    return new Promise((resolve, reject) => {
      this._client.createDirectory(path).then(response => {
        this._logger.info('Created new directory: %s', path);
        resolve();
      }).catch(err => {
        reject(err);
      });
    });
  }

  close() {
    this._logger.info('Close remote file system thrift service client...');
    this._connection.end();
  }
}

exports.RemoteFileSystemClient = RemoteFileSystemClient; /**
                                                          * Creates a remote file system thrift client.
                                                          */
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

async function createThriftClient(options) {
  const client = new RemoteFileSystemClient(options);
  await client.initialize();
  return client;
}