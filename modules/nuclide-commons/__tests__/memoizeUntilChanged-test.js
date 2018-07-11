"use strict";

function _memoizeUntilChanged() {
  const data = _interopRequireDefault(require("../memoizeUntilChanged"));

  _memoizeUntilChanged = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const sum = (a, b) => a + b;

describe('memoizeUntilChanged', () => {
  it('memoizes', () => {
    const spy = jest.fn().mockImplementation(sum);
    const f = (0, _memoizeUntilChanged().default)(spy);
    f(1, 2);
    const result = f(1, 2);
    expect(result).toBe(3);
    expect(spy.mock.calls.length).toBe(1);
  });
  it('resets when args change', () => {
    const spy = jest.fn().mockImplementation(sum);
    const f = (0, _memoizeUntilChanged().default)(spy);
    f(1, 2);
    const result = f(1, 3);
    expect(result).toBe(4);
    expect(spy.mock.calls.length).toBe(2);
  });
  it('preserves context', () => {
    let that;
    const obj = {};
    const f = (0, _memoizeUntilChanged().default)(function f() {
      that = this;
    });
    f.call(obj);
    expect(that).toBe(obj);
  });
  it('uses all args when memoizing by default', () => {
    const spy = jest.fn().mockImplementation(sum);
    const f = (0, _memoizeUntilChanged().default)(spy);
    f(1, 2);
    const result = f(1, 3);
    expect(result).toBe(4);
    expect(spy.mock.calls.length).toBe(2);
  });
  it('uses the key selector and comparator', () => {
    const spy = jest.fn().mockImplementation(sum);
    const f = (0, _memoizeUntilChanged().default)(spy, // A pretty poor keyselector that uses the sum of the arguments as the key. Lots of collisions
    // here!
    (x, y) => x + y, // Compare numbers.
    (a, b) => a === b);
    f(1, 2);
    f(2, 1);
    f(0, 3);
    expect(spy.mock.calls.length).toBe(1);
    f(0, 4);
    expect(spy.mock.calls.length).toBe(2);
  });
});