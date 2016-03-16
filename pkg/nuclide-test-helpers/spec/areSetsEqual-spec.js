'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {areSetsEqual} from '..';

describe('areSetsEqual', () => {
  it('correctly compares empty sets', () => {
    expect(areSetsEqual(new Set(), new Set())).toBe(true);
  });

  it('correctly compares sets with the same properties', () => {
    expect(areSetsEqual(new Set(['foo']), new Set(['foo']))).toBe(true);
  });

  it('returns false when properties are not equal', () => {
    expect(areSetsEqual(new Set(['foo']), new Set(['bar']))).toBe(false);
  });

  it('returns false when an item exists in one set but not the other', () => {
    expect(areSetsEqual(new Set(['foo']), new Set())).toBe(false);
    expect(areSetsEqual(new Set(), new Set(['foo']))).toBe(false);
  });
});
