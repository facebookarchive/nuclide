"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = blocked;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Copy of the npm package: blocked, but without the unref, because that doesn't work in apm tests.
 * https://github.com/tj/node-blocked/blob/master/index.js
 *
 * The blocked module checks and reports every event loop block time over a given threshold.
 * @return the interval handler.
 * To cancel, call clearInterval on the returned interval handler.
 */
function blocked(fn, intervalMs = 100, thresholdMs = 50) {
  let start = Date.now();
  const interval = setInterval(() => {
    const deltaMs = Date.now() - start;
    const blockTimeMs = deltaMs - intervalMs;

    if (blockTimeMs > thresholdMs) {
      fn(blockTimeMs);
    }

    start = Date.now();
  }, intervalMs);
  return new (_UniversalDisposable().default)(() => clearInterval(interval));
}