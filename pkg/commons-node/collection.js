'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function arrayRemove<T>(array: Array<T>, element: T): void {
  const index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

export function arrayEqual<T>(
  array1: Array<T>,
  array2: Array<T>,
  equalComparator?: (a: T, b: T) => boolean,
): boolean {
  if (array1.length !== array2.length) {
    return false;
  }
  const equalFunction = equalComparator || ((a: T, b: T) => a === b);
  return array1.every((item1, i) => equalFunction(item1, array2[i]));
}

/**
 * Returns a copy of the input Array with all `null` and `undefined` values filtered out.
 * Allows Flow to typecheck the common `filter(x => x != null)` pattern.
 */
export function arrayCompact<T>(array: Array<?T>): Array<T> {
  const result = [];
  for (const elem of array) {
    if (elem != null) {
      result.push(elem);
    }
  }
  return result;
}

/**
 * Merges a given arguments of maps into one Map, with the latest maps
 * overriding the values of the prior maps.
 */
export function mapUnion<T, X>(...maps: Array<Map<T, X>>): Map<T, X> {
  const unionMap = new Map();
  for (const map of maps) {
    for (const [key, value] of map) {
      unionMap.set(key, value);
    }
  }
  return unionMap;
}

export function mapFilter<T, X>(
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

export function mapEqual<T, X>(
  map1: Map<T, X>,
  map2: Map<T, X>,
) {
  if (map1.size !== map2.size) {
    return false;
  }
  for (const [key1, value1] of map1) {
    if (map2.get(key1) !== value1) {
      return false;
    }
  }
  return true;
}

export function setIntersect<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set(Array.from(a).filter(e => b.has(e)));
}


/**
 * O(1)-check if a given object is empty (has no properties, inherited or not)
 */
export function isEmpty(obj: Object): boolean {
  for (const key in obj) { // eslint-disable-line no-unused-vars
    return false;
  }
  return true;
}

/**
 * Constructs an enumeration with keys equal to their value.
 * e.g. keyMirror({a: null, b: null}) => {a: 'a', b: 'b'}
 *
 * Based off the equivalent function in www.
 */
export function keyMirror<T: Object>(obj: T): {[key: $Enum<T>]: $Enum<T>} {
  const ret = {};
  Object.keys(obj).forEach(key => {
    ret[key] = key;
  });
  return ret;
}

/**
 * Given an array of [key, value] pairs, construct a map where the values for
 * each key are collected into an array of values, in order.
 */
export function collect<K, V>(pairs: Array<[K, V]>): Map<K, Array<V>> {
  const result = new Map();
  for (const pair of pairs) {
    const [k, v] = pair;
    let list = result.get(k);
    if (list == null) {
      list = [];
      result.set(k, list);
    }
    list.push(v);
  }
  return result;
}
