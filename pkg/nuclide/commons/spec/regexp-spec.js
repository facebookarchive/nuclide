'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {safeRegExpFromString} from '../lib/regexp';

describe('safeRegExpFromString', () => {
  it('escapes trailing slashed in the query', () => {
    expect(safeRegExpFromString('test').toString()).toEqual('/test/i');
    expect(safeRegExpFromString('test\\').toString()).toEqual('/test\\\\/i');
    expect(safeRegExpFromString('test\\\\').toString()).toEqual('/test\\\\\\\\/i');
  });
});
