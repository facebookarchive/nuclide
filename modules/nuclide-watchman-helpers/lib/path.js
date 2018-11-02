"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWatchmanBinaryPath = getWatchmanBinaryPath;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const WATCHMAN_DEFAULT_PATH = '/usr/local/bin/watchman';

async function getWatchmanBinaryPath() {
  try {
    const stats = await _fsPromise().default.stat(WATCHMAN_DEFAULT_PATH); // `stats` contains a `mode` property, a number which can be used to determine
    // whether this file is executable. However, the number is platform-dependent.

    if (stats && stats.isFile()) {
      return WATCHMAN_DEFAULT_PATH;
    }
  } catch (e) {} // Suppress the error.
  // Let the watchman Client find the watchman binary via the default env PATH.


  return 'watchman';
}