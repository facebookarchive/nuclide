'use strict';

var _atom = require('atom');

var _findWholeRangeOfSymbol;

function _load_findWholeRangeOfSymbol() {
  return _findWholeRangeOfSymbol = _interopRequireDefault(require('../lib/findWholeRangeOfSymbol'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

describe('findWholeRangeOfSymbol', () => {
  let editor = null;

  beforeEach(async () => {
    editor = await atom.workspace.open('sampleObjC.m');
  });

  it('finds the range of a non-selector symbol.', () => {
    const text = 'name';
    const spelling = 'name';
    const textRangeInSample = new _atom.Range([8, 31], [8, 35]);
    const extent = new _atom.Range([8, 31], [8, 35]);
    const ranges = (0, (_findWholeRangeOfSymbol || _load_findWholeRangeOfSymbol()).default)(editor, text, textRangeInSample, spelling, extent);
    // The range returned should just be the range of the original text.
    expect(ranges).toMatchSnapshot();
  });

  it('finds the range of a fully qualified non-selector symbol.', () => {
    const text = 'name';
    const spelling = 'namespace::name';
    const textRangeInSample = new _atom.Range([8, 31], [8, 35]);
    const extent = new _atom.Range([8, 31], [8, 35]);
    const ranges = (0, (_findWholeRangeOfSymbol || _load_findWholeRangeOfSymbol()).default)(editor, text, textRangeInSample, spelling, extent);
    expect(ranges).toMatchSnapshot();
  });

  it('finds the range of a selector with one argument.', () => {
    const text = 'cStringUsingEncoding';
    const spelling = 'cStringUsingEncoding:';
    const textRangeInSample = new _atom.Range([12, 39], [12, 59]);
    const extent = new _atom.Range([12, 35], [12, 83]);
    const ranges = (0, (_findWholeRangeOfSymbol || _load_findWholeRangeOfSymbol()).default)(editor, text, textRangeInSample, spelling, extent);
    expect(ranges).toMatchSnapshot();
  });

  it('finds the range of a selector with multiple arguments, when any of the segments is the' + ' selected "text".', () => {
    const spelling = 'createDirectoryAtPath:withIntermediateDirectories:attributes:error:';
    const extent = _atom.Range.fromObject({
      start: { row: 17, column: 6 },
      end: { row: 19, column: 56 }
    });

    const text1 = 'createDirectoryAtPath';
    const textRangeInSample1 = new _atom.Range([17, 20], [17, 41]);
    const ranges1 = (0, (_findWholeRangeOfSymbol || _load_findWholeRangeOfSymbol()).default)(editor, text1, textRangeInSample1, spelling, extent);
    expect(ranges1).toMatchSnapshot();

    const text2 = 'withIntermediateDirectories';
    const textRangeInSample2 = new _atom.Range([18, 14], [18, 41]);
    const ranges2 = (0, (_findWholeRangeOfSymbol || _load_findWholeRangeOfSymbol()).default)(editor, text2, textRangeInSample2, spelling, extent);
    expect(ranges2).toMatchSnapshot();

    const text3 = 'attributes';
    const textRangeInSample3 = new _atom.Range([19, 31], [19, 41]);
    const ranges3 = (0, (_findWholeRangeOfSymbol || _load_findWholeRangeOfSymbol()).default)(editor, text3, textRangeInSample3, spelling, extent);
    expect(ranges3).toMatchSnapshot();

    const text4 = 'createDirectoryAtPath';
    const textRangeInSample4 = new _atom.Range([19, 46], [19, 51]);
    const ranges4 = (0, (_findWholeRangeOfSymbol || _load_findWholeRangeOfSymbol()).default)(editor, text4, textRangeInSample4, spelling, extent);
    expect(ranges4).toMatchSnapshot();
  });
});