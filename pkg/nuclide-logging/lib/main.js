'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAdditionalLogFiles = exports.addAdditionalLogFile = exports.getServerLogAppenderConfig = exports.FileAppender = exports.getPathToLogFile = exports.getDefaultConfig = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.flushLogsAndExit = flushLogsAndExit;
exports.flushLogsAndAbort = flushLogsAndAbort;
exports.updateConfig = updateConfig;
exports.initialUpdateConfig = initialUpdateConfig;
exports.getLogger = getLogger;
exports.getCategoryLogger = getCategoryLogger;

var _stacktrace;

function _load_stacktrace() {
  return _stacktrace = _interopRequireDefault(require('./stacktrace'));
}

var _singleton;

function _load_singleton() {
  return _singleton = _interopRequireDefault(require('../../commons-node/singleton'));
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
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

/**
 * This designed for logging on both Nuclide client and Nuclide server. It is based on [log4js]
 * (https://www.npmjs.com/package/log4js) with the ability to lazy initialize and update config
 * after initialized.
 * To make sure we only have one instance of log4js logger initialized globally, we save the logger
 * to `global` object.
 */
exports.getDefaultConfig = (_config || _load_config()).getDefaultConfig;
exports.getPathToLogFile = (_config || _load_config()).getPathToLogFile;
exports.FileAppender = (_config || _load_config()).FileAppender;
exports.getServerLogAppenderConfig = (_config || _load_config()).getServerLogAppenderConfig;
exports.addAdditionalLogFile = (_config || _load_config()).addAdditionalLogFile;
exports.getAdditionalLogFiles = (_config || _load_config()).getAdditionalLogFiles;

/* Listed in order of severity. */

const DEFAULT_LOGGER_CATEGORY = 'nuclide';
const INITIAL_UPDATE_CONFIG_KEY = '_initial_update_config_key_';

function getCategory(category) {
  return category ? category : DEFAULT_LOGGER_CATEGORY;
}

function flushLogsAndExit(exitCode) {
  (_log4js || _load_log4js()).default.shutdown(() => process.exit(exitCode));
}

function flushLogsAndAbort() {
  (_log4js || _load_log4js()).default.shutdown(() => process.abort());
}

/**
 * Get log4js logger instance which is also singleton per category.
 * log4js.getLogger() API internally should already provide singleton per category guarantee
 * see https://github.com/nomiddlename/log4js-node/blob/master/lib/log4js.js#L120 for details.
 */
function getLog4jsLogger(category) {
  return (_log4js || _load_log4js()).default.getLogger(category);
}

function updateConfig(config, options) {
  // update config takes affect global to all existing and future loggers.
  (_log4js || _load_log4js()).default.configure(config, options);
}

// Create a lazy logger that will not initialize the underlying log4js logger until
// `lazyLogger.$level(...)` is called. This way, another package could require nuclide-logging
// during activation without worrying about introducing a significant startup cost.
function createLazyLogger(category) {
  function createLazyLoggerMethod(level) {
    return function (...args) {
      const logger = getLog4jsLogger(category);

      if (!logger) {
        throw new Error('Invariant violation: "logger"');
      }

      logger[level](...args);
    };
  }

  function setLoggerLevelHelper(level) {
    const logger = getLog4jsLogger(category);

    if (!logger) {
      throw new Error('Invariant violation: "logger"');
    }

    logger.setLevel(level);
  }

  function isLevelEnabledHelper(level) {
    const logger = getLog4jsLogger(category);

    if (!logger) {
      throw new Error('Invariant violation: "logger"');
    }

    return logger.isLevelEnabled(level);
  }

  return {
    debug: createLazyLoggerMethod('debug'),
    error: createLazyLoggerMethod('error'),
    fatal: createLazyLoggerMethod('fatal'),
    info: createLazyLoggerMethod('info'),
    trace: createLazyLoggerMethod('trace'),
    warn: createLazyLoggerMethod('warn'),
    isLevelEnabled: isLevelEnabledHelper,
    setLevel: setLoggerLevelHelper
  };
}

/**
 * Push initial default config to log4js.
 * Execute only once.
 */
function initialUpdateConfig() {
  return (_singleton || _load_singleton()).default.get(INITIAL_UPDATE_CONFIG_KEY, (0, _asyncToGenerator.default)(function* () {
    const defaultConfig = yield (0, (_config || _load_config()).getDefaultConfig)();
    updateConfig(defaultConfig);
  }));
}

// Get Logger instance which is singleton per logger category.
function getLogger(category) {
  (0, (_stacktrace || _load_stacktrace()).default)();
  initialUpdateConfig();

  const loggerCategory = getCategory(category);
  return (_singleton || _load_singleton()).default.get(loggerCategory, () => {
    return createLazyLogger(loggerCategory);
  });
}

// Utility function that returns a wrapper logger for input category.
function getCategoryLogger(category) {
  function setLogLevel(level) {
    getLogger(category).setLevel(level);
  }

  function logHelper(level, message) {
    const logger = getLogger(category);
    // isLevelEnabled() is required to reduce the amount of logging to
    // log4js which greatly improves performance.
    if (logger.isLevelEnabled(level)) {
      logger[level](message);
    }
  }

  function logTrace(message) {
    logHelper('trace', message);
  }

  function log(message) {
    logHelper('debug', message);
  }

  function logInfo(message) {
    logHelper('info', message);
  }

  function logError(message) {
    logHelper('error', message);
  }

  function logErrorAndThrow(message) {
    logError(message);
    logError(new Error().stack);
    throw new Error(message);
  }

  return {
    log,
    logTrace,
    logInfo,
    logError,
    logErrorAndThrow,
    setLogLevel
  };
}