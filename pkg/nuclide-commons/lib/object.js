Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isEmpty = isEmpty;
exports.keyMirror = keyMirror;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * O(1)-check if a given object is empty (has no properties, inherited or not)
 */

function isEmpty(obj) {
  for (var _key in obj) {
    // eslint-disable-line no-unused-vars
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

function keyMirror(obj) {
  var ret = {};
  Object.keys(obj).forEach(function (key) {
    ret[key] = key;
  });
  return ret;
}