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
 * Instance method of Array as defined by
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex.
 * Because we do not want to add elements to Array.prototype, we make this a
 * static method that takes the Array (which would be the receiver if it were an
 * instance method) as the first argument.
 * @param array The array to search.
 * @param Function to execute on each value in the array.
 * @param Object to use as `this` when executing `callback`.
 */
export function findIndex<T>(
    array: Array<T>,
    callback: (element: T, index: number, array: Array<T>) => mixed,
    thisArg?: mixed): number {
  let result = -1;
  array.some(function(element: T, index: number, arr: Array<T>) {
    if (callback.call(thisArg, element, index, arr)) {
      result = index;
      return true;
    } else {
      return false;
    }
  });
  return result;
}

export function remove<T>(array: Array<T>, element: T): void {
  const index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

export function equal<T>(
  array1: Array<T>,
  array2: Array<T>,
  equalComparator?: (a: T, b: T) => boolean,
): boolean {
  if (array1.length !== array2.length) {
    return false;
  }
  const equalFunction = equalComparator || ((a: T,  b: T) => a === b);
  return array1.every((item1, i) => equalFunction(item1, array2[i]));
}

/**
 * Returns a copy of the input Array with all `null` and `undefined` values filtered out.
 * Allows Flow to typecheck the common `filter(x => x != null)` pattern.
 */
export function compact<T>(array: Array<?T>): Array<T> {
  const result = [];
  for (const elem of array) {
    if (elem != null) {
      result.push(elem);
    }
  }
  return result;
}
