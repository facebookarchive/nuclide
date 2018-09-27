"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseLogLevel = parseLogLevel;

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
function parseLogLevel(s, _default) {
  if (s === 'ALL' || s === 'TRACE' || s === 'DEBUG' || s === 'INFO' || s === 'WARN' || s === 'ERROR' || s === 'FATAL' || s === 'OFF') {
    return s;
  }

  return _default;
}