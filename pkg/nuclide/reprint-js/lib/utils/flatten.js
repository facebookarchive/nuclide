'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type NestedArray<T> = Array<T | NestedArray<T>>;

/**
 * Completely flattens an array of arrays.
 */
function flatten<T>(arr: NestedArray<T>): Array<T> {
  while (arr.some(el => Array.isArray(el))) {
    arr = Array.prototype.concat.apply([], arr);
  }
  return (arr: any);
}

module.exports = flatten;
