'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createLoggerMiddleware;

var _reduxLogger;

function _load_reduxLogger() {
  return _reduxLogger = require('redux-logger');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('./feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
To turn on debug console logging for the feature you are debugging, add to your config.cson:

"*":
  "nuclide":
    "redux-debug-loggers": [
      "<YOUR_APP_NAME>"
    ]
*/

// More options can be found here if you wish to enable them:
// https://github.com/evgenyrodionov/redux-logger#options
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

const enabledLoggers = (_featureConfig || _load_featureConfig()).default.getWithDefaults('redux-debug-loggers', []);

const noopMiddleware = store => next => action => next(action);

function createLoggerMiddleware(appName, loggerConfig) {
  if (!enabledLoggers.includes(appName)) {
    return noopMiddleware;
  }

  return (0, (_reduxLogger || _load_reduxLogger()).createLogger)(loggerConfig);
}