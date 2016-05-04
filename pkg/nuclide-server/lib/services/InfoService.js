'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ClientConnection} from '../../../nuclide-rpc';

import {getVersion} from '../../../nuclide-version';
import NuclideServer from '../NuclideServer';

export async function getServerVersion(): Promise<string> {
  return getVersion();
}

export function closeConnection(shutdownServer: boolean): void {
  const client: ClientConnection = (this: any);
  NuclideServer.closeConnection(client);
  if (shutdownServer) {
    NuclideServer.shutdown();
  }
}
