"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createThriftServer = createThriftServer;

function _fsServer() {
  const data = require("../fs/fsServer");

  _fsServer = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
async function createThriftServer(serverConfig) {
  const server = new (_fsServer().RemoteFileSystemServer)(serverConfig.remotePort); // Make sure we successfully start a thrift server

  await server.initialize();
  return server;
}