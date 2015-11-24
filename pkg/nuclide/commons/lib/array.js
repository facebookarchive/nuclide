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
 * Static method as defined by
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from.
 * @param arrayLike An array-like or iterable object to convert to an array.
 * @param mapFn Map function to call on every element of the array.
 * @param thisArg Value to use as `this` when executing `mapFn`.
 */
// $FlowIssue
export function from<T, U>(
  arrayLike: Iterable | {length: number},
  mapFn?: (original: T) => U,
  thisArg?: mixed
) : Array<U> {
  if (mapFn === undefined) {
    mapFn = function(arg) { return arg; };
  }

  // Note that Symbol is not defined when running on Node 0.10.x.
  if (typeof Symbol !== 'undefined' &&
      typeof arrayLike === 'object' &&
      typeof arrayLike[Symbol.iterator] === 'function') {
    const array = [];
    // $FlowIssue: property @@iterator not found
    for (const value of arrayLike) {
      array.push(mapFn.call(thisArg, value));
    }
    return array;
  } else if (typeof arrayLike.next === 'function') {
    const array = [];
    for (const value of arrayLike) {
      array.push(mapFn.call(thisArg, value));
    }
    return array;
  } else if ('length' in arrayLike) {
    return Array.prototype.map.call(arrayLike, mapFn, thisArg);
  } else if (arrayLike instanceof Set) {
    // Backup logic to handle the es6-collections case.
    return from(arrayLike.values(), mapFn, thisArg);
  } else if (arrayLike instanceof Map) {
    // Backup logic to handle the es6-collections case.
    return from(arrayLike.entries(), mapFn, thisArg);
  } else {
    throw Error(`${arrayLike} must be an array-like or iterable object to convert to an array.`);
  }
}

/**
 * Instance method of Array as defined by
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find.
 * Because we do not want to add elements to Array.prototype, we make this a
 * static method that takes the Array (which would be the receiver if it were an
 * instance method) as the first argument.
 * @param array The array to search.
 * @param Function to execute on each value in the array.
 * @param Object to use as `this` when executing `callback`.
 */
export function find<T>(
    array: Array<T>,
    callback: (element: T, index: number, array: Array<T>) => mixed,
    thisArg?: mixed): ?T {
  const resultIndex = findIndex(array, callback, thisArg);
  return resultIndex >= 0 ? array[resultIndex] : undefined;
}

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
  const equalFunction = equalComparator || ((a: T,  b: T) => a === b);
  return array1.every((item1, i) => equalFunction(item1, array2[i]));
}
