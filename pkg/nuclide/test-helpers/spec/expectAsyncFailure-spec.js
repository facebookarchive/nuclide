'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {expectAsyncFailure} = require('../lib/main');

describe('expectAsyncFailure', () => {
  it('fails when provided Promise succeeds', () => {
    var verify = jasmine.createSpy();
    waitsForPromise({shouldReject: true}, () => {
      return expectAsyncFailure(
          Promise.resolve('resolved, not rejected!'),
          verify);
    });
    runs(() => {
      expect(verify.callCount).toBe(0);
    });
  });

  it('fails when provided Promise fails but with wrong error message', () => {
    var callCount = 0;
    function verify(error) {
      ++callCount;
      var expectedMessage = 'I failed badly.';
      if (error.message !== expectedMessage) {
        throw Error(`Expected '${expectedMessage}', but was ${error.message}.`);
      }
    }

    waitsForPromise({shouldReject: true}, () => {
      return expectAsyncFailure(
          Promise.reject(Error('I failed.')),
          verify);
    });
    runs(() => {
      expect(callCount).toBe(1);
    });
  });

  it('succeeds when provided Promise fails in the expected way', () => {
    var callCount = 0;
    function verify(error) {
      ++callCount;
      var expectedMessage = 'I failed badly.';
      if (error.message !== expectedMessage) {
        throw Error(`Expected '${expectedMessage}', but was ${error.message}.`);
      }
    }

    waitsForPromise({shouldReject: false}, () => {
      return expectAsyncFailure(
          Promise.reject(Error('I failed badly.')),
          verify);
    });
    runs(() => {
      expect(callCount).toBe(1);
    });
  });
});
