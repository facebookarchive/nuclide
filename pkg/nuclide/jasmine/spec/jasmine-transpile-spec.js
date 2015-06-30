'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function testFlowtypedFunction(arg: number): number {
  return arg;
}

describe('Jasmine transpile test suite', () => {
  it('test transpiler worked as exepcted', () => {
    var promise = Promise.resolve('test');
    expect(typeof promise).toEqual('object');
    expect(testFlowtypedFunction(1)).toEqual(1);
  });
});

describe('Jasmine waitsForPromise test suite', () => {
  beforeEach(() => window.useRealClock());

  it('test waitsForPromise worked as expected on a resolved promise', () => {
    waitsForPromise(async () => {
      var promise = Promise.resolve('test');
      var result = await promise;
      expect(result).toEqual('test');
    });
  });

  it('test waitsForPromise worked as expected on a rejected promise', () => {
    waitsForPromise({shouldReject: true}, () => Promise.reject('test'));
  });

  it('test waitsForPromise worked as expected on a customized timeout', () => {
    // This is more than default timeout of 5 seconds.
    waitsForPromise({shouldReject: false, timeout: 7 * 1000}, async () => {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 6 * 1000);
      });
    });
  });
});
