'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Displays a loading notification while waiting for a promise.
 * Waits delayMs before actually showing the notification (to prevent flicker).
 */
async function withLoadingNotification<T>(
  promise: Promise<T>,
  message: string,
  delayMs: number = 100,
  options: Object = {},
): Promise<T> {
  let notif = null;
  const timeout = setTimeout(() => {
    notif = atom.notifications.addInfo(message, {
      dismissable: true,
      ...options,
    });
  }, delayMs);
  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
    if (notif) {
      notif.dismiss();
    }
  }
}

module.exports = withLoadingNotification;
