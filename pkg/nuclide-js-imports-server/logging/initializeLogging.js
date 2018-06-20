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

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _os = _interopRequireDefault(require('os'));

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MAX_LOG_SIZE = 16 * 1024; /**
                                 * Copyright (c) 2015-present, Facebook, Inc.
                                 * All rights reserved.
                                 *
                                 * This source code is licensed under the license found in the LICENSE file in
                                 * the root directory of this source tree.
                                 *
                                 * 
                                 * @format
                                 */

const MAX_LOG_BACKUPS = 1;
const LOG_FILE_PATH = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'nuclide-js-imports-server.log');

// Configure log4js to not log to console, since
// writing arbitrary data to stdout will break JSON RPC if we're running over
// stdout.
//
// Additionally, add an appender to log over the rpc connection so logging appears
// in the client environment, independent of stdio, node rpc, socket, etc.
function initializeLogging(connection) {
  (0, (_nuclideLogging || _load_nuclideLogging()).setupLoggingService)();
  (_log4js || _load_log4js()).default.configure({
    appenders: [{
      type: 'logLevelFilter',
      level: 'DEBUG',
      appender: {
        connection,
        type: require.resolve('../../nuclide-lsp-implementation-common/connectionConsoleAppender')
      }
    }]
  });

  // Don't let anything write to the true stdio as it could break JSON RPC
  global.console.log = connection.console.log.bind(connection.console);
  global.console.error = connection.console.error.bind(connection.console);
  catchUnhandledExceptions();
}

function initializeLoggerForWorker() {
  // TODO: Ideally worker messages would go to the parent, which could send them back to the client.
  (0, (_nuclideLogging || _load_nuclideLogging()).setupLoggingService)();
  (_log4js || _load_log4js()).default.configure({
    appenders: [{
      type: 'logLevelFilter',
      level: 'DEBUG',
      appender: {
        type: 'file',
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
  catchUnhandledExceptions();
}

function catchUnhandledExceptions() {
  const logger = (_log4js || _load_log4js()).default.getLogger('js-imports-server');
  process.on('uncaughtException', e => {
    logger.error('uncaughtException', e);
    (_log4js || _load_log4js()).default.shutdown(() => process.abort());
  });
  process.on('unhandledRejection', e => logger.error('unhandledRejection', e));
}