"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PTY_SERVICE_CONFIG = void 0;

function _ThriftPtyService() {
  const data = _interopRequireDefault(require("./gen-nodejs/ThriftPtyService"));

  _ThriftPtyService = function () {
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
const PTY_SERVICE_CONFIG = {
  name: 'thrift-pty',
  remoteUri: '',
  remoteCommand: 'node',
  remoteCommandArgs: ['{BIG_DIG_SERVICES_PATH}/src/thrift-services/pty/launchThriftPtyServer-entry.js', '{IPC_PATH}'],
  remoteConnection: {
    type: 'ipcSocket',
    path: ''
  },
  thriftTransport: 'buffered',
  thriftProtocol: 'binary',
  thriftService: _ThriftPtyService().default,
  killOldThriftServerProcess: true
};
exports.PTY_SERVICE_CONFIG = PTY_SERVICE_CONFIG;