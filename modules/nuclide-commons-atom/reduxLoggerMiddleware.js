"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createLoggerMiddleware;

function _reduxLogger() {
  const data = require("redux-logger");

  _reduxLogger = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("./feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const enabledLoggers = _featureConfig().default.getWithDefaults('redux-debug-loggers', []);

const noopMiddleware = store => next => action => next(action);

function createLoggerMiddleware(appName, loggerConfig) {
  if (!enabledLoggers.includes(appName)) {
    return noopMiddleware;
  }

  return (0, _reduxLogger().createLogger)(loggerConfig);
}