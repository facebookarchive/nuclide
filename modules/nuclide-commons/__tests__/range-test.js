'use strict';

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = _interopRequireDefault(require('simple-text-buffer'));
}

var _simpleTextBuffer2;

function _load_simpleTextBuffer2() {
  return _simpleTextBuffer2 = require('simple-text-buffer');
}

var _range;

function _load_range() {
  return _range = require('../range');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('wordAtPositionFromBuffer', () => {
  it('matches a word in a buffer', () => {
    const buffer = new (_simpleTextBuffer || _load_simpleTextBuffer()).default('word1 word2 word3\n');
    const match = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, { row: 0, column: 6 }, /\S+/g);
    expect(match).not.toBeNull();

    if (!(match != null)) {
      throw new Error('Invariant violation: "match != null"');
    }

    expect(match.wordMatch.length).toBe(1);
    expect(match.wordMatch[0]).toBe('word2');
    expect(match.range).toEqual(new (_simpleTextBuffer2 || _load_simpleTextBuffer2()).Range([0, 6], [0, 11]));
  });

  it('should not include endpoints', () => {
    const buffer = new (_simpleTextBuffer || _load_simpleTextBuffer()).default('word1 word2 word3\n');
    const match = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, { row: 0, column: 5 }, /\S+/g);
    expect(match).toBeNull();
  });
}); /**
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