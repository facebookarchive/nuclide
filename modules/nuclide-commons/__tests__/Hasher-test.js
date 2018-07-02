"use strict";

function _Hasher() {
  const data = _interopRequireDefault(require("../Hasher"));

  _Hasher = function () {
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
describe('Hasher', () => {
  it('creates a new hash for each object', () => {
    const a = {};
    const b = {};
    const hasher = new (_Hasher().default)();
    expect(hasher.getHash(a)).not.toBe(hasher.getHash(b));
  });
  it('returns the same hash for the same object', () => {
    const a = {};
    const hasher = new (_Hasher().default)();
    expect(hasher.getHash(a)).toBe(hasher.getHash(a));
  });
  it('works for numbers', () => {
    const hasher = new (_Hasher().default)();
    expect(hasher.getHash(1)).toBe(hasher.getHash(1));
    expect(hasher.getHash(1)).not.toBe(hasher.getHash(2));
  });
  it('works for booleans', () => {
    const hasher = new (_Hasher().default)();
    expect(hasher.getHash(true)).toBe(hasher.getHash(true));
    expect(hasher.getHash(true)).not.toBe(hasher.getHash(false));
  });
  it('works for strings', () => {
    const hasher = new (_Hasher().default)();
    expect(hasher.getHash('a')).toBe(hasher.getHash('a'));
    expect(hasher.getHash('a')).not.toBe(hasher.getHash('b'));
  });
});