'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupLogging = exports.EXIT_CODE_INVALID_ARGUMENTS = exports.EXIT_CODE_CONNECTION_ERROR = exports.EXIT_CODE_APPLICATION_ERROR = exports.EXIT_CODE_UNKNOWN_ERROR = exports.EXIT_CODE_SUCCESS = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let setupLogging = exports.setupLogging = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    // Initialize logging
    yield (0, (_nuclideLogging || _load_nuclideLogging()).initialUpdateConfig)();

    const config = {
      appenders: [(_nuclideLogging || _load_nuclideLogging()).FileAppender]
    };

    const serverLogAppenderConfig = yield (0, (_nuclideLogging || _load_nuclideLogging()).getServerLogAppenderConfig)();
    if (serverLogAppenderConfig) {
      config.appenders.push(serverLogAppenderConfig);
    }

    (0, (_nuclideLogging || _load_nuclideLogging()).updateConfig)(config);
  });

  return function setupLogging() {
    return _ref.apply(this, arguments);
  };
})();

exports.setupErrorHandling = setupErrorHandling;
exports.reportConnectionErrorAndExit = reportConnectionErrorAndExit;
exports.reportErrorAndExit = reportErrorAndExit;

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
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

function reportConnectionErrorAndExit(detailMessage) {
  process.stderr.write(`Error: ${detailMessage}.\n`);
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