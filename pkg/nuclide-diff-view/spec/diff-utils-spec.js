'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  computeDiff,
  computeNavigationSections,
  __TEST__,
} from '../lib/diff-utils';
import {NavigationSectionStatus} from '../lib/constants';

const {
  getLineCountWithOffsets,
  getOffsetLineNumber,
} = __TEST__;

describe('diff-utils', () => {
  describe('computeDiff()', () => {
    it('diffs two empty texts', () => {
      const {
        addedLines,
        removedLines,
        oldLineOffsets,
        newLineOffsets,
        newToOld,
        oldToNew,
      } = computeDiff('', '');
      expect(addedLines).toEqual([]);
      expect(removedLines).toEqual([]);
      expect(oldLineOffsets.length).toBe(0);
      expect(newLineOffsets.length).toBe(0);
      expect(newToOld).toEqual([0, 1, 2]);
      expect(oldToNew).toEqual([0, 1, 2]);
    });

    it('diffs simple text with one line changes', () => {
      const {
        addedLines,
        removedLines,
        oldLineOffsets,
        newLineOffsets,
        newToOld,
        oldToNew,
      } = computeDiff(
`simple text
on multiline
same end line`,
`on multiline
added text
same end line`,
      );

      expect(addedLines).toEqual([1]); // the second line is newly added.
      expect(removedLines).toEqual([0]); // the first line was removed.
      expect(oldLineOffsets).toEqual([[2, 1]]); // offset 1 for the new added line.
      expect(newLineOffsets).toEqual([[0, 1]]); // offset 1 for the first removed line.
      expect(newToOld).toEqual([1, 2, 2, 3, 4]);
      expect(oldToNew).toEqual([0, 0, 2, 3, 4]);
    });

    it('diffs multi-line text changes', () => {
      const {
        addedLines,
        removedLines,
        oldLineOffsets,
        newLineOffsets,
        newToOld,
        oldToNew,
      } = computeDiff(
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
adding a non-new-line line`,
      );

      expect(addedLines).toEqual([2, 3, 7]); // 2 lines were added in the middle and one at the end.
      // 2 lines were removed in the middle and last new-line replaced.
      expect(removedLines).toEqual([1, 2, 7]);
      expect(oldLineOffsets).toEqual([[4, 2]]); // offset 2 for the 2 lines added.
      expect(newLineOffsets).toEqual([[1, 2]]); // offset 2 for the 2 lines removed.
      expect(newToOld).toEqual([0, 3, 4, 4, 4, 5, 6, 7, 8]);
      expect(oldToNew).toEqual([0, 1, 1, 1, 4, 5, 6, 7, 8]);
    });

    it('diffs new text longer than the other', () => {
      const {
        addedLines,
        removedLines,
        oldLineOffsets,
        newLineOffsets,
        newToOld,
        oldToNew,
      } = computeDiff(
        `first line text\n`,
        `first line text\nsecond line text\n`);
      expect(addedLines).toEqual([1]);
      expect(removedLines).toEqual([]);
      expect(oldLineOffsets).toEqual([[1, 1]]); // offset for the last added line.
      expect(newLineOffsets.length).toBe(0);
      expect(newToOld).toEqual([0, 1, 2, 3]);
      expect(oldToNew).toEqual([0, 1, 2]);
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

  describe('computeNavigationSections()', () => {

    it('returns empty sections when there are no changed lines', () => {
      const navigationSections = computeNavigationSections([], [], [], [], new Map(), new Map());
      expect(navigationSections.length).toBe(0);
    });

    it('returns added/removed sections for lines --> without offsets', () => {
      const navigationSections = computeNavigationSections(
        [3, 4, 7], [9, 10], [], [], new Map(), new Map(),
      );
      expect(navigationSections.length).toBe(3);
      expect(navigationSections[0]).toEqual({
        lineCount: 2,
        lineNumber: 3,
        offsetLineNumber: 3,
        status: NavigationSectionStatus.ADDED,
      });

      expect(navigationSections[1]).toEqual({
        lineCount: 1,
        lineNumber: 7,
        offsetLineNumber: 7,
        status: NavigationSectionStatus.ADDED,
      });

      expect(navigationSections[2]).toEqual({
        lineCount: 2,
        lineNumber: 9,
        offsetLineNumber: 9,
        status: NavigationSectionStatus.REMOVED,
      });
    });

    it('returns added/removed offset sections for lines --> with normal offsets', () => {
      const navigationSections = computeNavigationSections(
        [3, 4, 5], [0, 1], [], [], new Map([[3, 2]]), new Map([[0, 2]]),
      );
      expect(navigationSections.length).toBe(2);
      expect(navigationSections[0]).toEqual({
        lineCount: 2,
        lineNumber: 0,
        offsetLineNumber: 0,
        status: NavigationSectionStatus.REMOVED,
      });

      expect(navigationSections[1]).toEqual({
        lineCount: 3,
        lineNumber: 3,
        offsetLineNumber: 5,
        status: NavigationSectionStatus.ADDED,
      });
    });

    it('returns changed sections for added/removed intersection --> without offsets', () => {
      const navigationSections = computeNavigationSections(
        [2, 3, 4, 10, 11, 12], [3, 4, 5, 6], [], [], new Map(), new Map(),
      );
      expect(navigationSections.length).toBe(4);

      expect(navigationSections[0]).toEqual({
        lineCount: 1,
        lineNumber: 2,
        offsetLineNumber: 2,
        status: NavigationSectionStatus.ADDED,
      });

      expect(navigationSections[1]).toEqual({
        lineCount: 2,
        lineNumber: 3,
        offsetLineNumber: 3,
        status: NavigationSectionStatus.CHANGED,
      });

      expect(navigationSections[2]).toEqual({
        lineCount: 2,
        lineNumber: 5,
        offsetLineNumber: 5,
        status: NavigationSectionStatus.REMOVED,
      });

      expect(navigationSections[3]).toEqual({
        lineCount: 3,
        lineNumber: 10,
        offsetLineNumber: 10,
        status: NavigationSectionStatus.ADDED,
      });
    });

    it('returns changed sections for added/removed intersection --> with offsets', () => {
      const navigationSections = computeNavigationSections(
        [2, 4, 5, 10, 11, 12], [3, 4, 5, 6], [], [], new Map([[2, 1]]), new Map([[5, 2]]),
      );
      expect(navigationSections.length).toBe(4);

      expect(navigationSections[0]).toEqual({
        lineCount: 1,
        lineNumber: 2,
        offsetLineNumber: 2,
        status: NavigationSectionStatus.ADDED,
      });

      expect(navigationSections[1]).toEqual({
        lineCount: 2,
        lineNumber: 4,
        offsetLineNumber: 4,
        status: NavigationSectionStatus.CHANGED,
      });

      expect(navigationSections[2]).toEqual({
        lineCount: 2,
        lineNumber: 5,
        offsetLineNumber: 6,
        status: NavigationSectionStatus.REMOVED,
      });

      expect(navigationSections[3]).toEqual({
        lineCount: 3,
        lineNumber: 10,
        offsetLineNumber: 12,
        status: NavigationSectionStatus.ADDED,
      });
    });

  });
});
