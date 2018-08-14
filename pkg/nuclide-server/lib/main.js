"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
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

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _NuclideServer() {
  const data = _interopRequireDefault(require("./NuclideServer"));

  _NuclideServer = function () {
    return data;
  };

  return data;
}

function _servicesConfig() {
  const data = _interopRequireDefault(require("./servicesConfig"));

  _servicesConfig = function () {
    return data;
  };

  return data;
}

function _yargs() {
  const data = _interopRequireDefault(require("yargs"));

  _yargs = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
 * 
 * @format
 */
const DEFAULT_PORT = 9090;
const logger = (0, _log4js().getLogger)('nuclide-server');

async function getServerCredentials(args) {
  const {
    key,
    cert,
    ca
  } = args;

  if (key && cert && ca) {
    const [serverKey, serverCertificate, certificateAuthorityCertificate] = await Promise.all([_fsPromise().default.readFile(key), _fsPromise().default.readFile(cert), _fsPromise().default.readFile(ca)]);
    return {
      serverKey,
      serverCertificate,
      certificateAuthorityCertificate
    };
  }

  return null;
}

async function main(args) {
  let serverStartTimer;

  try {
    process.on('SIGHUP', () => {});
    (0, _nuclideLogging().initializeLogging)();
    serverStartTimer = (0, _nuclideAnalytics().startTracking)('nuclide-server:start');
    const {
      port,
      expirationDays
    } = args;

    if (expirationDays) {
      setTimeout(() => {
        logger.warn(`NuclideServer exiting - ${expirationDays} day expiration time reached.`);
        (0, _nuclideLogging().flushLogsAndExit)(0);
      }, expirationDays * 24 * 60 * 60 * 1000);
    }

    const serverCredentials = await getServerCredentials(args);
    const server = new (_NuclideServer().default)(Object.assign({
      port
    }, serverCredentials, {
      trackEventLoop: true
    }), _servicesConfig().default);
    await server.connect();
    serverStartTimer.onSuccess();
    logger.info(`NuclideServer started on port ${port}.`);
    logger.info(`Using node ${process.version}.`);
    logger.info(`Server ready time: ${process.uptime() * 1000}ms`);
  } catch (e) {
    if (serverStartTimer != null) {
      serverStartTimer.onError(e);
    }

    logger.fatal(e);
    (0, _nuclideLogging().flushLogsAndAbort)();
  }
} // This should never happen because the server must be started with stderr redirected to a log file.


process.stderr.on('error', error => {
  throw new Error('Can not write to stderr! :' + error);
});
process.on('uncaughtException', err => {
  // Log the error and continue the server crash.
  logger.fatal('uncaughtException:', err); // According to the docs, we need to close our server when this happens once we logged or
  // handled it: https://nodejs.org/api/process.html#process_event_uncaughtexception

  (0, _nuclideLogging().flushLogsAndAbort)();
}); // This works in io.js as of v2.4.0 (possibly earlier versions, as well). Support for this was
// introduced by https://github.com/nodejs/io.js/pull/758 in io.js.
//
// Unfortunately, the analogous change was rejected in Node v0.12.x:
// https://github.com/joyent/node/issues/8997.
//
// We include this code here in anticipation of the Node/io.js merger.

process.on('unhandledRejection', (error, promise) => {
  logger.error(`Unhandled promise rejection ${promise}. Error:`, error);
});

const argv = _yargs().default.default('port', DEFAULT_PORT).argv;

main(argv); // Make it clear that this is not a types module by adding an empty export.