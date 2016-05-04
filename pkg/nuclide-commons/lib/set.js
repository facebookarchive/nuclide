Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.intersect = intersect;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function intersect(a, b) {
  return new Set(Array.from(a).filter(function (e) {
    return b.has(e);
  }));
}