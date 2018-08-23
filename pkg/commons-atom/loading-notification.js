"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadingNotification;

function _promise() {
  const data = require("../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
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

/**
 * Displays a loading notification while waiting for a promise.
 * Waits delayMs before actually showing the notification (to prevent flicker).
 */
function loadingNotification(promise, message, delayMs = 100, options = {}) {
  let notif = null;

  const timeoutFn = () => {
    notif = atom.notifications.addInfo(message, Object.assign({
      dismissable: true
    }, options));
  };

  const cleanupFn = () => {
    if (notif) {
      notif.dismiss();
    }
  };

  return (0, _promise().triggerAfterWait)(promise, delayMs, timeoutFn, cleanupFn);
}