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
  intersectMany,
  enumerateAllCombinations,
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

describe('intersectMany', () => {
  it('returns the intersections of all sets in the array', () => {
    expect(areSetsEqual(
      intersectMany([
        new Set([1]),
        new Set([1, 2]),
        new Set([1, 2, 3]),
        new Set([1, 3, 4]),
        new Set([1, 5]),
      ]),
      new Set([1])
    )).toBe(true);

    expect(areSetsEqual(
      intersectMany([
        new Set([]),
        new Set([1, 2]),
        new Set([1, 2, 3]),
      ]),
      new Set([])
    )).toBe(true);

    expect(areSetsEqual(
      intersectMany([
        new Set([1, 2, 3]),
        new Set([1, 2, 3]),
        new Set([1, 2, 3]),
      ]),
      new Set([1, 2, 3])
    )).toBe(true);

    expect(areSetsEqual(
      intersectMany([]),
      new Set([])
    )).toBe(true);

    expect(areSetsEqual(
      intersectMany([new Set([1])]),
      new Set([1])
    )).toBe(true);
  });

  it('returns a new Set for inputs of length 0 or 1', () => {

    const empty = [];
    expect(intersectMany(empty) !== empty).toBe(true);

    const oneSet = [new Set([1])];
    expect(intersectMany(oneSet) !== oneSet).toBe(true);

  });
});

// Generates an array of size n, containing the numbers 0..n-1.
function makeArrayOfSize(n: number): Array<number> {
  return new Array(n + 1).join(' ').split('').map((_, i) => i);
}

describe('enumerateAllCombinations', () => {
  it('enumerates correctly', () => {
    expect(enumerateAllCombinations(
      ['a']
    )).toEqual([
      ['a'],
    ]);

    expect(enumerateAllCombinations(
      ['a', 'b']
    )).toEqual([
      ['a', 'b'], ['b'], ['a'],
    ]);

    expect(enumerateAllCombinations(
      ['a', 'b', 'c']
    )).toEqual([
      ['a', 'b', 'c'],
      ['b', 'c'],
      ['a', 'c'],
      ['a', 'b'],
      ['c'],
      ['b'],
      ['a'],
    ]);
  });

  // For perf reasons, we only test up to n=16, which yields 65,535 combinations.
  it('works for sets `1 ≤ |A| < 32`', () => {
    for (let i = 1; i < 16; i++) {
      expect(enumerateAllCombinations(
        makeArrayOfSize(i)
      ).length).toEqual(Math.pow(2, i) - 1);
    }
  });
});
