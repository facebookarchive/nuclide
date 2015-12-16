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
