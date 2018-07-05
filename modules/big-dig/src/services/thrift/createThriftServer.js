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

import type {ThriftServerConfig} from './types';
import {RemoteFileSystemServer} from '../fs/fsServer';

export async function createThriftServer(
  serverConfig: ThriftServerConfig,
): Promise<RemoteFileSystemServer> {
  const server = new RemoteFileSystemServer(serverConfig.remotePort);
  // Make sure we successfully start a thrift server
  await server.initialize();
  return server;
}
