'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteFileSystemServer = undefined;
exports.createThriftServer = createThriftServer;

var _thrift;

function _load_thrift() {
  return _thrift = _interopRequireDefault(require('thrift'));
}

var _RemoteFileSystemService;

function _load_RemoteFileSystemService() {
  return _RemoteFileSystemService = _interopRequireDefault(require('./gen-nodejs/RemoteFileSystemService'));
}

var _RemoteFileSystemServiceHandler;

function _load_RemoteFileSystemServiceHandler() {
  return _RemoteFileSystemServiceHandler = require('./RemoteFileSystemServiceHandler');
}

var _ports;

function _load_ports() {
  return _ports = require('../../common/ports');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper class of raw thrift server which provide more methods
 * e.g. initialze(), close() etc.
 */
class RemoteFileSystemServer {

  constructor(options) {
    this._serviceHandler = new (_RemoteFileSystemServiceHandler || _load_RemoteFileSystemServiceHandler()).RemoteFileSystemServiceHandler();
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('fs-thrift-server');
    this._options = options;
  }

  async initialize() {
    if (this._server != null) {
      return;
    }
    this._server = (_thrift || _load_thrift()).default.createServer((_RemoteFileSystemService || _load_RemoteFileSystemService()).default, {
      createDirectory: uri => {
        return this._serviceHandler.createDirectory(uri);
      }
    });
    this._server.on('error', error => {
      throw error;
    });
    if (!(await (0, (_ports || _load_ports()).scanPortsToListen)(this._server, this._options.ports))) {
      throw new Error(`All ports in range "${this._options.ports}" are already in use`);
    }
  }

  close() {
    this._logger.info('Close remote file system thrift service server...');
    this._server = null;
  }
}

exports.RemoteFileSystemServer = RemoteFileSystemServer; /**
                                                          * Creates a remote file system thrift server.
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

async function createThriftServer(options) {
  const server = new RemoteFileSystemServer(options);
  // Make sure we successfully start a thrift server
  await server.initialize();
  return server;
}