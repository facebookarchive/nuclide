'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * `scheduleIdleCallback` is a wrapper around `requestIdleCallback` that:
 *   - Returns a disposable.
 *   - Manages checking `timeRemaining`.
 *
 * `timeRemaining` is how much time the system thinks is available for your
 * work. `50` is the maximum allowed value. By choosing `49` for
 * `afterRemainingTime`, you're saying: "only invoke the callback when there
 * are 49ms available for me to do work". It was can take multiple loops around
 * `requestIdleCallback` for so much time to become available.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = scheduleIdleCallback;


const requestIdleCallback = global.requestIdleCallback;
const cancelIdleCallback = global.cancelIdleCallback;

function scheduleIdleCallback(callback_) {
  let afterRemainingTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 49;

  let callback = callback_;
  let id;
  function fn(deadline) {
    if (deadline.timeRemaining() >= afterRemainingTime) {
      if (!(callback != null)) {
        throw new Error('Invariant violation: "callback != null"');
      }

      callback(deadline);
      id = callback = null;
    } else {
      id = requestIdleCallback(fn);
    }
  }
  id = requestIdleCallback(fn);
  return {
    dispose: function () {
      if (id != null) {
        cancelIdleCallback(id);
        id = callback = null;
      }
    }
  };
}
module.exports = exports['default'];