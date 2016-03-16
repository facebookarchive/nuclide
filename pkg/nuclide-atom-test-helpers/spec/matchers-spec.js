'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Range} = require('atom');
const {jasmineMatchers} = require('..');

describe('atom-test-helpers/matchers', () => {
  beforeEach(function() {
    this.addMatchers(jasmineMatchers);
  });

  describe('toEqualAtomRange', () => {
    it('determines when two Ranges are equal.', () => {
      expect(new Range([0,0], [0,0])).toEqualAtomRange(new Range([0,0], [0,0]));
      expect(new Range([0,0], [0,0])).not.toEqualAtomRange(new Range([1,0], [0,0]));
    });
  });

  describe('toEqualAtomRanges', () => {
    it('determines when two arrays of Ranges are equal.', () => {
      const ranges = [new Range([0,0], [0,0]), new Range([1,1], [1,1])];
      const sameRanges = [new Range([0,0], [0,0]), new Range([1,1], [1,1])];
      const differentRanges = [new Range([0,0], [0,0]), new Range([2,2], [2,2])];
      expect(ranges).toEqualAtomRanges(sameRanges);
      expect(ranges).not.toEqualAtomRanges(differentRanges);
    });
  });
});
