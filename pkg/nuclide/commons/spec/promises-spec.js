'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {asyncFind, denodeify} = require('../lib/main');
var {promises} = require('../lib/main');
var {expectAsyncFailure} = require('nuclide-test-helpers');

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

describe('promises::denodeify()', () => {
  /**
   * Vararg function that assumes that all elements except the last are
   * numbers, as the last argument is a callback function. All of the
   * other arguments are multiplied together. If the result is not NaN,
   * then the callback is called with the product. Otherwise, the callback
   * is called with an error.
   *
   * This function exhibits some of the quirky behavior of Node APIs that
   * accept a variable number of arguments in the middle of the parameter list
   * rather than at the end. The type signature of this function cannot be
   * expressed in Flow.
   */
  function asyncProduct(): void {
    var factors = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    var product = factors.reduce((previousValue, currentValue) => {
      return previousValue * currentValue;
    }, 1);

    var callback = arguments[arguments.length - 1];
    if (isNaN(product)) {
      callback(new Error('product was NaN'));
    } else {
      callback(null, product);
    }
  }

  var denodeifiedAsyncProduct = denodeify(asyncProduct);

  it('resolves Promise when callback succeeds', () => {
    waitsForPromise(async () => {
      var trivialProduct = await denodeifiedAsyncProduct();
      expect(trivialProduct).toBe(1);

      var product = await denodeifiedAsyncProduct(1, 2, 3, 4, 5);
      expect(product).toBe(120);
    });
  });

  it('rejects Promise when callback fails', () => {
    waitsForPromise(async () => {
      await expectAsyncFailure(denodeifiedAsyncProduct('a', 'b'), (error: Error) => {
        expect(error.message).toBe('product was NaN');
      });
    });
  });

  function checksReceiver(expectedReceiver, callback) {
    if (this === expectedReceiver) {
      callback(null, 'winner');
    } else {
      callback(new Error('unexpected receiver'));
    }
  }

  var denodeifiedChecksReceiver = denodeify(checksReceiver);

  it('result of denodeify propagates receiver as expected', () => {
    waitsForPromise(async () => {
      var receiver = {denodeifiedChecksReceiver};
      var result = await receiver.denodeifiedChecksReceiver(receiver);
      expect(result).toBe('winner');
    });

    waitsForPromise(async () => {
      var receiver = {denodeifiedChecksReceiver};
      await expectAsyncFailure(receiver.denodeifiedChecksReceiver(null), (error: Error) => {
        expect(error.message).toBe('unexpected receiver');
      });
    });
  });
});

describe('promises::asyncLimit()', () => {

  beforeEach(() => window.useRealClock());

  it('runs in series if limit is 1', () => {
    waitsForPromise(async () => {
      var {result, parallelismHistory} = await captureParallelismHistory(
          promises.asyncLimit,
          [
            [1, 2, 3],
            1,
            (item) => waitPromise(10, item + 1),
          ]
      );
      expect(parallelismHistory).toEqual([1, 1, 1]);
      expect(result).toEqual([2, 3, 4]);
    });
  });

  it('runs with the specified limit, until finishing', () => {
    waitsForPromise(async () => {
      var {result, parallelismHistory} = await captureParallelismHistory(
          promises.asyncLimit,
          [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            3,
            (item) => waitPromise(10 + item, item - 1),
          ]
      );
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      expect(parallelismHistory).toEqual([1, 2, 3, 3, 3, 3, 3, 3, 3]);
    });
  });

  it('works when the limit is bigger than the array length', () => {
    waitsForPromise(async () => {
      var result = await promises.asyncLimit([1, 2, 3], 10, (item) => waitPromise(10, item * 2));
      expect(result).toEqual([2, 4, 6]);
    });
  });

  it('a rejected promise rejects the whole call with the error', () => {
    waitsForPromise(async () => {
      await expectAsyncFailure(promises.asyncLimit([1], 1, async (item) => {
        throw new Error('rejected iterator promise');
      }), (error: Error) => {
        expect(error.message).toBe('rejected iterator promise');
      });
    });
  });
});

describe('promises::asyncFilter()', () => {

  beforeEach(() => window.useRealClock());

  it('filters an array with an async iterator and maximum parallelization when no limit is specified', () => {
    waitsForPromise(async () => {
      var {result: filtered, parallelismHistory} = await captureParallelismHistory(
          promises.asyncFilter,
          [
            [1, 2, 3, 4, 5],
            (item) => waitPromise(10 + item, item > 2),
          ]
      );
      expect(filtered).toEqual([3, 4, 5]);
      expect(parallelismHistory).toEqual([1, 2, 3, 4, 5]);
    });
  });

  it('filters an array with a limit on parallelization', () => {
    waitsForPromise(async () => {
      var {result: filtered, parallelismHistory} = await captureParallelismHistory(
          promises.asyncFilter,
          [
            [1, 2, 3, 4, 5],
            (item) => waitPromise(10 + item, item > 2),
            3,
          ]
      );
      expect(filtered).toEqual([3, 4, 5]);
      // Increasing promise resolve time will gurantee maximum parallelization.
      expect(parallelismHistory).toEqual([1, 2, 3, 3, 3]);
    });
  });
});

describe('promises::asyncSome()', () => {

  beforeEach(() => window.useRealClock());

  it('some an array with an async iterator and maximum parallelization when no limit is specified', () => {
    waitsForPromise(async () => {
      var {result, parallelismHistory} = await captureParallelismHistory(
          promises.asyncSome,
          [
            [1, 2, 3, 4, 5],
            (item) => waitPromise(10, item === 6),
          ]
      );
      expect(result).toEqual(false);
      expect(parallelismHistory).toEqual([1, 2, 3, 4, 5]);
    });
  });

  it('some an array with a limit on parallelization', () => {
    waitsForPromise(async () => {
      var {result, parallelismHistory} = await captureParallelismHistory(
          promises.asyncSome,
          [
            [1, 2, 3, 4, 5],
            (item) => waitPromise(10 + item, item === 5),
            3,
          ]
      );
      expect(result).toEqual(true);
      expect(parallelismHistory).toEqual([1, 2, 3, 3, 3]);
    });
  });
});

async function captureParallelismHistory(
    asyncFunction: (...args: Array<any>) => Promise<mixed>,
    args: Array<mixed>
  ): Promise<{result: mixed, parallelismHistory: Array<number>}> {

  var parallelismHistory = [];
  var parralelism = 0;
  var result = await asyncFunction.apply(null, args.map(arg => {
    if (typeof arg !== 'function') {
      return arg;
    }
    var func = arg;
    return async (item) => {
      ++parralelism;
      parallelismHistory.push(parralelism);
      var value = await func(item);
      --parralelism;
      return value;
    };
  }));
  return {result, parallelismHistory};
}

function waitPromise(timeoutMs: number, value: any): Promise {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(value), timeoutMs);
  });
}
