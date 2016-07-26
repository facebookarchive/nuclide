'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export default function once<T>(fn: () => T): () => T {
  let fnMaybe: ?(() => T) = fn;
  let ret: ?T;
  return function(): T {
    // The type gymnastics here are so `fn` can be
    // garbage collected once we've used it.
    if (!fnMaybe) {
      return (ret: any);
    } else {
      ret = fnMaybe.apply(this, arguments);
      fnMaybe = null;
      return ret;
    }
  };
}
