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
function flatten<T>(arr_: NestedArray<T>): Array<T> {
  // For some reason, Flow hits a recursion limit when trying to typecheck this. Get out with `any`.
  let arr: any = arr_;
  while (arr.some(el => Array.isArray(el))) {
    arr = Array.prototype.concat.apply([], arr);
  }
  return (arr: any);
}

module.exports = flatten;
