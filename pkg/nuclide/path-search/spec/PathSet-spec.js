'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {array} from 'nuclide-commons';
const {from} = array;
import {expectAsyncFailure} from 'nuclide-test-helpers';

import PathSet from '../lib/PathSet';

describe('PathSet', () => {
  it('processor sees the set as it was when passed to submit()', () => {
    const pathSet = new PathSet({initialChunkSize: 2});

    const set1 = new Set();
    pathSet.addPaths(['a', 'b']);
    const promise1 = pathSet.submit(path => { set1.add(path); });

    const set2 = new Set();
    pathSet.addPaths(['c', 'd', 'e']);
    const promise2 = pathSet.submit(path => { set2.add(path); });

    const set3 = new Set();
    pathSet.removePaths(['a', 'd']);
    const promise3 = pathSet.submit(path => { set3.add(path); });

    const set4 = new Set();
    pathSet.addPaths(['a']);
    const promise4 = pathSet.submit(path => { set4.add(path); });

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
    const initialPaths = {'a': true, 'b': true, 'c': true, 'd': true};
    const pathSet = new PathSet({initialChunkSize: 2, paths: initialPaths});

    const set = new Set();
    const promise = pathSet.submit(path => { set.add(path); });
    // $FlowFixMe: Remove the cancelJob expando off the promise.
    promise.cancelJob();

    waitsForPromise(async () => {
      await expectAsyncFailure(
        promise,
        // $FlowFixMe: Remove the errorCode expando off the error.
        error => expect(error.errorCode).toBe(PathSet.ERROR_CODE_CANCELED),
      );

      // Only 2 of the 4 paths should be processed due to the cancellation.
      expect(set.size).toBe(2);

      // Check the internals to make sure the PathSet cleaned up properly.
      expect(pathSet._paths).toEqual({'a': true, 'b': true, 'c': true, 'd': true});
      expect(pathSet._latestPaths).toBe(null);
      expect(pathSet._jobs).toEqual([]);
    });
  });
});
