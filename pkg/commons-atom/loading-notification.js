'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = loadingNotification;

var _promise;

function _load_promise() {
  return _promise = require('../commons-node/promise');
}

/**
 * Displays a loading notification while waiting for a promise.
 * Waits delayMs before actually showing the notification (to prevent flicker).
 */
function loadingNotification(promise, message) {
  let delayMs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;
  let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  let notif = null;
  const timeoutFn = () => {
    notif = atom.notifications.addInfo(message, _extends({
      dismissable: true
    }, options));
  };
  const cleanupFn = () => {
    if (notif) {
      notif.dismiss();
    }
  };
  return (0, (_promise || _load_promise()).triggerAfterWait)(promise, delayMs, timeoutFn, cleanupFn);
}
module.exports = exports['default'];