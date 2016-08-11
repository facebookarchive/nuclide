'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

export default function debounce<
  A, B, C, D, E, F, G,
  TReturn,
  TFunc:(a: A, b: B, c: C, d: D, e: E, f: F, g: G) => TReturn,
>(
  func: TFunc,
  wait: number,
  immediate?: boolean = false,
): (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => (TReturn | void) {
  // Taken from: https://github.com/jashkenas/underscore/blob/b10b2e6d72/underscore.js#L815.
  let timeout: ?number;
  let args: ?[A, B, C, D, E, F, G];
  let context: any;
  let timestamp = 0;
  let result: (TReturn | void);

  const later = function() {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        invariant(args != null);
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  return function(): (TReturn | void) {
    context = this;
    args = (arguments: [A, B, C, D, E, F, G]);
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}
