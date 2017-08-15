'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = exports.appender = undefined;
exports.getNuclideConsoleMessages = getNuclideConsoleMessages;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

let sub = null;
function getSubject() {
  if (sub == null) {
    sub = new _rxjsBundlesRxMinJs.Subject();
  }
  return sub;
}

function getNuclideConsoleMessages() {
  return getSubject().asObservable();
}

function consoleAppender() {
  return loggingEvent => {
    getSubject().next(loggingEvent);
  };
}

const appender = exports.appender = consoleAppender;
const configure = exports.configure = consoleAppender;