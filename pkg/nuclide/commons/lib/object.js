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
 * O(1)-check if a given object is empty (has no properties, inherited or not)
 */
export function isEmpty(obj: Object): boolean {
  for (const key in obj) { // eslint-disable-line no-unused-vars
    return false;
  }
  return true;
}

function copyProperties(src: ?Object, dest: Object): void {
  if (src == null) {
    return;
  }
  for (const key in src) {
    dest[key] = src[key];
  }
}

/**
 * Modeled after Object.assign():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
export function assign(target: Object, ...sources: Array<?Object>): Object {
  sources.forEach(source => copyProperties(source, target));
  return target;
}

/**
 * Constructs an enumeration with keys equal to their value.
 * e.g. keyMirror({a: null, b: null}) => {a: 'a', b: 'b'}
 *
 * Based off the equivalent function in www.
 */
export function keyMirror(obj: Object): Object {
  const ret = {};
  Object.keys(obj).forEach(key => {
    ret[key] = key;
  });
  return ret;
}
