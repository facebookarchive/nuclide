'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const es6Array = require('../lib/array');

describe('Array.remove', () => {
  let a: any;
  let empty: any;
  let single: any;

  beforeEach(() => {
    a = ['a', 'b', 'c'];
    empty = [];
    single = ['x'];
  });

  it('removes an element properly', () => {
    es6Array.remove(a, 'b');
    expect(a).toEqual(['a', 'c']);
  });

  it('removes the first element properly', () => {
    es6Array.remove(a, 'a');
    expect(a).toEqual(['b', 'c']);
  });

  it('removes the last element properly', () => {
    es6Array.remove(a, 'c');
    expect(a).toEqual(['a', 'b']);
  });

  it('does nothing if the element is not found', () => {
    es6Array.remove(a, 'd');
    expect(a).toEqual(['a', 'b', 'c']);
  });

  it('does nothing to an empty array', () => {
    es6Array.remove(empty, 'a');
    expect(empty).toEqual([]);
  });

  it('works when there is a single element', () => {
    es6Array.remove(single, 'x');
    expect(single).toEqual([]);
  });
});

describe('Array.equal', () => {

  it('checks boolean elements', () => {
    expect(es6Array.equal([true, false, true], [true, false, true])).toBe(true);
    expect(es6Array.equal([true], [false])).toBe(false);
  });

  it('checks number elements', () => {
    expect(es6Array.equal([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(es6Array.equal([1, 5, 3], [1, 2, 3])).toBe(false);
  });

  it('checks object elements', () => {
    expect(es6Array.equal([{}], [{}])).toBe(false);
    expect(es6Array.equal([{x: 1}, {x: 2}], [{x: 1}, {x: 2}], (a, b) => a.x === b.x)).toBe(true);
  });

  it('works with arrays of different lengths', () => {
    expect(es6Array.equal([1, 2], [1, 2, 3])).toBe(false);
    expect(es6Array.equal([1, 2, 3], [1, 2])).toBe(false);
  });
});

describe('Array.compact', () => {
  it('filters out null and undefined elements', () => {
    expect(es6Array.compact([0, false, '', [], null, undefined])).toEqual([0, false, '', []]);
  });
});
