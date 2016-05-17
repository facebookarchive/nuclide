'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  arrayRemove,
  arrayEqual,
  arrayCompact,
  mapUnion,
  isEmpty,
  keyMirror,
  setIntersect,
} from '../collection';

describe('arrayRemove', () => {
  let a: any;
  let empty: any;
  let single: any;

  beforeEach(() => {
    a = ['a', 'b', 'c'];
    empty = [];
    single = ['x'];
  });

  it('removes an element properly', () => {
    arrayRemove(a, 'b');
    expect(a).toEqual(['a', 'c']);
  });

  it('removes the first element properly', () => {
    arrayRemove(a, 'a');
    expect(a).toEqual(['b', 'c']);
  });

  it('removes the last element properly', () => {
    arrayRemove(a, 'c');
    expect(a).toEqual(['a', 'b']);
  });

  it('does nothing if the element is not found', () => {
    arrayRemove(a, 'd');
    expect(a).toEqual(['a', 'b', 'c']);
  });

  it('does nothing to an empty array', () => {
    arrayRemove(empty, 'a');
    expect(empty).toEqual([]);
  });

  it('works when there is a single element', () => {
    arrayRemove(single, 'x');
    expect(single).toEqual([]);
  });
});

describe('arrayEqual', () => {
  it('checks boolean elements', () => {
    expect(arrayEqual([true, false, true], [true, false, true])).toBe(true);
    expect(arrayEqual([true], [false])).toBe(false);
  });

  it('checks number elements', () => {
    expect(arrayEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(arrayEqual([1, 5, 3], [1, 2, 3])).toBe(false);
  });

  it('checks object elements', () => {
    expect(arrayEqual([{}], [{}])).toBe(false);
    expect(arrayEqual([{x: 1}, {x: 2}], [{x: 1}, {x: 2}], (a, b) => a.x === b.x)).toBe(true);
  });

  it('works with arrays of different lengths', () => {
    expect(arrayEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(arrayEqual([1, 2, 3], [1, 2])).toBe(false);
  });
});

describe('arrayCompact', () => {
  it('filters out null and undefined elements', () => {
    expect(arrayCompact([0, false, '', [], null, undefined])).toEqual([0, false, '', []]);
  });
});

describe('mapUnion', () => {
  it('merges two unique maps', () => {
    const map1 = new Map([['key1', 'value1'], ['key2', 'value2']]);
    const map2 = new Map([['key3', 'value3'], ['key4', 'value4']]);
    const result = mapUnion(map1, map2);

    expect(result.size).toBe(4);
    expect(result.get('key1')).toBe('value1');
    expect(result.get('key2')).toBe('value2');
    expect(result.get('key3')).toBe('value3');
    expect(result.get('key4')).toBe('value4');
  });

  it('overrodes with the values of the latest maps', () => {
    const map1 = new Map([['commonKey', 'value1'], ['key2', 'value2']]);
    const map2 = new Map([['commonKey', 'value3'], ['key4', 'value4']]);
    const result = mapUnion(...[map1, map2]);

    expect(result.size).toBe(3);
    expect(result.get('commonKey')).toBe('value3');
    expect(result.get('key2')).toBe('value2');
    expect(result.get('key4')).toBe('value4');
  });
});

describe('isEmpty', () => {
  it('correctly identifies empty Objects', () => {
    expect(isEmpty({})).toEqual(true);
  });

  it('correctly identifies non-empty Objects', () => {
    const proto = {a: 1, b: 2, c: 3};
    const objWithOwnProperties = Object.create(proto, {foo: {value: 'bar'}});
    const objWithoutOwnProperties = Object.create(proto);

    expect(isEmpty({a: 1})).toEqual(false);
    expect(isEmpty(objWithOwnProperties)).toEqual(false);
    expect(isEmpty(objWithoutOwnProperties)).toEqual(false);
  });

});

describe('keyMirror', () => {
  it('correctly mirrors objects', () => {
    expect(keyMirror({a: null, b: null})).toEqual({a: 'a', b: 'b'});
  });
});

describe('setIntersect', () => {
  it('intersects', () => {
    const set1 = new Set(['foo', 'bar', 'baz']);
    const set2 = new Set(['fool', 'bar', 'bazl']);
    const result = setIntersect(set1, set2);

    expect(result.size).toBe(1);
    expect(result.has('bar')).toBe(true);
  });
});
