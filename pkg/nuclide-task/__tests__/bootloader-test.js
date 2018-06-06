'use strict';

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _;

function _load_() {
  return _ = _interopRequireDefault(require('..'));
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

describe('Task', () => {
  describe('.invokeRemoteMethod()', () => {
    let task = null;

    beforeEach(() => {
      task = new (_ || _load_()).default('test');
    });

    afterEach(() => {
      if (!task) {
        throw new Error('Invariant violation: "task"');
      }

      task.dispose();
      task = null;
    });

    // Note: files loaded via invokeRemoteMethod() use a variety of ES6/7+
    // features to verify that Babel transpilation is working as intended.

    it('can call a synchronous function that is a lone export', async () => {
      if (!task) {
        throw new Error('Invariant violation: "task"');
      }

      const result = await task.invokeRemoteMethod({
        file: require.resolve('../__mocks__/fixtures/one-export-returns-object'),
        args: ['add me!']
      });
      expect(result).toEqual({ foo: 'bar', baz: 'add me!' });
    });

    it('can call an async function that is a lone export', async () => {
      if (!task) {
        throw new Error('Invariant violation: "task"');
      }

      const result = await task.invokeRemoteMethod({
        file: require.resolve('../__mocks__/fixtures/one-export-returns-string-async')
      });
      expect(result).toEqual('#winning');
    });

    it('can call a synchronous function from an exports object', async () => {
      if (!task) {
        throw new Error('Invariant violation: "task"');
      }

      const result = await task.invokeRemoteMethod({
        file: require.resolve('../__mocks__/fixtures/multiple-exports'),
        method: 'product',
        args: [1, 2, 3, 4, 5]
      });
      expect(result).toBe(120);
    });

    it('can call an async function from an exports object', async () => {
      if (!task) {
        throw new Error('Invariant violation: "task"');
      }

      const result = await task.invokeRemoteMethod({
        file: require.resolve('../__mocks__/fixtures/multiple-exports'),
        method: 'asyncFetch'
      });
      expect(result).toEqual({ shouldShowUpInJsonSerialization: null });
    });

    it('persists the process it creates (does not create a new one each time)', async () => {
      function increment() {
        if (!task) {
          throw new Error('Invariant violation: "task"');
        }

        return task.invokeRemoteMethod({
          file: require.resolve('../__mocks__/fixtures/multiple-exports'),
          method: 'increment'
        });
      }
      await Promise.all([increment(), increment(), increment()]);

      if (!task) {
        throw new Error('Invariant violation: "task"');
      }

      const result = await task.invokeRemoteMethod({
        file: require.resolve('../__mocks__/fixtures/multiple-exports'),
        method: 'getTotal'
      });
      expect(result).toBe(3);
    });

    it('synchronous function that throws Error returns a rejected Promise', async () => {
      await (async () => {
        if (!task) {
          throw new Error('Invariant violation: "task"');
        }

        const promise = task.invokeRemoteMethod({
          file: require.resolve('../__mocks__/fixtures/exports-that-fail'),
          method: 'throwsErrorSynchronously'
        });
        await (0, (_testHelpers || _load_testHelpers()).expectAsyncFailure)(promise, error => {
          expect(error.message).toBe('All I do is fail.');
        });
      })();
    });

    it('synchronous function that returns a rejected Promise returns a rejected Promise', async () => {
      await (async () => {
        if (!task) {
          throw new Error('Invariant violation: "task"');
        }

        const promise = task.invokeRemoteMethod({
          file: require.resolve('../__mocks__/fixtures/exports-that-fail'),
          method: 'returnsRejectedPromise'
        });
        await (0, (_testHelpers || _load_testHelpers()).expectAsyncFailure)(promise, error => {
          expect(error.message).toBe('Explicit fail with rejected Promise.');
        });
      })();
    });

    it('async function that throws returns a rejected Promise', async () => {
      await (async () => {
        if (!task) {
          throw new Error('Invariant violation: "task"');
        }

        const promise = task.invokeRemoteMethod({
          file: require.resolve('../__mocks__/fixtures/exports-that-fail'),
          method: 'asyncFunctionThatThrows'
        });
        await (0, (_testHelpers || _load_testHelpers()).expectAsyncFailure)(promise, error => {
          expect(error.message).toBe('All I do is fail *asynchronously*.');
        });
      })();
    });
  });

  it.skip('calls onError upon error', async () => {
    const spy = jest.fn();
    const task = new (_ || _load_()).default('test');
    task.onError(spy);
    task._initialize();

    if (!(task._child != null)) {
      throw new Error('Invariant violation: "task._child != null"');
    }

    task._child.disconnect();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    task.invokeRemoteMethod({
      file: 'test'
    });
    await (0, (_waits_for || _load_waits_for()).default)(() => {
      return spy.mock.calls.length > 0;
    });
    // eslint-disable-next-line no-console
    expect(console.log.mock.calls[0][0]).toMatch(/TASK\(test, \d+\):.* channel closed/);
  });
});