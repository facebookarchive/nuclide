'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {asyncFind} = require('../lib/main');

describe('promises::asyncFind()', () => {

  it('Empty list of items should resolve to null.', () => {
    var isResolved = false;
    var observedResult;
    var isRejected = false;
    var observedError;

    var args = [];
    var test = (value) => { throw new Error('Should not be called.'); };

    runs(() => {
      asyncFind(args, test)
          .then((result) => {
            observedResult = result;
            isResolved = true;
          })
          .catch((error) => {
            observedError = error;
            isRejected = true;
          });
    });

    waitsFor(() => isResolved || isRejected);

    runs(() => {
      expect(isResolved).toBe(true);
      expect(observedResult).toBe(null);
      expect(isRejected).toBe(false);
      expect(observedError).toBe(undefined);
    });
  });

  it('Last item in list resolves.', () => {
    var isResolved = false;
    var observedResult;
    var isRejected = false;
    var observedError;

    var args = ['foo', 'bar', 'baz'];
    var test = (value) => {
      if (value === 'foo') {
        return null;
      } else if (value === 'bar') {
        return Promise.resolve(null);
      } else {
        return Promise.resolve('win');
      }
    };

    runs(() => {
      asyncFind(args, test)
          .then((result) => {
            observedResult = result;
            isResolved = true;
          })
          .catch((error) => {
            observedError = error;
            isRejected = true;
          });
    });

    waitsFor(() => isResolved || isRejected);

    runs(() => {
      expect(isResolved).toBe(true);
      expect(observedResult).toBe('win');
      expect(isRejected).toBe(false);
      expect(observedError).toBe(undefined);
    });
  });

});
