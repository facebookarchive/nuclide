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

type RequestIdleCallback = (
  cb: (deadline: {didTimeout: boolean, timeRemaining: () => number}) => void,
  opts?: {timeout: number},
) => number;
type CancelIdleCallback = (id: number) => void ;

const requestIdleCallback: RequestIdleCallback = global.requestIdleCallback;
const cancelIdleCallback: CancelIdleCallback = global.cancelIdleCallback;

export default function scheduleIdleCallback(
  callback_: () => void,
  afterRemainingTime?: 30 | 40 | 49 = 49,
): IDisposable {
  let callback = callback_;
  let id;
  function fn(deadline) {
    if (deadline.timeRemaining() >= afterRemainingTime) {
      invariant(callback != null);
      callback(deadline);
      id = callback = null;
    } else {
      id = requestIdleCallback(fn);
    }
  }
  id = requestIdleCallback(fn);
  return {
    dispose() {
      if (id != null) {
        cancelIdleCallback(id);
        id = callback = null;
      }
    },
  };
}
