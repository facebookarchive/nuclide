/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {LauncherParameters} from '../../server/NuclideServer';
import type {Transport} from '../../server/BigDigServer';

import {SocketManager} from './SocketManager';

import {getLogger} from 'log4js';

const logger = getLogger('tunnel-service');

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = function launch(
  launcherParams: LauncherParameters,
): Promise<void> {
  const {server} = launcherParams;
  logger.info('adding tunnel subscriber!');
  let socketManager;

  server.addSubscriber('tunnel', {
    onConnection(transport: Transport) {
      logger.info('connection made!');

      transport.onMessage().subscribe(async data => {
        const message = JSON.parse(data);
        const event = message.event;

        if (event === 'proxyCreated') {
          logger.info('creating connection manager');
          socketManager = new SocketManager(message.remotePort, transport);
        } else if (event === 'connection' || event === 'data') {
          socketManager.send(message);
        } else if (event === 'proxyClosed') {
          socketManager.close();
        }
      });
    },
  });

  return Promise.resolve();
};
