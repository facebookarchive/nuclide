'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function intersect<T>(s1: Set<T>, s2: Set<T>): Set<T> {
  // For optimal perf, iterate the smaller set:
  const [smallerSet, largerSet] = s1.size > s2.size ? [s2, s1] : [s1, s2];
  const intersection = new Set();
  for (const item of smallerSet) {
    if (largerSet.has(item)) {
      intersection.add(item);
    }
  }
  return intersection;
}

/**
 * Returns the intersection of all sets in `sets`.
 * The first element in `sets` is assumed to be the smallest set.
 * This allows us to quickly calculate the intersection in O(nm),
 * where n is the first (smallest) element in `sets`, and m is length of `sets`.
 *
 * Guaranteed to return a new Set, without side effects.
 */
export function intersectMany<T>(sets: Array<Set<T>>): Set<T> {
  if (sets.length === 0) {
    return new Set();
  }
  if (sets.length === 1) {
    return new Set(sets[0]);
  }
  // Start out with the first item.
  // $FlowIssue: t6187050 (computed properties)
  const iter = sets[Symbol.iterator]();
  // Re-use the input set to avoid creating an unnecessary copy.
  // `intersection` is guaranteed to be overwritten with a new Set before the function returns.
  let intersection = iter.next().value;
  for (const s of iter) {
    intersection = intersect(s, intersection);
  }
  return intersection;
}

/**
 * Given a list of items e.g. [ABC], return all combinations, i.e. [[ABC][AB][AC][BC][A][B][C]].
 *
 * Optimized for the use-case of enumerating all possible non-empty combinations of Sets, ordered
 * by descending cardinality. This is a preprocessing step for lazily creating maximally constrained
 * subsets of all items in all sets by calculating the intersection of each returned combination.
 *
 * The implementation assigns a bit to each item in `sets`, and enumerates combinations via bitwise
 * `and`. It is thus only suited for sets of size < 32, though realistic numbers are lower due to
 * the exponential (2^n-1) combination growth.
 */
export function enumerateAllCombinations<T>(sets: Array<T>): Array<Array<T>> {
  const combos = [];
  const combinationCount = Math.pow(2, sets.length) - 1;
  // Since we want to intersect the results, enumerate "backwards", in order to generate
  // the most constrained intersections first.
  for (let i = combinationCount; i > 0; i--) {
    const s = [];
    for (let a = 0; a < sets.length; a++) {
      /* eslint-disable no-bitwise */
      if ((i & (1 << a)) !== 0) {
        s.push(sets[a]);
      }
      /* eslint-enable no-bitwise */
    }
    combos.push(s);
  }
  return combos.sort((a, b) => b.length - a.length);
}
