'use strict';

var _FallbackMatcher;

function _load_FallbackMatcher() {
  return _FallbackMatcher = require('../lib/FallbackMatcher');
}

describe('FallbackMatcher', () => {
  it('should match the native API', () => {
    const matcher = new (_FallbackMatcher || _load_FallbackMatcher()).Matcher(['test']);
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
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */