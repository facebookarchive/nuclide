'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Range} = require('atom');
var findWholeRangeOfSymbol = require('../lib/findWholeRangeOfSymbol');
var {toEqualAtomRange, toEqualAtomRanges} = require('nuclide-atom-test-helpers').jasmineMatchers;

describe('findWholeRangeOfSymbol', () => {
  var editor;

  beforeEach(function() {
    var rangeMatchers = {toEqualAtomRange, toEqualAtomRanges};
    this.addMatchers(rangeMatchers);
    waitsForPromise(async () => {
      editor = await atom.workspace.open('sampleObjC.m');
    });
  });

  it('finds the range of a non-selector symbol.', () => {
    var text = 'name';
    var spelling = 'name';
    var textRangeInSample = new Range([8, 31], [8, 35]);
    var extent = {start: {line: 8, column: 31}, end: {line: 8, column: 35}};
    var ranges = findWholeRangeOfSymbol(editor, text, textRangeInSample, spelling, extent);
    // The range returned should just be the range of the original text.
    expect(ranges).toEqualAtomRanges([textRangeInSample]);
  });

  it('finds the range of a selector with one argument.', () => {
    var text = 'cStringUsingEncoding';
    var spelling = 'cStringUsingEncoding:';
    var textRangeInSample = new Range([12, 39], [12, 59]);
    var extent = {start: {line: 12, column: 35}, end: {line: 12, column: 83}};
    var ranges = findWholeRangeOfSymbol(editor, text, textRangeInSample, spelling, extent);
    // The range returned should just be the range of the original text + 1 for the colon.
    var expectedRange = new Range(textRangeInSample.start, [12, 60]);
    expect(ranges).toEqualAtomRanges([expectedRange]);
  });

  it('finds the range of a selector with multiple arguments, when any of the segments is the selected "text".', () => {
    var spelling = 'createDirectoryAtPath:withIntermediateDirectories:attributes:error:';
    // The ranges returned should be all the ranges of all the segments, including the colons.
    var expectedRange1 = new Range([17, 20], [17, 42]); // location of textRangeInSample1 + 1 colon
    var expectedRange2 = new Range([18, 14], [18, 42]); // location of textRangeInSample2 + 1 colon
    var expectedRange3 = new Range([19, 31], [19, 42]); // location of textRangeInSample3 + 1 colon
    var expectedRange4 = new Range([19, 46], [19, 52]); // location of textRangeInSample4 + 1 colon
    var expectedRanges = [expectedRange1, expectedRange2, expectedRange3, expectedRange4];
    var extent = {start: {line: 17, column: 6}, end: {line: 19, column: 56}};

    var text1 = 'createDirectoryAtPath';
    var textRangeInSample1 = new Range([17, 20], [17, 41]);
    const ranges1 = findWholeRangeOfSymbol(editor, text1, textRangeInSample1, spelling, extent);
    expect(ranges1).toEqualAtomRanges(expectedRanges);

    var text2 = 'withIntermediateDirectories';
    var textRangeInSample2 = new Range([18, 14], [18, 41]);
    const ranges2 = findWholeRangeOfSymbol(editor, text2, textRangeInSample2, spelling, extent);
    expect(ranges2).toEqualAtomRanges(expectedRanges);

    var text3 = 'attributes';
    var textRangeInSample3 = new Range([19, 31], [19, 41]);
    const ranges3 = findWholeRangeOfSymbol(editor, text3, textRangeInSample3, spelling, extent);
    expect(ranges3).toEqualAtomRanges(expectedRanges);

    var text4 = 'createDirectoryAtPath';
    var textRangeInSample4 = new Range([19, 46], [19, 51]);
    const ranges4 = findWholeRangeOfSymbol(editor, text4, textRangeInSample4, spelling, extent);
    expect(ranges4).toEqualAtomRanges(expectedRanges);
  });
});
