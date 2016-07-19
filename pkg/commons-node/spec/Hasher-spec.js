'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Hasher from '../Hasher';

describe('Hasher', () => {

  it('creates a new hash for each object', () => {
    const a = {};
    const b = {};
    const hasher = new Hasher();
    expect(hasher.getHash(a)).not.toBe(hasher.getHash(b));
  });

  it('returns the same hash for the same object', () => {
    const a = {};
    const hasher = new Hasher();
    expect(hasher.getHash(a)).toBe(hasher.getHash(a));
  });

});
