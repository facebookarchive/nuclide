'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = installErrorReporter;

var _atom = require('atom');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

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

let disposable;

function installErrorReporter() {
  if (disposable != null) {
    throw new Error('installErrorReporter was called multiple times.');
  }
  window.addEventListener('unhandledrejection', onUnhandledRejection);
  disposable = new _atom.CompositeDisposable(atom.onWillThrowError(onUnhandledException), new _atom.Disposable(() => {
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
    disposable = null;
  }));
  return disposable;
}

function onUnhandledException(event) {
  try {
    (0, (_log4js || _load_log4js()).getLogger)('installErrorReporter').error(`Caught unhandled exception: ${event.message}`, event.originalError);
  } catch (e) {
    // Ensure we don't recurse forever. Even under worst case scenarios.
  }
}

function onUnhandledRejection(event) {
  try {
    (0, (_log4js || _load_log4js()).getLogger)('installErrorReporter').error('Caught unhandled rejection', event.reason);
  } catch (e) {
    // Ensure we don't recurse forever. Even under worst case scenarios.
  }
}