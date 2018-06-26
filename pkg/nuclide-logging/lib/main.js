'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLogging = exports.getPathToLogFile = exports.getPathToLogDir = exports.getDefaultConfig = undefined;
exports.flushLogsAndExit = flushLogsAndExit;
exports.flushLogsAndAbort = flushLogsAndAbort;
exports.setupLoggingService = setupLoggingService;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _analytics;

function _load_analytics() {
  return _analytics = require('../../../modules/nuclide-commons/analytics');
}

var _track;

function _load_track() {
  return _track = _interopRequireWildcard(require('../../nuclide-analytics/lib/track'));
}

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('../../commons-node/once'));
}

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getDefaultConfig = (_config || _load_config()).getDefaultConfig;
exports.getPathToLogDir = (_config || _load_config()).getPathToLogDir;
exports.getPathToLogFile = (_config || _load_config()).getPathToLogFile; /**
                                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                                          * All rights reserved.
                                                                          *
                                                                          * This source code is licensed under the license found in the LICENSE file in
                                                                          * the root directory of this source tree.
                                                                          *
                                                                          *  strict-local
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
const initializeLogging = exports.initializeLogging = (0, (_once || _load_once()).default)(() => {
  setupLoggingService();
  (_log4js || _load_log4js()).default.configure((0, (_config || _load_config()).getDefaultConfig)());
});

function setupLoggingService() {
  (0, (_analytics || _load_analytics()).setRawAnalyticsService)(_track || _load_track());
}