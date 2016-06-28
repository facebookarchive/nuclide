Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.flushLogsAndExit = flushLogsAndExit;
exports.flushLogsAndAbort = flushLogsAndAbort;
exports.updateConfig = updateConfig;
exports.initialUpdateConfig = initialUpdateConfig;
exports.getLogger = getLogger;
exports.getCategoryLogger = getCategoryLogger;
exports.getPathToLogFileForToday = getPathToLogFileForToday;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/* Listed in order of severity. */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This designed for logging on both Nuclide client and Nuclide server. It is based on [log4js]
 * (https://www.npmjs.com/package/log4js) with the ability to lazy initialize and update config
 * after initialized.
 * To make sure we only have one instance of log4js logger initialized globally, we save the logger
 * to `global` object.
 */

var _stacktrace2;

function _stacktrace() {
  return _stacktrace2 = _interopRequireDefault(require('./stacktrace'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeSingleton2;

function _commonsNodeSingleton() {
  return _commonsNodeSingleton2 = _interopRequireDefault(require('../../commons-node/singleton'));
}

var DEFAULT_LOGGER_CATEGORY = 'nuclide';
var INITIAL_UPDATE_CONFIG_KEY = '_initial_update_config_key_';

function getCategory(category) {
  return category ? category : DEFAULT_LOGGER_CATEGORY;
}

function flushLogsAndExit(exitCode) {
  var log4js = require('log4js');
  log4js.shutdown(function () {
    return process.exit(exitCode);
  });
}

function flushLogsAndAbort() {
  var log4js = require('log4js');
  log4js.shutdown(function () {
    return process.abort();
  });
}

/**
 * Get log4js logger instance which is also singleton per category.
 * log4js.getLogger() API internally should already provide singleton per category guarantee
 * see https://github.com/nomiddlename/log4js-node/blob/master/lib/log4js.js#L120 for details.
 */
function getLog4jsLogger(category) {
  var log4js = require('log4js');
  return log4js.getLogger(category);
}

function updateConfig(config, options) {
  // update config takes affect global to all existing and future loggers.
  var log4js = require('log4js');
  log4js.configure(config, options);
}

// Create a lazy logger that will not initialize the underlying log4js logger until
// `lazyLogger.$level(...)` is called. This way, another package could require nuclide-logging
// during activation without worrying about introducing a significant startup cost.
function createLazyLogger(category) {
  function createLazyLoggerMethod(level) {
    return function () {
      var logger = getLog4jsLogger(category);
      (0, (_assert2 || _assert()).default)(logger);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      logger[level].apply(logger, args);
    };
  }

  function setLoggerLevelHelper(level) {
    var logger = getLog4jsLogger(category);
    (0, (_assert2 || _assert()).default)(logger);
    logger.setLevel(level);
  }

  function isLevelEnabledHelper(level) {
    var logger = getLog4jsLogger(category);
    (0, (_assert2 || _assert()).default)(logger);
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
  return (_commonsNodeSingleton2 || _commonsNodeSingleton()).default.get(INITIAL_UPDATE_CONFIG_KEY, _asyncToGenerator(function* () {
    var defaultConfig = yield require('./config').getDefaultConfig();
    updateConfig(defaultConfig);
  }));
}

// Get Logger instance which is singleton per logger category.

function getLogger(category) {
  (0, (_stacktrace2 || _stacktrace()).default)();
  initialUpdateConfig();

  var loggerCategory = getCategory(category);
  return (_commonsNodeSingleton2 || _commonsNodeSingleton()).default.get(loggerCategory, function () {
    return createLazyLogger(loggerCategory);
  });
}

// Utility function that returns a wrapper logger for input category.

function getCategoryLogger(category) {
  function setLogLevel(level) {
    getLogger(category).setLevel(level);
  }

  function logHelper(level, message) {
    var logger = getLogger(category);
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
    log: log,
    logTrace: logTrace,
    logInfo: logInfo,
    logError: logError,
    logErrorAndThrow: logErrorAndThrow,
    setLogLevel: setLogLevel
  };
}

function getPathToLogFileForToday() {
  return require('./config').getPathToLogFileForToday();
}