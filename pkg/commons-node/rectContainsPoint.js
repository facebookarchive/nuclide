"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rectContainsPoint;
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

function rectContainsPoint(rect, point) {
  return point.x >= rect.left && point.y >= rect.top && point.x <= rect.right && point.y <= rect.bottom;
}