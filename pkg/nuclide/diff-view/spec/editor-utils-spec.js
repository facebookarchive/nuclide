'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {buildLineRangesWithOffsets} from '../lib/editor-utils';

describe('editor-utils', () => {

  describe('buildLineRangesWithOffsets()', () => {
    it('returns adjusted regions and screen lines when offsets are in the middle of the lines', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[2, 2]]), 0, 4, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 1, screenRows: 1},
        {bufferRows: 1, screenRows: 3},
        {bufferRows: 2, screenRows: 2},
      ]);
      expect(screenLines).toEqual([1, 2, 0, 0, 3, 4]);
    });

    it('returns adjusted regions and screen lines when an offset is set to the second line', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[1, 2]]), 0, 4, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 1, screenRows: 3},
        {bufferRows: 3, screenRows: 3},
      ]);
      expect(screenLines).toEqual([1, 0, 0, 2, 3, 4]);
    });

    it('returns adjusted regions and screen lines when an offset is set to the first line', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[0, 2]]), 0, 4, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 1, screenRows: 3},
        {bufferRows: 3, screenRows: 3},
      ]);
      expect(screenLines).toEqual([0, 0, 1, 2, 3, 4]);
    });

    it('returns the same regions and screen lines when start row is after all offsets', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[0, 2]]), 3, 7, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 4, screenRows: 4},
      ]);
      expect(screenLines).toEqual([1, 2, 3, 4]);
    });

    it('returns the same regions and screen lines when end row is before all offsets', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[9, 2]]), 3, 7, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 4, screenRows: 4},
      ]);
      expect(screenLines).toEqual([1, 2, 3, 4]);
    });

    it('returns adjusted regions and screen lines when start row is > 0', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[5, 2]]), 3, 7, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 1, screenRows: 1},
        {bufferRows: 1, screenRows: 3},
        {bufferRows: 2, screenRows: 2},
      ]);
      expect(screenLines).toEqual([1, 2, 0, 0, 3, 4]);
    });

    it('returns adjusted regions and screen lines when start row equals the first offset', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[3, 1], [8, 1]]), 3, 7, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 1, screenRows: 2},
        {bufferRows: 3, screenRows: 3},
      ]);
      expect(screenLines).toEqual([0, 1, 2, 3, 4]);
    });

    it('returns adjusted regions and screen lines the last offset is just before the last line requested', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[1, 1], [6, 1]]), 3, 7, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 2, screenRows: 2},
        {bufferRows: 1, screenRows: 2},
        {bufferRows: 1, screenRows: 1},
      ]);
      expect(screenLines).toEqual([1, 2, 3, 0, 4]);
    });

    it('returns adjusted regions and screen lines the last offset is the last line requested', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4], new Map([[1, 1], [7, 1]]), 3, 7, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 4, screenRows: 4},
      ]);
      expect(screenLines).toEqual([1, 2, 3, 4]);

      const {regions: followingRegions, screenLines: followingScreenLines} =
        buildLineRangesWithOffsets(
          [5, 6, 7, 8], new Map([[1, 1], [7, 1]]), 7, 11, () => 0
        );
      expect(followingRegions).toEqual([
        {bufferRows: 1, screenRows: 2},
        {bufferRows: 3, screenRows: 3},
      ]);
      expect(followingScreenLines).toEqual([0, 5, 6, 7, 8]);
    });

    it('returns regions with multi-digit numbers, verifying sort offset lines works', () => {
      const {regions, screenLines} = buildLineRangesWithOffsets(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], new Map([[2, 2], [11, 1]]), 0, 13, () => 0
      );
      expect(regions).toEqual([
        {bufferRows: 1, screenRows: 1},
        {bufferRows: 1, screenRows: 3},
        {bufferRows: 8, screenRows: 8},
        {bufferRows: 1, screenRows: 2},
        {bufferRows: 2, screenRows: 2},
      ]);
      expect(screenLines).toEqual([1, 2, 0, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 12, 13]);
    });
  });
});
