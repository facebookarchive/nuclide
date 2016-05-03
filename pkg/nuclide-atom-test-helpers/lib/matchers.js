'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

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
function toEqualAtomRange(expected: ?atom$Range): boolean {
  return Boolean(this.actual && expected && this.actual.isEqual(expected));
}

/**
 * Same as `toEqualAtomRange` but for an array of Ranges. This function should
 * not be called directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the array of Ranges are equal.
 */
function toEqualAtomRanges(expected: ?Array<atom$Range>): boolean {
  let allEqual = true;
  if (!this.actual || !expected) {
    return false;
  }
  this.actual.some((range, index) => {
    invariant(expected); // Tell Flow this is definitely non-null now.
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
  toEqualAtomRange,
  toEqualAtomRanges,
};
