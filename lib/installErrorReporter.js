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

function getCallStack() {
  try {
    throw new Error('Not an actual error: hack for getting call stack');
  } catch (err) {
    return err;
  }
}

function isNuclideInCallStack() {
  // Ignore the call sites from this file.
  const callStack = getCallStack()
    .getRawStack()
    .filter(
      callSite =>
        callSite.getFileName() &&
        !callSite.getFileName().includes('installErrorReporter.js'),
    );

  const nuclideCallSite = callStack.find(callSite =>
    callSite
      .toString()
      .toLowerCase()
      .includes('nuclide'),
  );

  return nuclideCallSite != null;
}

function handleAtomNotification(notification: atom$Notification) {
  // Only log notifications that are specific to Nuclide.
  if (notification.type === 'error' && isNuclideInCallStack()) {
    getLogger('atom-error-notification').error(
      notification.getMessage(),
      getCallStack(),
    );
  }
}
