Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = normalizeEventString;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function normalizeEventString(str) {
  return str.replace(/\s+/g, '-').toLowerCase();
}

module.exports = exports.default;