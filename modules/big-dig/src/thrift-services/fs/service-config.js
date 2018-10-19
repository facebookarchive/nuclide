"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FS_SERVICE_CONFIG = void 0;

function _ThriftFileSystemService() {
  const data = _interopRequireDefault(require("./gen-nodejs/ThriftFileSystemService"));

  _ThriftFileSystemService = function () {
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
const FS_SERVICE_CONFIG = {
  name: 'thrift-rfs',
  remoteUri: '',
  remoteCommand: 'node',
  remoteCommandArgs: ['{BIG_DIG_SERVICES_PATH}/src/thrift-services/fs/launchServer-entry.js', '{IPC_PATH}'],
  remoteConnection: {
    type: 'ipcSocket',
    path: ''
  },
  thriftTransport: 'buffered',
  thriftProtocol: 'binary',
  thriftService: _ThriftFileSystemService().default,
  killOldThriftServerProcess: true
};
exports.FS_SERVICE_CONFIG = FS_SERVICE_CONFIG;