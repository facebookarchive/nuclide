'use strict';

var _SocketManager;

function _load_SocketManager() {
  return _SocketManager = require('./SocketManager');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('tunnel-service');

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = function launch(launcherParams) {
  const { server } = launcherParams;
  logger.info('adding tunnel subscriber!');
  let socketManager;

  server.addSubscriber('tunnel', {
    onConnection(transport) {
      logger.info('connection made!');

      transport.onMessage().subscribe(async data => {
        const message = JSON.parse(data);
        const event = message.event;

        if (event === 'proxyCreated') {
          logger.info('creating connection manager');
          socketManager = new (_SocketManager || _load_SocketManager()).SocketManager(message.remotePort, transport);
        } else if (event === 'connection' || event === 'data') {
          socketManager.send(message);
        } else if (event === 'proxyClosed') {
          socketManager.close();
        }
      });
    }
  });

  return Promise.resolve();
};