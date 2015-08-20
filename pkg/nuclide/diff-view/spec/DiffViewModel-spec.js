'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DiffViewModel = require('../lib/DiffViewModel');

describe('DiffViewModel', () => {
  describe('computeDiff()', () => {
    var model = null;

    beforeEach(() => {
      model = new DiffViewModel();
    });

    afterEach(() => {
      model = null;
    });

    it('diffs two empty texts', () => {
      var {addedLines, removedLines, oldLineOffsets, newLineOffsets} = model.computeDiff('', '');
      expect(addedLines).toEqual([]);
      expect(removedLines).toEqual([]);
      expect(oldLineOffsets).toEqual({});
      expect(newLineOffsets).toEqual({});
    });

    it('diffs simple text with one line changes', () => {
      var {addedLines, removedLines, oldLineOffsets, newLineOffsets} = model.computeDiff(
`simple text
on multiline
same end line`,
`on multiline
added text
same end line`
      );

      expect(addedLines).toEqual([1]); // the second line is newly added.
      expect(removedLines).toEqual([0]); // the first line was removed.
      expect(oldLineOffsets).toEqual({2: 1}); // offset 1 for the new added line.
      expect(newLineOffsets).toEqual({0: 1}); // offset 1 for the first removed line.
    });

    it('diffs multi-line text changes', () => {
      var {addedLines, removedLines, oldLineOffsets, newLineOffsets} = model.computeDiff(
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
      expect(removedLines).toEqual([1, 2, 7]); // 2 lines were removed in the middle and last new-line replaced.
      expect(oldLineOffsets).toEqual({4: 2}); // offset 2 for the 2 lines added after the sync line.
      expect(newLineOffsets).toEqual({1: 2}); // offset 2 for the 2 lines removed before the sync line.
    });

  });
});
