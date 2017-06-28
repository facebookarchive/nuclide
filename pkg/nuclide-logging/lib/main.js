'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialUpdateConfig = exports.getAdditionalLogFiles = exports.addAdditionalLogFile = exports.getServerLogAppenderConfig = exports.FileAppender = exports.getPathToLogFile = exports.getDefaultConfig = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.flushLogsAndExit = flushLogsAndExit;
exports.flushLogsAndAbort = flushLogsAndAbort;
exports.initializeLogging = initializeLogging;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _stacktrace;

function _load_stacktrace() {
  return _stacktrace = _interopRequireDefault(require('./stacktrace'));
}

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('../../commons-node/once'));
}

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getDefaultConfig = (_config || _load_config()).getDefaultConfig;
exports.getPathToLogFile = (_config || _load_config()).getPathToLogFile;
exports.FileAppender = (_config || _load_config()).FileAppender;
exports.getServerLogAppenderConfig = (_config || _load_config()).getServerLogAppenderConfig;
exports.addAdditionalLogFile = (_config || _load_config()).addAdditionalLogFile;
exports.getAdditionalLogFiles = (_config || _load_config()).getAdditionalLogFiles; /**
                                                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                                                    * All rights reserved.
                                                                                    *
                                                                                    * This source code is licensed under the license found in the LICENSE file in
                                                                                    * the root directory of this source tree.
                                                                                    *
                                                                                    * 
                                                                                    * @format
                                                                                    */

/**
 * This designed for logging on both Nuclide client and Nuclide server. It is based on [log4js]
 * (https://www.npmjs.com/package/log4js) with the ability to lazy initialize and update config
 * after initialized.
 * To make sure we only have one instance of log4js logger initialized globally, we save the logger
 * to `global` object.
 */

function flushLogsAndExit(exitCode) {
  (_log4js || _load_log4js()).default.shutdown(() => process.exit(exitCode));
}

function flushLogsAndAbort() {
  (_log4js || _load_log4js()).default.shutdown(() => process.abort());
}

/**
 * Push initial default config to log4js.
 * Execute only once.
 */
const initialUpdateConfig = exports.initialUpdateConfig = (0, (_once || _load_once()).default)((() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const defaultConfig = yield (0, (_config || _load_config()).getDefaultConfig)();
    (_log4js || _load_log4js()).default.configure(defaultConfig);
  });

  function initialUpdateConfig() {
    return _ref.apply(this, arguments);
  }

  return initialUpdateConfig;
})());

function initializeLogging() {
  (0, (_stacktrace || _load_stacktrace()).default)();
  initialUpdateConfig();
}