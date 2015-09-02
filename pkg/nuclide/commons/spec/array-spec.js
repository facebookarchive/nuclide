'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var es6Array = require('../lib/array.js');

// We have to create an invariant function that is a lie because using invariant() with an
// instanceof check is the only way to convince Flow of the type of an unbound `this`.
var invariant = (condition: boolean) => {};

describe('Array.from()', () => {
  it('produces an Array from Set', () => {
    var set = new Set(['foo', 'bar', 'baz']);
    expect(es6Array.from(set)).toEqual(['foo', 'bar', 'baz']);
  });

  it('produces an Array from Set.keys()', () => {
    var set = new Set(['foo', 'bar', 'baz']);
    // $FlowIssue
    expect(es6Array.from(set.keys())).toEqual(['foo', 'bar', 'baz']);
  });

  it('produces an Array from Set.values()', () => {
    var set = new Set(['foo', 'bar', 'baz']);
    // $FlowIssue
    expect(es6Array.from(set.values())).toEqual(['foo', 'bar', 'baz']);
  });

  it('produces an Array from Set.entries()', () => {
    var set = new Set(['foo', 'bar', 'baz']);
    // $FlowIssue
    expect(es6Array.from(set.entries())).toEqual(
        [['foo', 'foo'], ['bar', 'bar'], ['baz', 'baz']]);
  });

  it('produces an Array from Map', () => {
    var map = new Map();
    map.set('a', 'b');
    map.set('c', 'd');
    map.set('e', 'f');
    expect(es6Array.from(map)).toEqual(
        [['a', 'b'], ['c', 'd'], ['e', 'f']]);
  });

  it('produces an Array from Map.keys()', () => {
    var map = new Map();
    map.set('a', 'b');
    map.set('c', 'd');
    map.set('e', 'f');
    expect(es6Array.from(map.keys())).toEqual(['a', 'c', 'e']);
  });

  it('produces an Array from Map.values()', () => {
    var map = new Map();
    map.set('a', 'b');
    map.set('c', 'd');
    map.set('e', 'f');
    expect(es6Array.from(map.values())).toEqual(['b', 'd', 'f']);
  });

  it('produces an Array from Map.entries()', () => {
    var map = new Map();
    map.set('a', 'b');
    map.set('c', 'd');
    map.set('e', 'f');
    expect(es6Array.from(map.entries())).toEqual(
        [['a', 'b'], ['c', 'd'], ['e', 'f']]);
  });

  it('produces a new Array from an Array', () => {
    var array = ['foo', 'bar', 'baz'];
    var result = es6Array.from(array);
    expect(result).toEqual(array);
    expect(result).not.toBe(array);
  });

  it('produces an Array from an array-like', () => {
    var arrayLike: {length: number} = {length: 3};
    arrayLike[0] = 'foo';
    arrayLike[1] = 'bar';
    arrayLike[2] = 'baz';
    expect(es6Array.from(arrayLike)).toEqual(['foo', 'bar', 'baz']);
  });

  it('rejects an arg that is not an array-like or iterable object', () => {
    // $FlowFixMe
    var tryIt = () => es6Array.from({});
    expect(tryIt).toThrow();
  });

  it('applies mapFn in the iterable case', () => {
    var set = new Set(['foo', 'bar', 'baz']);
    var f = (arg) => arg + arg;
    expect(es6Array.from(set, f)).toEqual(['foofoo', 'barbar', 'bazbaz']);
  });

  it('applies mapFn in the array-like case', () => {
    var arrayLike: {length: number} = {length: 3};
    arrayLike[0] = 'foo';
    arrayLike[1] = 'bar';
    arrayLike[2] = 'baz';

    var f = (arg) => arg + arg;
    expect(es6Array.from(arrayLike, f)).toEqual(['foofoo', 'barbar', 'bazbaz']);
  });

  it('applies mapFn in the iterable case with thisArg', () => {
    var set = new Set(['foo', 'bar', 'baz']);
    var f = function(arg) { return this.prefix + arg; };
    var thisArg = {prefix: 'p-'};
    // $FlowFixMe
    expect(es6Array.from(set, f, thisArg)).toEqual(['p-foo', 'p-bar', 'p-baz']);
  });

  it('applies mapFn in the array-like case with thisArg', () => {
    var arrayLike = {};
    arrayLike[0] = 'foo';
    arrayLike[1] = 'bar';
    arrayLike[2] = 'baz';
    arrayLike['length'] = 3;

    var f = function(arg) { return this.prefix + arg; };
    var thisArg = {prefix: 'p-'};
    // $FlowFixMe
    expect(es6Array.from(arrayLike, f, thisArg)).toEqual(['p-foo', 'p-bar', 'p-baz']);
  });
});

