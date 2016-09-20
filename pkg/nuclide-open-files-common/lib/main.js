Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.convertRange = convertRange;

// Workaround for flow

function convertRange(range) {
  return {
    start: range.start,
    end: range.end
  };
}