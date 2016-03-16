'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {computeDiff, getLineCountWithOffsets, getOffsetLineNumber} from '../lib/diff-utils';

describe('diff-utils', () => {
  describe('computeDiff()', () => {
    it('diffs two empty texts', () => {
      const {addedLines, removedLines, oldLineOffsets, newLineOffsets} = computeDiff('', '');
      expect(addedLines).toEqual([]);
      expect(removedLines).toEqual([]);
      expect(oldLineOffsets.size).toBe(0);
      expect(newLineOffsets.size).toBe(0);
    });

    it('diffs simple text with one line changes', () => {
      const {addedLines, removedLines, oldLineOffsets, newLineOffsets} = computeDiff(
`simple text
on multiline
same end line`,
`on multiline
added text
same end line`
      );

      expect(addedLines).toEqual([1]); // the second line is newly added.
      expect(removedLines).toEqual([0]); // the first line was removed.
      expect(oldLineOffsets).toEqual(new Map([[2, 1]])); // offset 1 for the new added line.
      expect(newLineOffsets).toEqual(new Map([[0, 1]])); // offset 1 for the first removed line.
    });

    it('diffs multi-line text changes', () => {
      const {addedLines, removedLines, oldLineOffsets, newLineOffsets} = computeDiff(
`This text is intended for testing.
If we test at too low a level,
testing for matching tags
with pattern matching,
our tests will be BAD.
The slightest change in layout,
could break a large number of tests.
`, `This text is intended for testing.
with pattern matching,
adding different two lines
replacing the two lines removed above!
our tests will be BAD.
The slightest change in layout,
could break a large number of tests.
adding a non-new-line line`
      );

      expect(addedLines).toEqual([2, 3, 7]); // 2 lines were added in the middle and one at the end.
      // 2 lines were removed in the middle and last new-line replaced.
      expect(removedLines).toEqual([1, 2, 7]);
      expect(oldLineOffsets).toEqual(new Map([[4, 2]])); // offset 2 for the 2 lines added.
      expect(newLineOffsets).toEqual(new Map([[1, 2]])); // offset 2 for the 2 lines removed.
    });

  });

  describe('getLineCountWithOffsets()', () => {

    it('gets the same number of lines when no offsets', () => {
      expect(getLineCountWithOffsets('line-1\nline-2\nline-3', new Map())).toBe(3);
    });

    it('gets the line numbers with offsets', () => {
      expect(getLineCountWithOffsets('line-1\nline-2\nline-3', new Map([[0, 2], [2, 1]]))).toBe(6);
    });

  });

  describe('getOffsetLineNumber()', () => {

    it('return the same line number when no are given', () => {
      expect(getOffsetLineNumber(2, new Map())).toBe(2);
    });

    it('return the offseted line number when passed offsets', () => {
      const offsets = new Map([[0, 1], [1, 2], [2, 3]]);
      expect(getOffsetLineNumber(0, offsets)).toBe(0);
      expect(getOffsetLineNumber(1, offsets)).toBe(2);
      expect(getOffsetLineNumber(2, offsets)).toBe(5);
      expect(getOffsetLineNumber(3, offsets)).toBe(9);
      expect(getOffsetLineNumber(4, offsets)).toBe(10);
    });

  });
});
