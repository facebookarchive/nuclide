/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
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

import invariant from 'assert';

export default global.requestIdleCallback ?
  // Using Browser API
  // Is guaranteed to resolve after `timeout` milliseconds.
  function scheduleIdleCallback(
    callback_: () => void,
    options?: {
      afterRemainingTime?: 30 | 40 | 49,
      timeout?: number,
    } = {},
  ): IDisposable {
    const afterRemainingTime = options.afterRemainingTime || 49;
    const timeout = options.timeout || 500;
    let callback = callback_;
    let id;
    const startTime = Date.now();
    function fn(deadline) {
      if (deadline.timeRemaining() >= afterRemainingTime ||
          Date.now() - startTime >= timeout) {
        invariant(callback != null);
        callback(deadline);
        id = callback = null;
      } else {
        id = global.requestIdleCallback(fn, {
          timeout: timeout - (Date.now() - startTime),
        });
      }
    }
    id = global.requestIdleCallback(fn, {timeout});
    return {
      dispose() {
        if (id != null) {
          global.cancelIdleCallback(id);
          id = callback = null;
        }
      },
    };
  } :

  // Using Node API
  function scheduleIdleCallback(
    callback: () => void,
    options?: {
      afterRemainingTime?: 30 | 40 | 49,
      timeout?: number,
    },
  ) {
    const id = global.setImmediate(callback);
    return {
      dispose() {
        global.clearImmediate(id);
      },
    };
  };

// Fake export to avoid babel's commonjs compat
export const __BABEL_CJS_COMPAT__ = {};
