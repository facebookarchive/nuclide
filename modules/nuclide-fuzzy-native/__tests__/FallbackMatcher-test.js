"use strict";

function _FallbackMatcher() {
  const data = require("../lib/FallbackMatcher");

  _FallbackMatcher = function () {
    return data;
  };

  return data;
}

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
describe('FallbackMatcher', () => {
  it('should match the native API', () => {
    const matcher = new (_FallbackMatcher().Matcher)(['test']);
    expect(matcher.match('test')).toEqual([{
      value: 'test',
      score: 0,
      matchIndexes: []
    }]);
    matcher.addCandidates(['test2']);
    expect(matcher.match('test')).toEqual([{
      value: 'test',
      score: 0,
      matchIndexes: []
    }, {
      value: 'test2',
      score: 5,
      matchIndexes: []
    }]);
    matcher.removeCandidates(['test']);
    expect(matcher.match('test')).toEqual([{
      value: 'test2',
      score: 5,
      matchIndexes: []
    }]);
  });
});