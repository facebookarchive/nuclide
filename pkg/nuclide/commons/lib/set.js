'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {from} from './array';
export function intersect<T>(a: Set<T>, b: Set<T>): Set<T> {

  return new Set(from(a).filter(e => b.has(e)));
}
