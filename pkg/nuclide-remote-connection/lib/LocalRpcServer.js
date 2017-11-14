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

import {getLogger} from 'log4js';
import {getServerSideMarshalers} from '../../nuclide-marshalers-common';
import servicesConfig from '../../nuclide-server/lib/servicesConfig';
import {RpcConnection, ServiceRegistry} from '../../nuclide-rpc';
import {initializeLogging, flushLogsAndAbort} from '../../nuclide-logging';
import {IpcServerTransport} from './IpcTransports';

initializeLogging();

const logger = getLogger('LocalRpcServer');

process.on('uncaughtException', err => {
  // Log the error and continue the server crash.
  logger.fatal('Uncaught exception in LocalRpcServer', err);
  flushLogsAndAbort();
});

process.on('unhandledRejection', (error, promise) => {
  logger.error('Unhandled promise rejection in LocalRpcServer', error);
});

const serviceRegistry = new ServiceRegistry(
  getServerSideMarshalers,
  servicesConfig,
);
const serverTransport = new IpcServerTransport();
RpcConnection.createServer(serviceRegistry, serverTransport);

logger.info('Started local RPC server.');
