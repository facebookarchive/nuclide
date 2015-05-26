'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {createTask} = require('../lib/bootloader');
var {expectAsyncFailure} = require('nuclide-test-helpers');

describe('Task', () => {
  describe('.invokeRemoteMethod()', () => {
    var task: ?Task = null;

    beforeEach(() => {
      task = createTask();
    });

    afterEach(() => {
      task.dispose();
      task = null;
    });

    // Note: files loaded via invokeRemoteMethod() use a variety of ES6/7+
    // features to verify that Babel transpilation is working as intended.

    it('can call a synchronous function that is a lone export', () => {
      waitsForPromise(async () => {
        var result = await task.invokeRemoteMethod({
          file: require.resolve('./fixtures/one-export-returns-object.js'),
          args: ['add me!'],
        });
        expect(result).toEqual({foo: 'bar', baz: 'add me!'});
      });
    });

    it('can call an async function that is a lone export', () => {
      waitsForPromise(async () => {
        var result = await task.invokeRemoteMethod({
          file: require.resolve('./fixtures/one-export-returns-string-async.js'),
        });
        expect(result).toEqual('#winning');
      });
    });

    it('can call a synchronous function from an exports object', () => {
      waitsForPromise(async () => {
        var result = await task.invokeRemoteMethod({
          file: require.resolve('./fixtures/multiple-exports.js'),
          method: 'product',
          args: [1, 2, 3, 4, 5],
        });
        expect(result).toBe(120);
      });
    });

    it('can call an async function from an exports object', () => {
      waitsForPromise(async () => {
        var result = await task.invokeRemoteMethod({
          file: require.resolve('./fixtures/multiple-exports.js'),
          method: 'asyncFetch',
        });
        expect(result).toEqual({shouldShowUpInJsonSerialization: null});
      });
    });

    it('persists the process it creates (does not create a new one each time)', () => {
      waitsForPromise(async () => {
        function increment() {
          return task.invokeRemoteMethod({
            file: require.resolve('./fixtures/multiple-exports.js'),
            method: 'increment',
          });
        }
        await Promise.all([increment(), increment(), increment()]);

        var result = await task.invokeRemoteMethod({
          file: require.resolve('./fixtures/multiple-exports.js'),
          method: 'getTotal',
        });
        expect(result).toBe(3);
      });
    });

    it('synchronous function that throws Error returns a rejected Promise', () => {
      waitsForPromise(async () => {
        var promise = task.invokeRemoteMethod({
          file: require.resolve('./fixtures/exports-that-fail.js'),
          method: 'throwsErrorSynchronously',
        });
        await expectAsyncFailure(promise, error => {
          expect(error.message).toBe('All I do is fail.');
        });
      });
    });

    it('synchronous function that returns a rejected Promise returns a rejected Promise', () => {
      waitsForPromise(async () => {
        var promise = task.invokeRemoteMethod({
          file: require.resolve('./fixtures/exports-that-fail.js'),
          method: 'returnsRejectedPromise',
        });
        await expectAsyncFailure(promise, error => {
          expect(error.message).toBe('Explicit fail with rejected Promise.');
        });
      });
    });

    it('async function that throws returns a rejected Promise', () => {
      waitsForPromise(async () => {
        var promise = task.invokeRemoteMethod({
          file: require.resolve('./fixtures/exports-that-fail.js'),
          method: 'asyncFunctionThatThrows',
        });
        await expectAsyncFailure(promise, error => {
          expect(error.message).toBe('All I do is fail *asynchronously*.');
        });
      });
    });
  });
});
