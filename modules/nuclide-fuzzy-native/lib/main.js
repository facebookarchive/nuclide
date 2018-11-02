"use strict";

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

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
const logger = (0, _log4js().getLogger)('nuclide-fuzzy-native'); // Use the pre-built, native module if available.
// If not, use the fallback JS implementation.

try {
  // eslint-disable-next-line nuclide-internal/no-commonjs
  module.exports = require('nuclide-prebuilt-libs/fuzzy-native');
} catch (e) {
  logger.error('Failed to load native fuzzy matching. Falling back to JS implementation', e); // eslint-disable-next-line nuclide-internal/no-commonjs

  module.exports = require("./FallbackMatcher");
}