Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.setupErrorHandling = setupErrorHandling;

var setupLogging = _asyncToGenerator(function* () {
  // Initialize logging
  yield (0, (_nuclideLogging2 || _nuclideLogging()).initialUpdateConfig)();

  var config = {
    appenders: [(_nuclideLogging2 || _nuclideLogging()).CurrentDateFileAppender]
  };

  var serverLogAppenderConfig = yield (0, (_nuclideLogging2 || _nuclideLogging()).getServerLogAppenderConfig)();
  if (serverLogAppenderConfig) {
    config.appenders.push(serverLogAppenderConfig);
  }

  (0, (_nuclideLogging2 || _nuclideLogging()).updateConfig)(config);
});

exports.setupLogging = setupLogging;
exports.reportConnectionErrorAndExit = reportConnectionErrorAndExit;
exports.reportErrorAndExit = reportErrorAndExit;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var EXIT_CODE_SUCCESS = 0;
exports.EXIT_CODE_SUCCESS = EXIT_CODE_SUCCESS;
var EXIT_CODE_UNKNOWN_ERROR = 1;
exports.EXIT_CODE_UNKNOWN_ERROR = EXIT_CODE_UNKNOWN_ERROR;
var EXIT_CODE_APPLICATION_ERROR = 2;
exports.EXIT_CODE_APPLICATION_ERROR = EXIT_CODE_APPLICATION_ERROR;
var EXIT_CODE_CONNECTION_ERROR = 3;

exports.EXIT_CODE_CONNECTION_ERROR = EXIT_CODE_CONNECTION_ERROR;

function setupErrorHandling() {
  process.on('uncaughtException', function (event) {
    logger.error('Caught unhandled exception: ' + event.message, event.originalError);
    process.stderr.write('Unhandled exception: ' + event.message + '\n');
    process.exit(EXIT_CODE_UNKNOWN_ERROR);
  });

  process.on('unhandledRejection', function (error, promise) {
    logger.error('Caught unhandled rejection', error);
    process.stderr.write('Unhandled rejection: ' + error.message + '\n');
    process.exit(EXIT_CODE_UNKNOWN_ERROR);
  });
}

function reportConnectionErrorAndExit(detailMessage) {
  process.stderr.write('Error: ' + detailMessage + '.\n');
  process.stderr.write('Do you have Atom with Nuclide open?\n');
  process.stderr.write(new Error().stack);
  process.stderr.write('\n');
  process.exit(EXIT_CODE_CONNECTION_ERROR);
}

function reportErrorAndExit(error, exitCode) {
  process.stderr.write(error.stack);
  process.stderr.write('\n');
  process.exit(exitCode);
}