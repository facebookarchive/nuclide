'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {intersect} from '../lib/set.js';

describe('Set', () => {
  it('intersect', () => {
    const set1 = new Set(['foo', 'bar', 'baz']);
    const set2 = new Set(['fool', 'bar', 'bazl']);
    const result = intersect(set1, set2);

    expect(result.size).toBe(1);
    expect(result.has('bar')).toBe(true);
  });
});
