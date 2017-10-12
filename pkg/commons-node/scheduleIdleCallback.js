'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = typeof requestIdleCallback !== 'undefined' ? // Using Browser API
// Is guaranteed to resolve after `timeout` milliseconds.
function scheduleIdleCallback(callback_, options = {}) {
  const afterRemainingTime = options.afterRemainingTime || 49;
  // flowlint-next-line sketchy-null-number:off
  const timeout = options.timeout || 500;
  let callback = callback_;
  let id;
  const startTime = Date.now();
  function fn(deadline) {
    if (deadline.timeRemaining() >= afterRemainingTime || Date.now() - startTime >= timeout) {
      if (!(callback != null)) {
        throw new Error('Invariant violation: "callback != null"');
      }

      callback();
      id = callback = null;
    } else {
      id = requestIdleCallback(fn, {
        timeout: timeout - (Date.now() - startTime)
      });
    }
  }
  id = requestIdleCallback(fn, { timeout });
  return {
    dispose() {
      if (id != null) {
        cancelIdleCallback(id);
        id = callback = null;
      }
    }
  };
} : // Using Node API
function scheduleIdleCallback(callback, options) {
  const id = setImmediate(callback);
  return {
    dispose() {
      clearImmediate(id);
    }
  };
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

/* global requestIdleCallback, cancelIdleCallback */

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