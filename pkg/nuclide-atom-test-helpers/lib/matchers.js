function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

/**
 * This file contains a set of custom matchers for jasmine testing, as described
 * here: http://jasmine.github.io/1.3/introduction.html#section-Writing_a_custom_matcher.
 */

/**
 * Determines if two Ranges are equal. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the Ranges are equal.
 */
function toEqualAtomRange(expected) {
  return Boolean(this.actual && expected && this.actual.isEqual(expected));
}

/**
 * Same as `toEqualAtomRange` but for an array of Ranges. This function should
 * not be called directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the array of Ranges are equal.
 */
function toEqualAtomRanges(expected) {
  var allEqual = true;
  if (!this.actual || !expected) {
    return false;
  }
  this.actual.some(function (range, index) {
    (0, (_assert2 || _assert()).default)(expected); // Tell Flow this is definitely non-null now.
    if (range.isEqual(expected[index])) {
      return false;
    } else {
      allEqual = false;
      return true;
    }
  });
  return allEqual;
}

module.exports = {
  toEqualAtomRange: toEqualAtomRange,
  toEqualAtomRanges: toEqualAtomRanges
};