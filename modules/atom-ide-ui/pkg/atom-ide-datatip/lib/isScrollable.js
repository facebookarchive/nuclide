"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isScrollable;
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function isScrollable(element, wheelEvent) {
  let node = wheelEvent.target;
  while (node != null && node !== element) {
    if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}