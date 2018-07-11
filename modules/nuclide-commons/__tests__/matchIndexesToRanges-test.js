"use strict";

function _matchIndexesToRanges() {
  const data = _interopRequireDefault(require("../matchIndexesToRanges"));

  _matchIndexesToRanges = function () {
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
 *  strict
 * @format
 */
describe('matchIndexesToRanges', () => {
  it('makes single character ranges for nonconsecutive values at consecutive indexes', () => {
    expect((0, _matchIndexesToRanges().default)([1, 3, 5, 7, 9])).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]);
  });
  it('collapses consecutive values into ranges', () => {
    expect((0, _matchIndexesToRanges().default)([0, 1, 2, 3, 10, 11, 12, 20, 21, 22, 23, 24, 25])).toEqual([[0, 4], [10, 13], [20, 26]]);
  });
});