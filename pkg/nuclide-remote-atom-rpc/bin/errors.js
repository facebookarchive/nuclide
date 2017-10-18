'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EXIT_CODE_INVALID_ARGUMENTS = exports.EXIT_CODE_CONNECTION_ERROR = exports.EXIT_CODE_APPLICATION_ERROR = exports.EXIT_CODE_UNKNOWN_ERROR = exports.EXIT_CODE_SUCCESS = undefined;
exports.setupErrorHandling = setupErrorHandling;
exports.setupLogging = setupLogging;
exports.reportConnectionErrorAndExit = reportConnectionErrorAndExit;
exports.reportErrorAndExit = reportErrorAndExit;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _os = _interopRequireDefault(require('os'));

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (_log4js || _load_log4js()).default.getLogger('nuclide-remote-atom-rpc'); /**
                                                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                                                          * All rights reserved.
                                                                                          *
                                                                                          * This source code is licensed under the license found in the LICENSE file in
                                                                                          * the root directory of this source tree.
                                                                                          *
                                                                                          * 
                                                                                          * @format
                                                                                          */

const EXIT_CODE_SUCCESS = exports.EXIT_CODE_SUCCESS = 0;
const EXIT_CODE_UNKNOWN_ERROR = exports.EXIT_CODE_UNKNOWN_ERROR = 1;
const EXIT_CODE_APPLICATION_ERROR = exports.EXIT_CODE_APPLICATION_ERROR = 2;
const EXIT_CODE_CONNECTION_ERROR = exports.EXIT_CODE_CONNECTION_ERROR = 3;
const EXIT_CODE_INVALID_ARGUMENTS = exports.EXIT_CODE_INVALID_ARGUMENTS = 4;

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
  // Initialize logging
  (0, (_nuclideLogging || _load_nuclideLogging()).initialUpdateConfig)();

  const config = {
    appenders: [(_nuclideLogging || _load_nuclideLogging()).FileAppender]
  };

  const serverLogAppenderConfig = (0, (_nuclideLogging || _load_nuclideLogging()).getServerLogAppenderConfig)();
  if (serverLogAppenderConfig) {
    config.appenders.push(serverLogAppenderConfig);
  }

  (_log4js || _load_log4js()).default.configure(config);
}

function reportConnectionErrorAndExit(detailMessage) {
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