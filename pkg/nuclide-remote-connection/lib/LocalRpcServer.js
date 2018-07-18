"use strict";

var _child_process = _interopRequireDefault(require("child_process"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

function _servicesConfig() {
  const data = _interopRequireDefault(require("../../nuclide-server/lib/servicesConfig"));

  _servicesConfig = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _nuclideLogging() {
  const data = require("../../nuclide-logging");

  _nuclideLogging = function () {
    return data;
  };

  return data;
}

function _IpcTransports() {
  const data = require("./IpcTransports");

  _IpcTransports = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
(0, _nuclideLogging().initializeLogging)();
const logger = (0, _log4js().getLogger)('LocalRpcServer');
process.on('uncaughtException', err => {
  // Log the error and continue the server crash.
  logger.fatal('Uncaught exception in LocalRpcServer', err);
  (0, _nuclideLogging().flushLogsAndAbort)();
});
process.on('unhandledRejection', (error, promise) => {
  logger.error('Unhandled promise rejection in LocalRpcServer', error);
}); // Make sure that we cleanly exit if the parent (Atom) goes away.

process.on('disconnect', () => {
  process.exit();
}); // And when we do exit, make sure that all child processes get cleaned up.

process.on('exit', () => {
  // $FlowIgnore: Private method.
  process._getActiveHandles().forEach(handle => {
    if (handle instanceof _child_process.default.ChildProcess) {
      handle.kill();
    }
  });
}); // If we started this with --inspect, don't pass that on to the children.
// Can be removed once --inspect=0 is usable.

if (process.execArgv.length > 0 && process.execArgv[0].startsWith('--inspect')) {
  process.execArgv.splice(0, 1);
}

const serviceRegistry = new (_nuclideRpc().ServiceRegistry)(_nuclideMarshalersCommon().getServerSideMarshalers, _servicesConfig().default);
const serverTransport = new (_IpcTransports().IpcServerTransport)();

_nuclideRpc().RpcConnection.createServer(serviceRegistry, serverTransport);

logger.info('Started local RPC server.');
const HEALTH_INTERVAL = 10 * 60 * 1000; // Track RPC server memory usage.
// $FlowIssue: process.cpuUsage doesn't exist

let lastCpuUsage = process.cpuUsage();
setInterval(() => {
  // $FlowIssue: process.cpuUsage doesn't exist
  const cpuUsage = process.cpuUsage();
  (0, _nuclideAnalytics().track)('local-rpc-health', Object.assign({}, process.memoryUsage(), {
    // 1) CPU stats are in microseconds. Seconds are more convenient.
    // 2) CPU stats are cumulative, so take the delta. The API is supposed to provide
    //    a diff if given the previous value, but this doesn't work correctly in practice.
    cpuUser: (cpuUsage.user - lastCpuUsage.user) / 1e6,
    cpuSystem: (cpuUsage.system - lastCpuUsage.system) / 1e6
  }));
  lastCpuUsage = cpuUsage;
}, HEALTH_INTERVAL);