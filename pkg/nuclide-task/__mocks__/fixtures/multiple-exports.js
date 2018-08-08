"use strict";

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
let total = 0;

function increment() {
  ++total;
}

function getTotal() {
  return total;
}

function product(...factors) {
  return factors.reduce((prev, current) => prev * current, 1);
}

function asyncFetch() {
  return Promise.resolve({
    ignoredByJsonSerialization: undefined,
    shouldShowUpInJsonSerialization: null
  });
} // eslint-disable-next-line nuclide-internal/no-commonjs


module.exports = {
  asyncFetch,
  getTotal,
  increment,
  product
};