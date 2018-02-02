/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ServerConnectionConfiguration} from './ServerConnection';
import type {Transport} from '../../nuclide-rpc';

import {createBigDigClient} from 'big-dig/src/client';
import {getAtomSideMarshalers} from '../../nuclide-marshalers-atom';
import {RpcConnection} from '../../nuclide-rpc';
import {SERVICE_FRAMEWORK3_PROTOCOL} from '../../nuclide-rpc/lib/config';
import servicesConfig from '../../nuclide-server/lib/servicesConfig';
import {NUCLIDE_RPC_TAG} from '../../nuclide-server2/lib/constants';

export default (async function createBigDigRpcClient(
  config: ServerConnectionConfiguration,
): Promise<RpcConnection<Transport>> {
  const bigDigClient = await createBigDigClient(config);
  const bigDigTransport: Transport = {
    send(message: string) {
      bigDigClient.sendMessage(NUCLIDE_RPC_TAG, message);
    },
    onMessage() {
      return bigDigClient.onMessage(NUCLIDE_RPC_TAG);
    },
    close() {
      bigDigClient.close();
    },
    isClosed() {
      return bigDigClient.isClosed();
    },
  };
  return RpcConnection.createRemote(
    bigDigTransport,
    getAtomSideMarshalers(config.host),
    servicesConfig,
    {trackSampleRate: 10},
    SERVICE_FRAMEWORK3_PROTOCOL,
  );
});
