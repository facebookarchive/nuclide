'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {areSetsEqual} from '../../test-helpers';
import {
  intersect,
} from '../lib/pathSetLogic';

describe('intersect', () => {
  it('returns `A ∩ B`', () => {
    expect(areSetsEqual(
      intersect(
        new Set(['a']),
        new Set(['a'])
      ),
      new Set(['a'])
    )).toBe(true);
    expect(areSetsEqual(
      intersect(
        new Set(['a', 'c']),
        new Set(['b', 'c'])
      ),
      new Set(['c'])
    )).toBe(true);
    expect(areSetsEqual(
      intersect(
        new Set(['a', 'b']),
        new Set(['a', 'c'])
      ),
      new Set(['a'])
    )).toBe(true);
  });
  it('respects `A ∩ A = A`', () => {
    expect(areSetsEqual(
      intersect(
        new Set(['a', 'b', 'c']),
        new Set(['a', 'b', 'c'])
      ),
      new Set(['a', 'b', 'c'])
    )).toBe(true);
  });
  it('returns A for `A ⊆ B`', () => {
    expect(areSetsEqual(
      intersect(
        new Set(['a', 'b']),
        new Set(['a', 'b', 'c'])
      ),
      new Set(['a', 'b'])
    )).toBe(true);
  });
  it('returns B for `A ⊇ B`', () => {
    expect(areSetsEqual(
      intersect(
        new Set(['a', 'b', 'c']),
        new Set(['a', 'b'])
      ),
      new Set(['a', 'b'])
    )).toBe(true);
  });
  it('returns ∅ for `A ∪ B = ∅`', () => {
    expect(areSetsEqual(
      intersect(
        new Set(['a', 'b', 'c']),
        new Set(['d', 'e', 'f'])
      ),
      new Set()
    )).toBe(true);
  });
  it('returns ∅ for `A = ∅ | B = ∅`', () => {
    expect(areSetsEqual(
      intersect(
        new Set(['a', 'b', 'c']),
        new Set()
      ),
      new Set()
    )).toBe(true);
  });
});
