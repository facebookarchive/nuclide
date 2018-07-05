/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {BigDigDebugSession} from './BigDigDebugSession';
import type {ConnectionWrapper} from '../ConnectionWrapper';
import type {DebugConfigurationWithBigDig} from './types';

import * as net from 'net';
import {createBigDigDebugSession} from './BigDigDebugSession';
import {getLogger} from 'log4js';

const logger = getLogger('big-dig-debug-provider');

/**
 * Wrapper around a net$Server that is handling requests for debug sessions.
 */
export class BigDigDebugServer {
  _sessions: Array<BigDigDebugSession>;
  _server: net$Server;
  _config: DebugConfigurationWithBigDig;

  constructor(
    connectionWrapper: ConnectionWrapper,
    config: DebugConfigurationWithBigDig,
  ) {
    this._sessions = [];
    // For now, we start a local server and use that as a proxy to the remote
    // debugger. This is slightly suboptimal because it means that any user on
    // the system can communicate with the debugger (which, bear in mind, has
    // the ability to evaluate arbitrary expressions), not just the one who is
    // running VS Code. We will try to tighten this up in the future.
    this._server = net
      .createServer(async socket => {
        logger.info('Connection made to debugger');
        const {hostname, bigdig} = config;
        const launchAttributes = {
          program: bigdig.command,
          args: bigdig.args,
          cwd: bigdig.cwd,
        };

        try {
          const session = await createBigDigDebugSession(
            connectionWrapper,
            hostname,
            launchAttributes,
            socket,
            socket,
          );
          this._sessions.push(session);
        } catch (e) {
          logger.error('Error starting debugger:', e);
        }
      })
      .listen(0);

    // The server is started on port 0, so we must retrieve the actual port
    // after the ephemeral port has been assigned.
    config.debugServer = this._server.address().port;
    this._config = config;
  }

  getConfig(): DebugConfigurationWithBigDig {
    // $FlowIgnore: A copy of type T should be a T, no?
    return {...this._config};
  }

  dispose() {
    // TODO(mbolin): Can session.dispose() be called when the session is over
    // rather than when the BigDigDebugServer is disposed?
    this._sessions.map(session => session.dispose());
    this._sessions.length = 0;
    this._server.close();
  }
}
