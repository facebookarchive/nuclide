'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import LazyPathSet, {__test__} from '../lib/LazyPathSet';
const {approximateMatchIndicesFor} = __test__;

const PATHS_FIXTURE = {
  'xyz': true,
  'foo/a': true,
  'foo/b': true,
  'foo/bar/baz': true,
  'foo/bar/b': true,
};

describe('approximateMatchIndicesFor', () => {
  it('highlights matched segments', () => {
    expect(approximateMatchIndicesFor(
      'foo',
      'some/path/foo/bar',
      ['foo']
    )).toEqual([10, 11, 12]);
    expect(approximateMatchIndicesFor(
      'foo',
      'some/path/foo/bar',
      []
    )).toEqual([]);
    expect(approximateMatchIndicesFor(
      'foo',
      'some/other/path/foo/bar/baz',
      ['foo', 'bar']
    )).toEqual([16, 17, 18, 20, 21, 22]);
  });
});

describe('LazyPathSet', () => {
  it('Stores all passed-in paths', () => {
    const pathSet = new LazyPathSet({paths: PATHS_FIXTURE});
    expect(pathSet._getPaths()).toEqual(new Set([
      'xyz',
      'foo/a',
      'foo/b',
      'foo/bar/baz',
      'foo/bar/b',
    ]));
  });

  it('Builds an initial index from the PathSet', () => {
    const pathSet = new LazyPathSet({paths: PATHS_FIXTURE});
    const index = pathSet._getIndex();
    expect(index.segments.size).toEqual(2);
    expect(index.segments.get('foo')).toEqual(new Set([
      'foo/a',
      'foo/b',
      'foo/bar/baz',
      'foo/bar/b',
    ]));
    expect(index.segments.get('bar')).toEqual(new Set([
      'foo/bar/baz',
      'foo/bar/b',
    ]));

    expect(index.filenames.size).toEqual(4);
    expect(index.filenames.get('a')).toEqual(new Set([
      'foo/a',
    ]));
    expect(index.filenames.get('b')).toEqual(new Set([
      'foo/b',
      'foo/bar/b',
    ]));
    expect(index.filenames.get('xyz')).toEqual(new Set([
      'xyz',
    ]));
  });

  it('returns matching results', () => {
    const pathSet = new LazyPathSet({paths: PATHS_FIXTURE});
    waitsForPromise(async () => {
      let results = await pathSet.doQuery('foo').toArray().toPromise();
      expect(results.map(result => result.value)).toEqual([
        'foo/a',
        'foo/b',
        'foo/bar/baz',
        'foo/bar/b',
      ]);

      results = await pathSet.doQuery('bar').toArray().toPromise();
      expect(results.map(result => result.value)).toEqual([
        'foo/bar/baz',
        'foo/bar/b',
      ]);

      results = await pathSet.doQuery('foo bar').toArray().toPromise();
      expect(results.map(result => result.value)).toEqual([
        'foo/bar/baz',
        'foo/bar/b',
        'foo/a',
        'foo/b',
      ]);

      results = await pathSet.doQuery('bar foo').toArray().toPromise();
      expect(results.map(result => result.value)).toEqual([
        'foo/bar/baz',
        'foo/bar/b',
        'foo/a',
        'foo/b',
      ]);

      results = await pathSet.doQuery('nothingwillmatchthisquery').toArray().toPromise();
      expect(results.map(result => result.value)).toEqual([]);
    });
  });

});
