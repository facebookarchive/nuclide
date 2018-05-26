/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {getLogger} from 'log4js';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

let disposable;

export default function installErrorReporter(): IDisposable {
  if (disposable != null) {
    throw new Error('installErrorReporter was called multiple times.');
  }
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  disposable = new UniversalDisposable(
    atom.onWillThrowError(onUnhandledException),
    atom.notifications.onDidAddNotification(handleAtomNotification),
    () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      disposable = null;
    },
  );
  return disposable;
}

function onUnhandledException(event) {
  try {
    getLogger('installErrorReporter').error(
      `Caught unhandled exception: ${event.message}`,
      event.originalError,
    );
  } catch (e) {
    // Ensure we don't recurse forever. Even under worst case scenarios.
  }
}

function onUnhandledRejection(event) {
  try {
    getLogger('installErrorReporter').error(
      'Caught unhandled rejection',
      event.reason,
    );
  } catch (e) {
    // Ensure we don't recurse forever. Even under worst case scenarios.
  }
}

function isNuclideInCallStack(callStack: Array<CallSite>) {
  const ignoreCallSitesFromThisFile = callSite => {
    const fileName = callSite.getFileName();
    return fileName != null && !fileName.includes('installErrorReporter.js');
  };
  const containsNuclideWord = callSite =>
    callSite
      .toString()
      .toLowerCase()
      .includes('nuclide');

  return callStack
    .filter(ignoreCallSitesFromThisFile)
    .some(containsNuclideWord);
}

function handleAtomNotification(notification: atom$Notification) {
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  if (notification.type !== 'error' && notification.type !== 'fatal') {
    return;
  }

  const error = Error(notification.getMessage());
  const {stack} = notification.getOptions();
  if (typeof stack === 'string' && stack) {
    error.stack = stack;
  } else {
    // This will exclude handleAtomNotification from the stack.
    Error.captureStackTrace(error, handleAtomNotification);
  }

  // $FlowFixMe: getRawStack() is missing from Error()
  const rawStack = error.getRawStack();
  if (rawStack == null || isNuclideInCallStack(rawStack)) {
    getLogger('atom-error-notification').error(error);
  }
}
