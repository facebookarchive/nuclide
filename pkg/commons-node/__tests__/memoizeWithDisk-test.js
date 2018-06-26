'use strict';

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _memoizeWithDisk;

function _load_memoizeWithDisk() {
  return _memoizeWithDisk = _interopRequireDefault(require('../memoizeWithDisk'));
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

(_temp || _load_temp()).default.track();

describe('memoizeWithDisk', () => {
  it('memoizes the result of a function', () => {
    const tempdir = (_temp || _load_temp()).default.mkdirSync();

    const func1 = jest.fn().mockImplementation(map => {
      return map.get('x');
    });

    const func2 = jest.fn().mockImplementation(map => {
      return map.get('y');
    });

    // Spies are a bit special because they're a wrapper function.
    // Mock out .toString() to make the stringable values different.
    jest.spyOn(func2, 'toString').mockReturnValue('different');

    const memoized = (0, (_memoizeWithDisk || _load_memoizeWithDisk()).default)(func1, map => Array.from(map), tempdir);
    const memoized2 = (0, (_memoizeWithDisk || _load_memoizeWithDisk()).default)(func2, map => Array.from(map), tempdir);

    const map1 = new Map();
    map1.set('x', 1);
    map1.set('y', 3);
    expect(memoized(map1)).toBe(1);
    expect(func1.mock.calls.length).toBe(1);

    // Make sure this isn't called again.
    expect(memoized(map1)).toBe(1);
    expect(func1.mock.calls.length).toBe(1);

    // Make sure the two functions don't collide.
    expect(memoized2(map1)).toBe(3);
    expect(func2.mock.calls.length).toBe(1);

    map1.set('x', 2);
    expect(memoized(map1)).toBe(2);
    expect(func1.mock.calls.length).toBe(2);
  });
});