'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var GLOBAL_MAP_NAME = '__NUCLIDE_SINGLETONS__';

function getMap(): Map<string, any> {
  var map = global[GLOBAL_MAP_NAME];
  if (!map) {
    map = global[GLOBAL_MAP_NAME] = new Map();
  }
  return map;
}

/**
 * Creates a per-global singleton value.
 * constructor will be called exactly once, future invocations will
 * return the result of the constructor call.
 */
export function get<T>(field: string, constructor: () => T): T {
  var map = getMap();
  if (!map.has(field)) {
    map.set(field, constructor());
  }
  return map.get(field);
}

export function clear(field: string): void {
  getMap().delete(field);
}

export function reset<T>(field: string, constructor: () => T): T {
  clear(field);
  return get(field, constructor);
}
