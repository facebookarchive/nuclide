"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
 * Expected<T> tries to mimic llvm's Expected class.
 * This is specially useful for Observables that can return a stream of errors instead of closing
 * the subscription.
 */

class Expect {
  static error(error) {
    return {
      isError: true,
      isPending: false,
      error,
      getOrDefault(def) {
        return def;
      }
    };
  }

  static value(value) {
    return {
      isError: false,
      isPending: false,
      value,
      getOrDefault(def) {
        return this.value;
      }
    };
  }

  static pendingValue(value) {
    return {
      isError: false,
      isPending: true,
      value,
      getOrDefault(def) {
        return this.value;
      }
    };
  }
}
exports.Expect = Expect;