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

import type {RpcRegistrar} from './rpc-types';

import * as log4js from 'log4js';
import * as proto from './Protocol.js';
import {version as serverVersion} from './package.json';

const logger = log4js.getLogger('server');

export class ServerRpcMethods {
  register(registrar: RpcRegistrar) {
    registrar.registerFun('shutdown', this._doShutdown.bind(this));
    registrar.registerFun('get-status', this._doGetStatus.bind(this));
  }

  dispose(): void {}

  _doShutdown(
    params: proto.ServerShutdownParams,
  ): Promise<proto.ServerShutdownResult> {
    // TODO(siegebell): Implement a controlled shutdown: give all transports
    // a chance to clean up resources.
    logger.info('Shutting down...');
    return new Promise((resolve, reject) => {
      // TODO(siegebell): log4js.shutdown does not reliably flush!?
      log4js.shutdown(() => {
        resolve({});
        // TODO(siegebell): an orderly shutdown would wait for the sockets
        // to be closed/flushed before exiting...
        // Give some time for the message to be sent
        setTimeout(() => process.exit(0), 10);
      });
    });
  }

  async _doGetStatus(
    params: proto.ServerGetStatusParams,
  ): Promise<proto.ServerGetStatusResult> {
    return {
      version: serverVersion,
      platform: process.platform,
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
