"use strict";

function _simpleTextBuffer() {
  const data = _interopRequireWildcard(require("simple-text-buffer"));

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../range");

  _range = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
describe('wordAtPositionFromBuffer', () => {
  it('matches a word in a buffer', () => {
    const buffer = new (_simpleTextBuffer().default)('word1 word2 word3\n');
    const match = (0, _range().wordAtPositionFromBuffer)(buffer, {
      row: 0,
      column: 6
    }, /\S+/g);
    expect(match).not.toBeNull();

    if (!(match != null)) {
      throw new Error("Invariant violation: \"match != null\"");
    }

    expect(match.wordMatch.length).toBe(1);
    expect(match.wordMatch[0]).toBe('word2');
    expect(match.range).toEqual(new (_simpleTextBuffer().Range)([0, 6], [0, 11]));
  });
  it('should not include endpoints', () => {
    const buffer = new (_simpleTextBuffer().default)('word1 word2 word3\n');
    const match = (0, _range().wordAtPositionFromBuffer)(buffer, {
      row: 0,
      column: 5
    }, /\S+/g);
    expect(match).toBeNull();
  });
});