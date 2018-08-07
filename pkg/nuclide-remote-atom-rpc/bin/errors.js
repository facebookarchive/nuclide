"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupErrorHandling = setupErrorHandling;
exports.setupLogging = setupLogging;
exports.reportConnectionErrorAndExit = reportConnectionErrorAndExit;
exports.reportErrorAndExit = reportErrorAndExit;
exports.FailedConnectionError = exports.EXIT_CODE_INVALID_ARGUMENTS = exports.EXIT_CODE_CONNECTION_ERROR = exports.EXIT_CODE_APPLICATION_ERROR = exports.EXIT_CODE_UNKNOWN_ERROR = exports.EXIT_CODE_SUCCESS = void 0;

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _nuclideLogging() {
  const data = require("../../nuclide-logging");

  _nuclideLogging = function () {
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
const logger = _log4js().default.getLogger('nuclide-remote-atom-rpc');

const EXIT_CODE_SUCCESS = 0;
exports.EXIT_CODE_SUCCESS = EXIT_CODE_SUCCESS;
const EXIT_CODE_UNKNOWN_ERROR = 1;
exports.EXIT_CODE_UNKNOWN_ERROR = EXIT_CODE_UNKNOWN_ERROR;
const EXIT_CODE_APPLICATION_ERROR = 2;
exports.EXIT_CODE_APPLICATION_ERROR = EXIT_CODE_APPLICATION_ERROR;
const EXIT_CODE_CONNECTION_ERROR = 3;
exports.EXIT_CODE_CONNECTION_ERROR = EXIT_CODE_CONNECTION_ERROR;
const EXIT_CODE_INVALID_ARGUMENTS = 4;
exports.EXIT_CODE_INVALID_ARGUMENTS = EXIT_CODE_INVALID_ARGUMENTS;

function setupErrorHandling() {
  process.on('uncaughtException', event => {
    logger.error(`Caught unhandled exception: ${event.message}`, event.originalError);
    process.stderr.write(`Unhandled exception: ${event.message}\n`);
    process.exit(EXIT_CODE_UNKNOWN_ERROR);
  });
  process.on('unhandledRejection', (error, promise) => {
    logger.error('Caught unhandled rejection', error);
    process.stderr.write(`Unhandled rejection: ${error.message}\n`);
    process.exit(EXIT_CODE_UNKNOWN_ERROR);
  });
}

function setupLogging() {
  (0, _nuclideLogging().initializeLogging)();
}

function reportConnectionErrorAndExit(error) {
  const detailMessage = error.message;
  process.stderr.write(`Error connecting to nuclide-server on ${_os.default.hostname()}:\n`);
  process.stderr.write(`  ${detailMessage}.\n`);
  process.stderr.write('\n');
  process.stderr.write('Potential fixes:\n');
  process.stderr.write('* Ensure Atom with Nuclide is open.\n');
  process.stderr.write(`* Verify Nuclide's current directory located on ${_os.default.hostname()}\n`);
  process.stderr.write('* Click the menu item "Nuclide/Kill Nuclide Server and Restart"\n');
  process.stderr.write('\n');
  process.stderr.write('Callstack:\n');
  process.stderr.write(new Error().stack);
  process.stderr.write('\n');
  process.exit(EXIT_CODE_CONNECTION_ERROR);
}

function reportErrorAndExit(error, exitCode) {
  process.stderr.write(error.stack);
  process.stderr.write('\n');
  process.exit(exitCode);
}

class FailedConnectionError extends Error {}

exports.FailedConnectionError = FailedConnectionError;