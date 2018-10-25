"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createThriftServer = createThriftServer;

function _startThriftServer() {
  const data = require("./startThriftServer");

  _startThriftServer = function () {
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
  const thriftServerStream = (0, _startThriftServer().startThriftServer)(serverConfig);
  const thriftServerPromise = thriftServerStream.take(1).toPromise();
  const subscription = thriftServerStream.connect();
  const connectionOptions = await thriftServerPromise;
  return {
    getConnectionOptions: () => connectionOptions,
    close: () => subscription.unsubscribe()
  };
}