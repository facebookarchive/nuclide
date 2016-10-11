Object.defineProperty(exports, '__esModule', {
  value: true
});

var main = _asyncToGenerator(function* (args) {
  var serverStartTimer = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)('nuclide-server:start');
  process.on('SIGHUP', function () {});

  try {
    var port = args.port;
    var _key = args.key;
    var _cert = args.cert;
    var _ca = args.ca;

    if (_key && _cert && _ca) {
      _key = (_fs || _load_fs()).default.readFileSync(_key);
      _cert = (_fs || _load_fs()).default.readFileSync(_cert);
      _ca = (_fs || _load_fs()).default.readFileSync(_ca);
    }
    var server = new (_NuclideServer || _load_NuclideServer()).default({
      port: port,
      serverKey: _key,
      serverCertificate: _cert,
      certificateAuthorityCertificate: _ca,
      trackEventLoop: true
    }, (_servicesConfig || _load_servicesConfig()).default);
    yield server.connect();
    serverStartTimer.onSuccess();
    logger.info('NuclideServer started on port ' + port + '.');
    logger.info('Using node ' + process.version + '.');
    logger.info('Server ready time: ' + process.uptime() * 1000 + 'ms');
  } catch (e) {
    // Ensure logging is configured.
    yield (0, (_nuclideLogging || _load_nuclideLogging()).initialUpdateConfig)();
    yield serverStartTimer.onError(e);
    logger.fatal(e);
    (0, (_nuclideLogging || _load_nuclideLogging()).flushLogsAndAbort)();
  }
}

// This should never happen because the server must be started with stderr redirected to a log file.
);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('fs'));
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

var DEFAULT_PORT = 9090;

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

process.stderr.on('error', function (error) {
  throw new Error('Can not write to stderr! :' + error);
});

process.on('uncaughtException', function (err) {
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
process.on('unhandledRejection', function (error, promise) {
  logger.error('Unhandled promise rejection ' + promise + '. Error:', error);
});

var argv = (_yargs || _load_yargs()).default.default('port', DEFAULT_PORT).argv;

main(argv);

// Make it clear that this is not a types module by adding an empty export.