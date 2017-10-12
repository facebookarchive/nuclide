'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getServerCredentials = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args) {
    const { key, cert, ca } = args;
    if (key && cert && ca) {
      const [serverKey, serverCertificate, certificateAuthorityCertificate] = yield Promise.all([(_fsPromise || _load_fsPromise()).default.readFile(key), (_fsPromise || _load_fsPromise()).default.readFile(cert), (_fsPromise || _load_fsPromise()).default.readFile(ca)]);
      return { serverKey, serverCertificate, certificateAuthorityCertificate };
    }
    return null;
  });

  return function getServerCredentials(_x) {
    return _ref.apply(this, arguments);
  };
})();

let main = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (args) {
    const serverStartTimer = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)('nuclide-server:start');
    process.on('SIGHUP', function () {});

    try {
      const { port, expirationDays } = args;
      if (expirationDays) {
        setTimeout(function () {
          logger.warn(`NuclideServer exiting - ${expirationDays} day expiration time reached.`);
          (0, (_nuclideLogging || _load_nuclideLogging()).flushLogsAndExit)(0);
        }, expirationDays * 24 * 60 * 60 * 1000);
      }
      const [serverCredentials] = yield Promise.all([getServerCredentials(args),
      // Ensure logging is configured.
      (0, (_nuclideLogging || _load_nuclideLogging()).initialUpdateConfig)()]);
      const server = new (_NuclideServer || _load_NuclideServer()).default(Object.assign({
        port
      }, serverCredentials, {
        trackEventLoop: true
      }), (_servicesConfig || _load_servicesConfig()).default);
      yield server.connect();
      serverStartTimer.onSuccess();
      logger.info(`NuclideServer started on port ${port}.`);
      logger.info(`Using node ${process.version}.`);
      logger.info(`Server ready time: ${process.uptime() * 1000}ms`);
    } catch (e) {
      // In case the exception occurred before logging initialization finished.
      (0, (_nuclideLogging || _load_nuclideLogging()).initialUpdateConfig)();
      serverStartTimer.onError(e);
      logger.fatal(e);
      (0, (_nuclideLogging || _load_nuclideLogging()).flushLogsAndAbort)();
    }
  });

  return function main(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

// This should never happen because the server must be started with stderr redirected to a log file.


var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

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

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_PORT = 9090; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-server');

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