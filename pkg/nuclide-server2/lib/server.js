/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {Transport} from 'big-dig/src/server/BigDigServer';
import type {
  LauncherParameters,
  LauncherType,
} from 'big-dig/src/server/ServerLauncher';
import type {Transport as RpcTransportType} from '../../nuclide-rpc';

import {initializeLogging} from '../../nuclide-logging';
import {getServerSideMarshalers} from '../../nuclide-marshalers-common';
import {RpcConnection, ServiceRegistry} from '../../nuclide-rpc';
import servicesConfig from '../../nuclide-server/lib/servicesConfig';
import {NUCLIDE_RPC_TAG} from './constants';

initializeLogging();

function launch(launcherParams: LauncherParameters): Promise<void> {
  const rpcServiceRegistry = new ServiceRegistry(
    getServerSideMarshalers,
    servicesConfig,
  );

  const {server} = launcherParams;
  server.addSubscriber(NUCLIDE_RPC_TAG, {
    onConnection(transport: Transport) {
      const rpcTransport: RpcTransportType = {
        send(message) {
          transport.send(message);
        },
        onMessage() {
          return transport.onMessage();
        },
        // TODO: Right now, connections are never closed.
        close() {},
        isClosed() {
          return false;
        },
      };
      RpcConnection.createServer(rpcServiceRegistry, rpcTransport, {});
    },
  });

  return Promise.resolve();
}

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = (launch: LauncherType);
