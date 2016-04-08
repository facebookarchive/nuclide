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

// We have to create an invariant function that is a lie because using invariant() with an
// instanceof check is the only way to convince Flow of the type of an unbound `this`.
const invariant = (condition: boolean) => {};

describe('Array.prototype.find()', () => {
  it('finds using ===', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = item => { count++; return item === 'baz'; };
    expect(es6Array.find(array, test)).toBe('baz');
    expect(count).toBe(2);
  });

  it('returns undefined when element not found', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = item => { count++; return item === 'foobazbiz'; };
    expect(es6Array.find(array, test)).toBe(undefined);
    expect(count).toBe(3);
  });

  it('honors thisArg', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = function(item: string) {
      count++;
      invariant(typeof this === 'string');
      return item.startsWith(this);
    };
    expect(es6Array.find(array, test, 'f')).toBe('foo');
    expect(count).toBe(1);
    expect(es6Array.find(array, test, 'bi')).toBe('biz');
    expect(count).toBe(4);
  });

  it('properly handles finding element in sparse arrays', () => {
    const array = new Array(3);
    array[2] = 'foo';

    let count = 0;
    const test = function(item) { count++; return item.startsWith('foo'); };
    expect(es6Array.find(array, test)).toBe('foo');
    expect(count).toBe(1);
  });

  it('properly handles finding undefined in sparse arrays', () => {
    const array = new Array(4);
    array[0] = 'foo';
    array[2] = 'bar';
    array[3] = undefined;

    let count = 0;
    const test = function(item) { count++; return item === undefined; };
    expect(es6Array.find(array, test)).toBe(undefined);
    expect(count).toBe(3);
  });

  it('properly handles completely sparse arrays', () => {
    const array = new Array(3);
    let count = 0;
    const test = function(item) { count++; return item === undefined; };
    expect(es6Array.find(array, test)).toBe(undefined);
    expect(count).toBe(0);
  });

  it('properly handles arrays with explicitly undefined values', () => {
    const array = [undefined, undefined, undefined];
    let count = 0;
    const test = function(item) { count++; return item === undefined; };
    expect(es6Array.find(array, test)).toBe(undefined);
    expect(count).toBe(1);
  });
});

describe('Array.prototype.findIndex()', () => {
  it('finds using ===', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = item => { count++; return item === 'baz'; };
    expect(es6Array.findIndex(array, test)).toBe(1);
    expect(count).toBe(2);
  });

  it('returns undefined when element not found', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = item => { count++; return item === 'foobazbiz'; };
    expect(es6Array.findIndex(array, test)).toBe(-1);
    expect(count).toBe(3);
  });

  it('honors thisArg', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = function(item) {
      count++;
      invariant(typeof this === 'string');
      return item.startsWith(this);
    };
    expect(es6Array.findIndex(array, test, 'f')).toBe(0);
    expect(count).toBe(1);
    expect(es6Array.findIndex(array, test, 'bi')).toBe(2);
    expect(count).toBe(4);
  });

  it('properly handles finding element in sparse arrays', () => {
    const array = new Array(3);
    array[2] = 'foo';

    let count = 0;
    const test = function(item) { count++; return item.startsWith('foo'); };
    expect(es6Array.findIndex(array, test)).toBe(2);
    expect(count).toBe(1);
  });

  it('properly handles finding undefined in sparse arrays', () => {
    const array = new Array(4);
    array[0] = 'foo';
    array[2] = 'bar';
    array[3] = undefined;

    let count = 0;
    const test = function(item) { count++; return item === undefined; };
    expect(es6Array.findIndex(array, test)).toBe(3);
    expect(count).toBe(3);
  });

  it('properly handles completely sparse arrays', () => {
    const array = new Array(3);
    let count = 0;
    const test = function(item) { count++; return item === undefined; };
    expect(es6Array.findIndex(array, test)).toBe(-1);
    expect(count).toBe(0);
  });

  it('properly handles arrays with explicitly undefined values', () => {
    const array = [undefined, undefined, undefined];
    let count = 0;
    const test = function(item) { count++; return item === undefined; };
    expect(es6Array.findIndex(array, test)).toBe(0);
    expect(count).toBe(1);
  });
});

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
