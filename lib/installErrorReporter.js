"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = installErrorReporter;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
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
let disposable;

function installErrorReporter() {
  if (disposable != null) {
    throw new Error('installErrorReporter was called multiple times.');
  }

  window.addEventListener('unhandledrejection', onUnhandledRejection);
  disposable = new (_UniversalDisposable().default)(atom.onWillThrowError(onUnhandledException), atom.notifications.onDidAddNotification(handleAtomNotification), () => {
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
    disposable = null;
  });
  return disposable;
}

function onUnhandledException(event) {
  try {
    (0, _log4js().getLogger)('installErrorReporter').error(`Caught unhandled exception: ${event.message}`, event.originalError);
  } catch (e) {// Ensure we don't recurse forever. Even under worst case scenarios.
  }
}

function onUnhandledRejection(event) {
  try {
    (0, _log4js().getLogger)('installErrorReporter').error('Caught unhandled rejection', event.reason);
  } catch (e) {// Ensure we don't recurse forever. Even under worst case scenarios.
  }
}

function isNuclideInCallStack(callStack) {
  const ignoreCallSitesFromThisFile = callSite => {
    const fileName = callSite.getFileName();
    return fileName != null && !fileName.includes('installErrorReporter.js');
  };

  const containsNuclideWord = callSite => callSite.toString().toLowerCase().includes('nuclide');

  return callStack.filter(ignoreCallSitesFromThisFile).some(containsNuclideWord);
}

function handleAtomNotification(notification) {
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  if (notification.type !== 'error' && notification.type !== 'fatal') {
    return;
  }

  const error = Error(notification.getMessage());
  const {
    stack
  } = notification.getOptions();

  if (typeof stack === 'string' && stack) {
    error.stack = stack;
  } else {
    // This will exclude handleAtomNotification from the stack.
    Error.captureStackTrace(error, handleAtomNotification);
  } // $FlowFixMe: getRawStack() is missing from Error()


  const rawStack = error.getRawStack();

  if (rawStack == null || isNuclideInCallStack(rawStack)) {
    (0, _log4js().getLogger)('atom-error-notification').error(error);
  }
}