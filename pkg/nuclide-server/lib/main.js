'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let main = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args) {
    const serverStartTimer = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)('nuclide-server:start');
    process.on('SIGHUP', function () {});

    try {
      const { port, expiration_days } = args;
      if (expiration_days) {
        setTimeout(function () {
          logger.warn(`NuclideServer exiting - ${expiration_days} day expiration time reached.`);
          (0, (_nuclideLogging || _load_nuclideLogging()).flushLogsAndExit)(0);
        }, expiration_days * 24 * 60 * 60 * 1000);
      }
      let { key, cert, ca } = args;
      if (key && cert && ca) {
        key = _fs.default.readFileSync(key);
        cert = _fs.default.readFileSync(cert);
        ca = _fs.default.readFileSync(ca);
      }
      const server = new (_NuclideServer || _load_NuclideServer()).default({
        port,
        serverKey: key,
        serverCertificate: cert,
        certificateAuthorityCertificate: ca,
        trackEventLoop: true
      }, (_servicesConfig || _load_servicesConfig()).default);
      yield server.connect();
      serverStartTimer.onSuccess();
      logger.info(`NuclideServer started on port ${port}.`);
      logger.info(`Using node ${process.version}.`);
      logger.info(`Server ready time: ${process.uptime() * 1000}ms`);
    } catch (e) {
      // Ensure logging is configured.
      yield (0, (_nuclideLogging || _load_nuclideLogging()).initialUpdateConfig)();
      yield serverStartTimer.onError(e);
      logger.fatal(e);
      (0, (_nuclideLogging || _load_nuclideLogging()).flushLogsAndAbort)();
    }
  });

  return function main(_x) {
    return _ref.apply(this, arguments);
  };
})();

// This should never happen because the server must be started with stderr redirected to a log file.


var _fs = _interopRequireDefault(require('fs'));

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _NuclideServer;

function _load_NuclideServer() {
  return _NuclideServer = _interopRequireDefault(require('./NuclideServer'));
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('./servicesConfig'));
}

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
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
 */

const DEFAULT_PORT = 9090;

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

process.stderr.on('error', error => {
  throw new Error('Can not write to stderr! :' + error);
});

process.on('uncaughtException', err => {
  // Log the error and continue the server crash.
  logger.fatal('uncaughtException:', err);
  // According to the docs, we need to close our server when this happens once we logged or
  // handled it: https://nodejs.org/api/process.html#process_event_uncaughtexception
  (0, (_nuclideLogging || _load_nuclideLogging()).flushLogsAndAbort)();
});

// This works in io.js as of v2.4.0 (possibly earlier versions, as well). Support for this was
// introduced by https://github.com/nodejs/io.js/pull/758 in io.js.
//
// Unfortunately, the analogous change was rejected in Node v0.12.x:
// https://github.com/joyent/node/issues/8997.
//
// We include this code here in anticipation of the Node/io.js merger.
process.on('unhandledRejection', (error, promise) => {
  logger.error(`Unhandled promise rejection ${promise}. Error:`, error);
});

const argv = (_yargs || _load_yargs()).default.default('port', DEFAULT_PORT).argv;

main(argv);

// Make it clear that this is not a types module by adding an empty export.