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
