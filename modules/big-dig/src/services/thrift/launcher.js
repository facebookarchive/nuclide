"use strict";

function _ThriftServerManager() {
  const data = require("./ThriftServerManager");

  _ThriftServerManager = function () {
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
const logger = (0, _log4js().getLogger)('thrift-service'); // eslint-disable-next-line nuclide-internal/no-commonjs

module.exports = function launch(server) {
  logger.info('adding Thrift Service subscriber!');
  server.addSubscriber('thrift-services', {
    onConnection(transport) {
      logger.info('connection made, creating Thrift Service Manager'); // eslint-disable-next-line no-unused-vars

      const thriftServerManager = new (_ThriftServerManager().ThriftServerManager)(transport);
    }

  });
  return Promise.resolve();
};