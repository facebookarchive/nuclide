'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Merges a given arguments of maps into one Map, with the latest maps
 * overriding the values of the prior maps.
 */
export function union<T, X>(...maps: Array<Map<T, X>>): Map<T, X> {
  const unionMap = new Map();
  for (const map of maps) {
    for (const [key, value] of map) {
      unionMap.set(key, value);
    }
  }
  return unionMap;
}

export function filter<T, X>(
  map: Map<T, X>,
  selector: (key: T, value: X) => boolean,
): Map<T, X> {
  const selected = new Map();
  for (const [key, value] of map) {
    if (selector(key, value)) {
      selected.set(key, value);
    }
  }
  return selected;
}
