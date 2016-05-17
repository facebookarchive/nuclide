Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.remove = remove;
exports.equal = equal;
exports.compact = compact;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function remove(array, element) {
  var index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

function equal(array1, array2, equalComparator) {
  if (array1.length !== array2.length) {
    return false;
  }
  var equalFunction = equalComparator || function (a, b) {
    return a === b;
  };
  return array1.every(function (item1, i) {
    return equalFunction(item1, array2[i]);
  });
}

/**
 * Returns a copy of the input Array with all `null` and `undefined` values filtered out.
 * Allows Flow to typecheck the common `filter(x => x != null)` pattern.
 */

function compact(array) {
  var result = [];
  for (var elem of array) {
    if (elem != null) {
      result.push(elem);
    }
  }
  return result;
}