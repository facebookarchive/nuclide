'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const es6Array = require('../lib/array.js');

// We have to create an invariant function that is a lie because using invariant() with an
// instanceof check is the only way to convince Flow of the type of an unbound `this`.
const invariant = (condition: boolean) => {};

describe('Array.from()', () => {
  it('produces an Array from Set', () => {
    const set = new Set(['foo', 'bar', 'baz']);
    expect(es6Array.from(set)).toEqual(['foo', 'bar', 'baz']);
  });

  it('produces an Array from Set.keys()', () => {
    const set = new Set(['foo', 'bar', 'baz']);
    expect(es6Array.from(set.keys())).toEqual(['foo', 'bar', 'baz']);
  });

  it('produces an Array from Set.values()', () => {
    const set = new Set(['foo', 'bar', 'baz']);
    expect(es6Array.from(set.values())).toEqual(['foo', 'bar', 'baz']);
  });

  it('produces an Array from Set.entries()', () => {
    const set = new Set(['foo', 'bar', 'baz']);
    expect(es6Array.from(set.entries())).toEqual(
        [['foo', 'foo'], ['bar', 'bar'], ['baz', 'baz']]);
  });

  it('produces an Array from Map', () => {
    const map = new Map();
    map.set('a', 'b');
    map.set('c', 'd');
    map.set('e', 'f');
    expect(es6Array.from(map)).toEqual(
        [['a', 'b'], ['c', 'd'], ['e', 'f']]);
  });

  it('produces an Array from Map.keys()', () => {
    const map = new Map();
    map.set('a', 'b');
    map.set('c', 'd');
    map.set('e', 'f');
    expect(es6Array.from(map.keys())).toEqual(['a', 'c', 'e']);
  });

  it('produces an Array from Map.values()', () => {
    const map = new Map();
    map.set('a', 'b');
    map.set('c', 'd');
    map.set('e', 'f');
    expect(es6Array.from(map.values())).toEqual(['b', 'd', 'f']);
  });

  it('produces an Array from Map.entries()', () => {
    const map = new Map();
    map.set('a', 'b');
    map.set('c', 'd');
    map.set('e', 'f');
    expect(es6Array.from(map.entries())).toEqual(
        [['a', 'b'], ['c', 'd'], ['e', 'f']]);
  });

  it('produces a new Array from an Array', () => {
    const array = ['foo', 'bar', 'baz'];
    const result = es6Array.from(array);
    expect(result).toEqual(array);
    expect(result).not.toBe(array);
  });

  it('produces an Array from an array-like', () => {
    const arrayLike: {length: number} = {length: 3};
    arrayLike[0] = 'foo';
    arrayLike[1] = 'bar';
    arrayLike[2] = 'baz';
    expect(es6Array.from(arrayLike)).toEqual(['foo', 'bar', 'baz']);
  });

  it('rejects an arg that is not an array-like or iterable object', () => {
    // $FlowFixMe
    const tryIt = () => es6Array.from({});
    expect(tryIt).toThrow();
  });

  it('applies mapFn in the iterable case', () => {
    const set = new Set(['foo', 'bar', 'baz']);
    const f = (arg) => arg + arg;
    expect(es6Array.from(set, f)).toEqual(['foofoo', 'barbar', 'bazbaz']);
  });

  it('applies mapFn in the array-like case', () => {
    const arrayLike: {length: number} = {length: 3};
    arrayLike[0] = 'foo';
    arrayLike[1] = 'bar';
    arrayLike[2] = 'baz';

    const f = (arg) => arg + arg;
    expect(es6Array.from(arrayLike, f)).toEqual(['foofoo', 'barbar', 'bazbaz']);
  });

  it('applies mapFn in the iterable case with thisArg', () => {
    const set = new Set(['foo', 'bar', 'baz']);
    const f = function(arg) { return this.prefix + arg; };
    const thisArg = {prefix: 'p-'};
    expect(es6Array.from(set, f, thisArg)).toEqual(['p-foo', 'p-bar', 'p-baz']);
  });

  it('applies mapFn in the array-like case with thisArg', () => {
    const arrayLike = {};
    arrayLike[0] = 'foo';
    arrayLike[1] = 'bar';
    arrayLike[2] = 'baz';
    arrayLike['length'] = 3;

    const f = function(arg) { return this.prefix + arg; };
    const thisArg = {prefix: 'p-'};
    expect(es6Array.from(arrayLike, f, thisArg)).toEqual(['p-foo', 'p-bar', 'p-baz']);
  });
});

describe('Array.prototype.find()', () => {
  it('finds using ===', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = (item) => { count++; return item === 'baz'; };
    expect(es6Array.find(array, test)).toBe('baz');
    expect(count).toBe(2);
  });

  it('returns undefined when element not found', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = (item) => { count++; return item === 'foobazbiz'; };
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
    const test = (item) => { count++; return item === 'baz'; };
    expect(es6Array.findIndex(array, test)).toBe(1);
    expect(count).toBe(2);
  });

  it('returns undefined when element not found', () => {
    const array = ['foo', 'baz', 'biz'];
    let count = 0;
    const test = (item) => { count++; return item === 'foobazbiz'; };
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
});
