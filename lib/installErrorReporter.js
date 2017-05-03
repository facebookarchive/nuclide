'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = installErrorReporter;

var _atom = require('atom');

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../pkg/nuclide-logging');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
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
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Caught unhandled exception: ${event.message}`, event.originalError);
  } catch (e) {
    // Ensure we don't recurse forever. Even under worst case scenarios.
  }
}

function onUnhandledRejection(event) {
  try {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Caught unhandled rejection', event.reason);
  } catch (e) {
    // Ensure we don't recurse forever. Even under worst case scenarios.
  }
}