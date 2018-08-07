"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FS_SERVICE_CONIFG = void 0;

function _RemoteFileSystemService() {
  const data = _interopRequireDefault(require("./gen-nodejs/RemoteFileSystemService"));

  _RemoteFileSystemService = function () {
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
const FS_SERVICE_CONIFG = {
  name: 'thrift-rfs',
  remoteUri: '',
  remoteCommand: '',
  remoteCommandArgs: [],
  remotePort: 0,
  thriftTransport: 'buffered',
  thriftProtocol: 'binary',
  thriftService: _RemoteFileSystemService().default,
  killOldThriftServerProcess: true
};
exports.FS_SERVICE_CONIFG = FS_SERVICE_CONIFG;