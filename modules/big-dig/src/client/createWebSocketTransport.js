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

import WS from 'ws';

import type {RemoteConnectionConfiguration} from './SshHandshake';
import {WebSocketTransport} from '../common/WebSocketTransport';

export default (async function createWebSocketTransport(
  config: RemoteConnectionConfiguration,
): Promise<WebSocketTransport> {
  const socket = new WS(`wss://${config.host}:${config.port}`, {
    ca: config.certificateAuthorityCertificate,
    cert: config.clientCertificate,
    key: config.clientKey,
  });
  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  return new WebSocketTransport('test', socket);
});
