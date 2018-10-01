"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flushLogsAndExit = flushLogsAndExit;
exports.flushLogsAndAbort = flushLogsAndAbort;
exports.setupLoggingService = setupLoggingService;
Object.defineProperty(exports, "getDefaultConfig", {
  enumerable: true,
  get: function () {
    return _config().getDefaultConfig;
  }
});
Object.defineProperty(exports, "getPathToLogDir", {
  enumerable: true,
  get: function () {
    return _config().getPathToLogDir;
  }
});
Object.defineProperty(exports, "getPathToLogFile", {
  enumerable: true,
  get: function () {
    return _config().getPathToLogFile;
  }
});
exports.initializeLogging = void 0;

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../../modules/nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function rawAnalyticsService() {
  const data = _interopRequireWildcard(require("../../nuclide-analytics/lib/track"));

  rawAnalyticsService = function () {
    return data;
  };

  return data;
}

function _once() {
  const data = _interopRequireDefault(require("../../commons-node/once"));

  _once = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/**
 * This designed for logging on both Nuclide client and Nuclide server. It is based on [log4js]
 * (https://www.npmjs.com/package/log4js) with the ability to lazy initialize and update config
 * after initialized.
 * To make sure we only have one instance of log4js logger initialized globally, we save the logger
 * to `global` object.
 */
function flushLogsAndExit(exitCode) {
  _log4js().default.shutdown(() => process.exit(exitCode));
}

function flushLogsAndAbort() {
  _log4js().default.shutdown(() => process.abort());
}
/**
 * Push initial default config to log4js.
 * Execute only once.
 */


const initializeLogging = (0, _once().default)(() => {
  setupLoggingService();

  _log4js().default.configure((0, _config().getDefaultConfig)());
});
exports.initializeLogging = initializeLogging;

function setupLoggingService() {
  (0, _analytics().setRawAnalyticsService)(rawAnalyticsService());
}