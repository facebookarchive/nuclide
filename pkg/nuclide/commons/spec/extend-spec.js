'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const {extend} = require('../lib/main');

describe('extend()', () => {

  it('extends multiple arguments without touching the source', () => {
    const obj1 = {a: 2};
    const obj2 = {b: 3};
    const obj3 = {d: '4'};
    const result = extend.immutableExtend(obj1, obj2, obj3);
    expect(obj1).toEqual({a: 2});
    expect(obj2).toEqual({b: 3});
    expect(obj3).toEqual({d: '4'});
    expect(result).toEqual({a: 2, b: 3, d: '4'});
  });

  it('should prioritize the last arguments on the first ones', () => {
    const result = extend.immutableExtend(
      {a: 'abc'},
      {a: 'def', b: 'lol'},
      {b: 'ghi', c: 'mom'}
    );
    expect(result).toEqual({
      a: 'def',
      b: 'ghi',
      c: 'mom',
    });
  });
});
