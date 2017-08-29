'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEventObservable = getEventObservable;
exports.reportError = reportError;
exports.reportWarning = reportWarning;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

const customEvent$ = new _rxjsBundlesRxMinJs.Subject(); /**
                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                         * All rights reserved.
                                                         *
                                                         * This source code is licensed under the license found in the LICENSE file in
                                                         * the root directory of this source tree.
                                                         *
                                                         * 
                                                         * @format
                                                         */

function getEventObservable() {
  return customEvent$.asObservable();
}

function reportError(message) {
  customEvent$.next(['ReportError', message]);
}

function reportWarning(message) {
  customEvent$.next(['ReportWarning', message]);
}