describe('Array.prototype.find()', () => {
  it('finds using ===', () => {
    var array = ['foo', 'baz', 'biz'];
    var count = 0;
    var test = (item) => { count++; return item === 'baz'; };
    expect(es6Array.find(array, test)).toBe('baz');
    expect(count).toBe(2);
  });

  it('returns undefined when element not found', () => {
    var array = ['foo', 'baz', 'biz'];
    var count = 0;
    var test = (item) => { count++; return item === 'foobazbiz'; };
    expect(es6Array.find(array, test)).toBe(undefined);
    expect(count).toBe(3);
  });

  it('honors thisArg', () => {
    var array = ['foo', 'baz', 'biz'];
    var count = 0;
    var test = function(item: string) {
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
    var array = new Array(3);
    array[2] = 'foo';

    var count = 0;
    var test = function(item) { count++; return item.startsWith('foo'); };
    expect(es6Array.find(array, test)).toBe('foo');
    expect(count).toBe(1);
  });

  it('properly handles finding undefined in sparse arrays', () => {
    var array = new Array(4);
    array[0] = 'foo';
    array[2] = 'bar';
    array[3] = undefined;

    var count = 0;
    var test = function(item) { count++; return item === undefined; };
    expect(es6Array.find(array, test)).toBe(undefined);
    expect(count).toBe(3);
  });

  it('properly handles completely sparse arrays', () => {
    var array = new Array(3);
    var count = 0;
    var test = function(item) { count++; return item === undefined; };
    expect(es6Array.find(array, test)).toBe(undefined);
    expect(count).toBe(0);
  });

  it('properly handles arrays with explicitly undefined values', () => {
    var array = [undefined, undefined, undefined];
    var count = 0;
    var test = function(item) { count++; return item === undefined; };
    expect(es6Array.find(array, test)).toBe(undefined);
    expect(count).toBe(1);
  });
});

describe('Array.prototype.findIndex()', () => {
  it('finds using ===', () => {
    var array = ['foo', 'baz', 'biz'];
    var count = 0;
    var test = (item) => { count++; return item === 'baz'; };
    expect(es6Array.findIndex(array, test)).toBe(1);
    expect(count).toBe(2);
  });

  it('returns undefined when element not found', () => {
    var array = ['foo', 'baz', 'biz'];
    var count = 0;
    var test = (item) => { count++; return item === 'foobazbiz'; };
    expect(es6Array.findIndex(array, test)).toBe(-1);
    expect(count).toBe(3);
  });

  it('honors thisArg', () => {
    var array = ['foo', 'baz', 'biz'];
    var count = 0;
    var test = function(item) {
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
    var array = new Array(3);
    array[2] = 'foo';

    var count = 0;
    var test = function(item) { count++; return item.startsWith('foo'); };
    expect(es6Array.findIndex(array, test)).toBe(2);
    expect(count).toBe(1);
  });

  it('properly handles finding undefined in sparse arrays', () => {
    var array = new Array(4);
    array[0] = 'foo';
    array[2] = 'bar';
    array[3] = undefined;

    var count = 0;
    var test = function(item) { count++; return item === undefined; };
    expect(es6Array.findIndex(array, test)).toBe(3);
    expect(count).toBe(3);
  });

  it('properly handles completely sparse arrays', () => {
    var array = new Array(3);
    var count = 0;
    var test = function(item) { count++; return item === undefined; };
    expect(es6Array.findIndex(array, test)).toBe(-1);
    expect(count).toBe(0);
  });

  it('properly handles arrays with explicitly undefined values', () => {
    var array = [undefined, undefined, undefined];
    var count = 0;
    var test = function(item) { count++; return item === undefined; };
    expect(es6Array.findIndex(array, test)).toBe(0);
    expect(count).toBe(1);
  });
});

describe('Array.remove', () => {
  var a: any;
  var empty: any;
  var single: any;

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
