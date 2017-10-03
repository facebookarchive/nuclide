'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initializeLogging;
exports.initializeLoggerForWorker = initializeLoggerForWorker;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _os = _interopRequireDefault(require('os'));

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
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

const MAX_LOG_SIZE = 1024 * 1024;
const MAX_LOG_BACKUPS = 10;
const LOG_FILE_PATH = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'nuclide-js-imports-server.log');

// Configure log4js to not log to console, since
// writing arbitrary data to stdout will break JSON RPC if we're running over
// stdout.
//
// Additionally, add an appender to log over the rpc connection so logging appears
// in the client environment, independent of stdio, node rpc, socket, etc.
function initializeLogging(connection) {
  (_log4js || _load_log4js()).default.configure({
    appenders: [{
      type: 'logLevelFilter',
      level: process.argv.includes('--debug') ? 'DEBUG' : 'WARN',
      appender: {
        type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'fileAppender'),
        filename: LOG_FILE_PATH,
        maxLogSize: MAX_LOG_SIZE,
        backups: MAX_LOG_BACKUPS,
        layout: {
          type: 'pattern',
          // Format log in following pattern:
          // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
          pattern: `%d{ISO8601} %p (pid:${process.pid}) %c - %m`
        }
      }
    }, {
      type: 'logLevelFilter',
      level: process.argv.includes('--debug') ? 'DEBUG' : 'INFO',
      appender: {
        connection,
        type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'connectionConsoleAppender')
      }
    }]
  });

  // Don't let anything write to the true stdio as it could break JSON RPC
  global.console.log = connection.console.log.bind(connection.console);
  global.console.error = connection.console.error.bind(connection.console);

  const logger = (_log4js || _load_log4js()).default.getLogger();
  catchUnhandledExceptions(logger);
}

function initializeLoggerForWorker(logLevel) {
  (_log4js || _load_log4js()).default.configure({
    appenders: [{
      type: 'logLevelFilter',
      level: logLevel,
      appender: {
        type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'fileAppender'),
        filename: LOG_FILE_PATH,
        maxLogSize: MAX_LOG_SIZE,
        backups: MAX_LOG_BACKUPS,
        layout: {
          type: 'pattern',
          // Format log in following pattern:
          // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
          pattern: `%d{ISO8601} %p (pid:${process.pid}) %c - %m`
        }
      }
    }]
  });

  const logger = (_log4js || _load_log4js()).default.getLogger();
  catchUnhandledExceptions(logger);
  return logger;
}

function catchUnhandledExceptions(logger) {
  process.on('uncaughtException', e => {
    logger.error('uncaughtException', e);
    (_log4js || _load_log4js()).default.shutdown(() => process.abort());
  });
  process.on('unhandledRejection', e => logger.error('unhandledRejection', e));
}