"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = leftPad;

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
function leftPad(s, size, pad = ' ') {
  if (s.length >= size) {
    return s;
  }

  const padded = pad.repeat(size) + s;
  return padded.substr(padded.length - size);
}