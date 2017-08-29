'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createLoggerMiddleware;

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

const enabledLoggers = (_featureConfig || _load_featureConfig()).default.getWithDefaults('redux-debug-loggers', []); /**
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

/* eslint-disable no-console */


const noopMiddleware = store => next => action => next(action);

const titleStyle = 'color: gray; font-weight: lighter;';
const actionTypeStyle = 'color: black; font-weight: bold;';
const actionStyle = 'color: #03A9F4; font-weight: bold';
const nextStateStyle = 'color: #4CAF50; font-weight: bold';

function createLoggerMiddleware(appName) {
  if (!enabledLoggers.includes(appName)) {
    return noopMiddleware;
  }

  return store => next => action => {
    const nextAction = next(action);
    const nextState = store.getState();
    const title = `%c Redux Loggger (${appName}) action: %c ${action.type}`;
    console.group(title, titleStyle, actionTypeStyle);
    console.log('%c action    ', actionStyle, action);
    console.log('%c next state', nextStateStyle, nextState);
    console.groupEnd();
    return nextAction;
  };
}