Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = compareVersions;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Compare two version strings. This is much more lax than semver and allows, for example, versions
 * like "9".
 */

function compareVersions(a, b) {
  var aParts = a.split('.').map(function (x) {
    return parseInt(x, 10);
  });
  var bParts = b.split('.').map(function (x) {
    return parseInt(x, 10);
  });
  for (var i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    var aNumber = aParts[i] || 0;
    var bNumber = bParts[i] || 0;
    if (aNumber < bNumber) {
      return -1;
    }
    if (aNumber > bNumber) {
      return 1;
    }
  }
  return 0;
}

module.exports = exports.default;