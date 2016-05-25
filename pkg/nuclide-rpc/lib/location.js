'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Location} from './types';

import invariant from 'assert';

export function locationToString(location: Location): string {
  switch (location.type) {
    case 'source':
      return `${location.fileName}(${location.line})`;
    case 'builtin':
      return '<builtin>';
    default:
      throw new Error('Bad location type');
  }
}

export function locationsEqual(first: Location, second: Location): boolean {
  if (first.type !== second.type) {
    return false;
  }
  switch (first.type) {
    case 'source':
      invariant(second.type === 'source');
      return first.fileName === second.fileName && first.line === second.line;
    case 'builtin':
      return true;
    default:
      throw new Error('Bad location type');
  }
}
