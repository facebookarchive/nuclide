'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import LazyPathSet from '../lib/LazyPathSet';

const PATHS_FIXTURE = {
  'xyz': true,
  'foo/a': true,
  'foo/b': true,
  'foo/bar/baz': true,
  'foo/bar/b': true,
};

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
});
