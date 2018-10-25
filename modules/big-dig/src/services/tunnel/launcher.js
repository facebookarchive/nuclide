"use strict";

function _TunnelManager() {
  const data = require("./TunnelManager");

  _TunnelManager = function () {
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
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('tunnel-service'); // eslint-disable-next-line nuclide-internal/no-commonjs

module.exports = function launch(server) {
  logger.info('adding tunnel subscriber!');
  server.addSubscriber('tunnel', {
    onConnection(transport) {
      logger.info('connection made, creating TunnelManager'); // eslint-disable-next-line no-unused-vars

      const tunnelManager = new (_TunnelManager().TunnelManager)(transport); // when do we close this?
    }

  });
  return Promise.resolve();
};