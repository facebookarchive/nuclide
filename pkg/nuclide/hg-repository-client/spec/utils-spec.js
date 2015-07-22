'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  addAllParentDirectoriesToCache,
  removeAllParentDirectoriesFromCache,
} = require('../lib/utils');

describe('nuclide-hg-repository-client/utils', () => {
  var cache: ?Map;
  var TEST_PATH = '/A/B/C/D.js';

  beforeEach(() => {
    // Set up the cache as if these two other files were already inserted:
    // '/A/blah.js' and '/Z/blah.js'.
    cache = new Map();
    cache.set('/', 2);
    cache.set('/A/', 1);
    cache.set('/Z/', 1);
  });

  describe('addAllParentDirectoriesToCache', () => {
    describe('when no pathPrefixToSkip is provided', () => {
      it('correctly adds parent directories.', () => {
        // This should add '/', '/A/', '/A/B/', and '/A/B/C/'.
        addAllParentDirectoriesToCache(cache, TEST_PATH, /* pathPrefixToSkip */ null);

        expect(cache.size).toBe(5);
        expect(cache.get('/')).toBe(3);
        expect(cache.get('/A/')).toBe(2);
        expect(cache.get('/A/B/')).toBe(1);
        expect(cache.get('/A/B/C/')).toBe(1);
        expect(cache.get('/Z/')).toBe(1);
      });
    });

    describe('when a pathPrefixToSkip is provided and has a trailing slash', () => {
      it('correctly adds parent directories.', () => {
        // This should only add '/A/B/C/'.
        addAllParentDirectoriesToCache(cache, TEST_PATH, '/A/B/');

        expect(cache.size).toBe(4);
        expect(cache.get('/')).toBe(2);
        expect(cache.get('/A/')).toBe(1);
        expect(cache.get('/A/B/')).toBe(undefined);
        expect(cache.get('/A/B/C/')).toBe(1);
        expect(cache.get('/Z/')).toBe(1);
      });
    });

    describe('when a pathPrefixToSkip is provided and does not have a trailing slash', () => {
      it('correctly adds parent directories.', () => {
        // This should only add '/A/B/C/'.
        addAllParentDirectoriesToCache(cache, TEST_PATH, '/A/B');

        expect(cache.size).toBe(4);
        expect(cache.get('/')).toBe(2);
        expect(cache.get('/A/')).toBe(1);
        expect(cache.get('/A/B/')).toBe(undefined);
        expect(cache.get('/A/B/C/')).toBe(1);
        expect(cache.get('/Z/')).toBe(1);
      });
    });
  });


  describe('removeAllParentDirectoriesFromCache', () => {
    describe('when no pathPrefixToSkip is provided', () => {
      it('correctly removes parent directories.', () => {
        addAllParentDirectoriesToCache(cache, TEST_PATH, /* pathPrefixToSkip */ null);
        removeAllParentDirectoriesFromCache(cache, TEST_PATH, /* pathPrefixToSkip */ null);

        // These operations should leave the cache unchanged.
        expect(cache.size).toBe(3);
        expect(cache.get('/')).toBe(2);
        expect(cache.get('/A/')).toBe(1);
        expect(cache.get('/Z/')).toBe(1);
      });
    });

    describe('when a pathPrefixToSkip is provided and has a trailing slash', () => {
      it('correctly removes parent directories.', () => {
        addAllParentDirectoriesToCache(cache, TEST_PATH, /* pathPrefixToSkip */ null);

        // This should only remove '/A/B/C'.
        removeAllParentDirectoriesFromCache(cache, TEST_PATH, '/A/B/');

        expect(cache.size).toBe(4);
        expect(cache.get('/')).toBe(3);
        expect(cache.get('/A/')).toBe(2);
        expect(cache.get('/A/B/')).toBe(1);
        expect(cache.get('/A/B/C/')).toBe(undefined);
        expect(cache.get('/Z/')).toBe(1);
      });
    });

    describe('when a pathPrefixToSkip is provided and does not have a trailing slash', () => {
      it('correctly removes parent directories.', () => {
        addAllParentDirectoriesToCache(cache, TEST_PATH, /* pathPrefixToSkip */ null);

        // This should only remove '/A/B/C'.
        removeAllParentDirectoriesFromCache(cache, TEST_PATH, '/A/B');

        expect(cache.size).toBe(4);
        expect(cache.get('/')).toBe(3);
        expect(cache.get('/A/')).toBe(2);
        expect(cache.get('/A/B/')).toBe(1);
        expect(cache.get('/A/B/C/')).toBe(undefined);
        expect(cache.get('/Z/')).toBe(1);
      });
    });
  });
});
