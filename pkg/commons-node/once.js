"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = once;
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

function once(fn) {
  let fnMaybe = fn;
  let ret;
  return function (...args) {
    // The type gymnastics here are so `fn` can be
    // garbage collected once we've used it.
    if (!fnMaybe) {
      return ret;
    } else {
      ret = fnMaybe.apply(this, args);
      fnMaybe = null;
      return ret;
    }
  };
}