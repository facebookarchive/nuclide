

/**
 * Completely flattens an array of arrays.
 */
function flatten(arr_) {
  // For some reason, Flow hits a recursion limit when trying to typecheck this. Get out with `any`.
  var arr = arr_;
  while (arr.some(function (el) {
    return Array.isArray(el);
  })) {
    arr = Array.prototype.concat.apply([], arr);
  }
  return arr;
}

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = flatten;