'use strict';

var _child_process = _interopRequireDefault(require('child_process'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../../nuclide-server/lib/servicesConfig'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _IpcTransports;

function _load_IpcTransports() {
  return _IpcTransports = require('./IpcTransports');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, (_nuclideLogging || _load_nuclideLogging()).initializeLogging)(); /**
                                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                                       * All rights reserved.
                                                                       *
                                                                       * This source code is licensed under the license found in the LICENSE file in
                                                                       * the root directory of this source tree.
                                                                       *
                                                                       * 
                                                                       * @format
                                                                       */

const logger = (0, (_log4js || _load_log4js()).getLogger)('LocalRpcServer');

process.on('uncaughtException', err => {
  // Log the error and continue the server crash.
  logger.fatal('Uncaught exception in LocalRpcServer', err);
  (0, (_nuclideLogging || _load_nuclideLogging()).flushLogsAndAbort)();
});

process.on('unhandledRejection', (error, promise) => {
  logger.error('Unhandled promise rejection in LocalRpcServer', error);
});

// Make sure that we cleanly exit if the parent (Atom) goes away.
process.on('disconnect', () => {
  process.exit();
});

// And when we do exit, make sure that all child processes get cleaned up.
process.on('exit', () => {
  // $FlowIgnore: Private method.
  process._getActiveHandles().forEach(handle => {
    if (handle instanceof _child_process.default.ChildProcess) {
      handle.kill();
    }
  });
});

const serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry((_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getServerSideMarshalers, (_servicesConfig || _load_servicesConfig()).default);
const serverTransport = new (_IpcTransports || _load_IpcTransports()).IpcServerTransport();
(_nuclideRpc || _load_nuclideRpc()).RpcConnection.createServer(serviceRegistry, serverTransport);

logger.info('Started local RPC server.');