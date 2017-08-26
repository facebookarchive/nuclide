'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialUpdateConfig = exports.getAdditionalLogFiles = exports.addAdditionalLogFile = exports.getServerLogAppenderConfig = exports.FileAppender = exports.getPathToLogFile = exports.getDefaultConfig = undefined;
exports.flushLogsAndExit = flushLogsAndExit;
exports.flushLogsAndAbort = flushLogsAndAbort;
exports.initializeLogging = initializeLogging;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
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
const initialUpdateConfig = exports.initialUpdateConfig = (0, (_once || _load_once()).default)(() => {
  (_log4js || _load_log4js()).default.configure((0, (_config || _load_config()).getDefaultConfig)());
});

function initializeLogging() {
  initialUpdateConfig();
}