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
function from(arrayLike, mapFn = undefined, thisArg = undefined): Array {
  if (mapFn === undefined) {
    mapFn = function(arg) { return arg; };
  }

  // Note that Symbol is not defined when running on Node 0.10.x.
  if (typeof Symbol !== 'undefined' &&
      typeof arrayLike === 'object' &&
      typeof arrayLike[Symbol.iterator] === 'function') {
    var array = [];
    for (var value of arrayLike) {
      array.push(mapFn.call(thisArg, value));
    }
    return array;
  } else if (typeof arrayLike.next === 'function') {
    // See if arrayLike conforms to the iterator protocol. Note that on
    // Node 0.10.x, where we use es6-collections, things like Map.entries() and
    // Set.values() will fall into this case rather than the previous case.
    var array = [];
    while (true) {
      var {done, value} = arrayLike.next();
      if (done) {
        break;
      } else {
        array.push(mapFn.call(thisArg, value));
      }
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
    throw Error(arrayLike +
        ' must be an array-like or iterable object to convert to an array.');
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
function find(
    array: Array,
    callback: (element: any, index: number, array: Array) => any,
    thisArg: ?any): any {
  var resultIndex = findIndex(array, callback, thisArg);
  return resultIndex >=0 ? array[resultIndex] : undefined;
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
function findIndex(
    array: Array,
    callback: (element: any, index: number, array: Array) => any,
    thisArg: ?any): any {
  var result = -1;
  array.some(function(element, index, array) {
    if (callback.call(thisArg, element, index, array)) {
      result = index;
      return true;
    } else {
      return false;
    }
  });
  return result;
}

module.exports = {
  find,
  findIndex,
  from,
};
