'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var PathSet = require('../lib/PathSet');
var {expectAsyncFailure} = require('nuclide-test-helpers');
var {from} = require('nuclide-commons').array;

describe('PathSet', () => {
  it('processor sees the set as it was when passed to submit()', () => {
    var pathSet = new PathSet({initialChunkSize: 2});

    var set1 = new Set();
    pathSet.addPaths(['a', 'b']);
    var promise1 = pathSet.submit(path => set1.add(path));

    var set2 = new Set();
    pathSet.addPaths(['c', 'd', 'e']);
    var promise2 = pathSet.submit(path => set2.add(path));

    var set3 = new Set();
    pathSet.removePaths(['a', 'd']);
    var promise3 = pathSet.submit(path => set3.add(path));

    var set4 = new Set();
    pathSet.addPaths(['a']);
    var promise4 = pathSet.submit(path => set4.add(path));

    waitsForPromise(async () => {
      await Promise.all([promise1, promise2, promise3, promise4]);
      expect(from(set1.values()).sort()).toEqual(['a', 'b']);
      expect(from(set2.values()).sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(from(set3.values()).sort()).toEqual(['b', 'c', 'e']);
      expect(from(set4.values()).sort()).toEqual(['a', 'b', 'c', 'e']);

      // Check the internals to make sure the PathSet cleaned up properly.
      expect(pathSet._paths).toEqual({'a': true, 'b': true, 'c': true, 'e': true});
      expect(pathSet._latestPaths).toBe(null);
      expect(pathSet._jobs).toEqual([]);
    });
  });

  it('invoking cancelJob() terminates the batch job and rejects the Promise', () => {
    var initialPaths = {'a': true, 'b': true, 'c': true, 'd': true};
    var pathSet = new PathSet({initialChunkSize: 2, paths: initialPaths});

    var set = new Set();
    var promise = pathSet.submit(path => set.add(path));
    promise.cancelJob();

    waitsForPromise(async () => {
      await expectAsyncFailure(promise,
          error => expect(error.errorCode).toBe(PathSet.ERROR_CODE_CANCELED));

      // Only 2 of the 4 paths should be processed due to the cancellation.
      expect(set.size).toBe(2);

      // Check the internals to make sure the PathSet cleaned up properly.
      expect(pathSet._paths).toEqual({'a': true, 'b': true, 'c': true, 'd': true});
      expect(pathSet._latestPaths).toBe(null);
      expect(pathSet._jobs).toEqual([]);
    });
  });
});
