"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expectedEqual = expectedEqual;
exports.Expect = void 0;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */

/**
 * This is a wrapper type useful for Observables to return errors during its stream
 * and later switch back to regular values if they recover. Normally, a source finishes after
 * passing an uncaught error.
 */
class Expect {
  static error(error) {
    return {
      isError: true,
      isPending: false,
      isValue: false,
      error,

      getOrDefault(def) {
        return def;
      },

      map(fn) {
        return Expect.error(error);
      }

    };
  }

  static value(value) {
    return {
      isError: false,
      isPending: false,
      isValue: true,
      value,

      getOrDefault(def) {
        return this.value;
      },

      map(fn) {
        return Expect.value(fn(value));
      }

    };
  }

  static pending() {
    return {
      isError: false,
      isPending: true,
      isValue: false,

      getOrDefault(def) {
        return def;
      },

      map(fn) {
        return Expect.pending();
      }

    };
  }

}

exports.Expect = Expect;

function expectedEqual(a, b, valueEqual, errorEqual) {
  if (a.isValue && b.isValue) {
    return valueEqual(a.value, b.value);
  } else if (a.isError && b.isError) {
    return errorEqual(a.error, b.error);
  } else if (a.isPending && b.isPending) {
    return true;
  } else {
    return false;
  }
}