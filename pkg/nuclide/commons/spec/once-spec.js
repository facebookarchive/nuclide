'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const once = require('../lib/once.js');

describe('once', () => {
  it('correctly calls only once', () => {
    let num = 1;
    const onceFn = once((n) => num += n);
    expect(onceFn(2)).toEqual(3);
    expect(onceFn(2)).toEqual(3);
  });
});
