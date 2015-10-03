'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type RunReturn<T> = {
  status: 'success';
  result: T;
} | {
  status: 'outdated';
};

/**
 * Allows a caller to ensure that the results it receives from consecutive
 * promise resolutions are never outdated. Usage:
 *
 * var requestSerializer = new RequestSerializer();
 *
 * // in some later loop:
 *
 * // note that you do not await the async function here -- you must pass the
 * // promise it returns to `run`
 * var result = await requestSerializer.run(someAsyncFunction())
 *
 * if (result.status === 'success') {
 *   ....
 *   result.result
 * } else if (result.status === 'outdated') {
 *   ....
 * }
 *
 * The contract is that the status is 'success' if and only if this was the most
 * recently dispatched call of 'run'. For example, if you call run(promise1) and
 * then run(promise2), and promise2 resolves first, the second callsite would
 * receive a 'success' status. If promise1 later resolved, the first callsite
 * would receive an 'outdated' status.
 */
class RequestSerializer {
  _lastDispatchedOp: number;
  _lastFinishedOp: number;

  constructor() {
    this._lastDispatchedOp = 0;
    this._lastFinishedOp = 0;
  }

  async run<T>(promise: Promise<T>): Promise<RunReturn<T>> {
    var thisOp = this._lastDispatchedOp + 1;
    this._lastDispatchedOp = thisOp;
    var result = await promise;
    if (this._lastFinishedOp < thisOp) {
      this._lastFinishedOp = thisOp;
      return {
        status: 'success',
        result,
      };
    } else {
      return {
        status: 'outdated',
      };
    }
  }

  isRunInProgress(): boolean {
    return this._lastDispatchedOp > this._lastFinishedOp;
  }
}

var promises = module.exports = {

  /**
   * Returns a value derived asynchronously from an element in the items array.
   * The test function is applied sequentially to each element in items until
   * one returns a Promise that resolves to a non-null value. When this happens,
   * the Promise returned by this method will resolve to that non-null value. If
   * no such Promise is produced, then the Promise returned by this function
   * will resolve to null.
   *
   * @param items Array of elements that will be passed to test, one at a time.
   * @param test Will be called with each item and must return either:
   *     (1) A "thenable" (i.e, a Promise or promise-like object) that resolves
   *         to a derived value (that will be returned) or null.
   *     (2) null.
   *     In both cases where null is returned, test will be applied to the next
   *     item in the array.
   * @param thisArg Receiver that will be used when test is called.
   * @return Promise that resolves to an asynchronously derived value or null.
   */
  asyncFind<T, U>(items: Array<T>, test: (t: T) => ?Promise<U>, thisArg?: mixed): Promise<?U> {
    return new Promise((resolve, reject) => {
      // Create a local copy of items to defend against the caller modifying the
      // array before this Promise is resolved.
      items = items.slice();
      var numItems = items.length;

      var next = async function(index) {
        if (index === numItems) {
          resolve(null);
          return;
        }

        var item = items[index];
        var result = await test.call(thisArg, item);
        if (result !== null) {
          resolve(result);
        } else {
          next(index + 1);
        }
      };

      next(0);
    });
  },

  denodeify(f: (...args: Array<any>) => any): (...args: Array<any>) => Promise<any> {
    return function(...args: Array<any>) {
      return new Promise((resolve, reject) => {
        function callback(error, result) {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
        f.apply(this, args.concat([callback]));
      });
    };
  },

  /**
   * A Promise utility that runs a maximum of limit async operations at a time iterating over an array
   * and returning the result of executions.
   * e.g. to limit the number of file reads to 5,
   * replace the code:
   *    var fileContents = await Promise.all(filePaths.map(fsPromise.readFile))
   * with:
   *    var fileContents = await asyncLimit(filePaths, 5, fsPromise.readFile)
   *
   * This is particulrily useful to limit IO operations to a configurable maximum (to avoid blocking),
   * while enjoying the configured level of parallelism.
   *
   * @param array the array of items for iteration.
   * @param limit the configurable number of parallel async operations.
   * @param mappingFunction the async Promise function that could return a useful result.
   */
  asyncLimit<T, V>(array: Array<T>, limit: number, mappingFunction: (item: T) => Promise<V>): Promise<Array<V>> {
    var result: Array<V> = new Array(array.length);
    var parallelPromises = 0;
    var index = 0;

    var parallelLimit = Math.min(limit, array.length);

    return new Promise((resolve, reject) => {
      var runPromise = async () => {
        if (index === array.length) {
          if (parallelPromises === 0) {
            resolve(result);
          }
          return;
        }
        ++parallelPromises;
        var i = index++;
        try {
          result[i] = await mappingFunction(array[i]);
        } catch (e) {
          reject(e);
        }
        --parallelPromises;
        runPromise();
      };

      while (parallelPromises < parallelLimit) {
        runPromise();
      }
    });
  },

  /**
   * `filter` Promise utility that allows filtering an array with an async Promise function.
   * It's an alternative to `Array.prototype.filter` that accepts an async function.
   * You can optionally configure a limit to set the maximum number of async operations at a time.
   *
   * Previously, with the `Promise.all` primitive, we can't set the parallelism limit and we have to
   * `filter`, so, we replace the old `filter` code:
   *     var existingFilePaths = [];
   *     await Promise.all(filePaths.map(async (filePath) => {
   *       if (await fsPromise.exists(filePath)) {
   *         existingFilePaths.push(filePath);
   *       }
   *     }));
   * with limit 5 parallel filesystem operations at a time:
   *    var existingFilePaths = await asyncFilter(filePaths, fsPromise.exists, 5);
   *
   * @param array the array of items for `filter`ing.
   * @param filterFunction the async `filter` function that returns a Promise that resolves to a boolean.
   * @param limit the configurable number of parallel async operations.
   */
  async asyncFilter<T>(array: Array<T>, filterFunction: (item: T) => Promise<boolean>, limit?: number): Promise<Array<T>> {
    var filteredList = [];
    await promises.asyncLimit(array, limit || array.length, async (item: T) => {
      if (await filterFunction(item)) {
        filteredList.push(item);
      }
    });
    return filteredList;
  },

  /**
   * `some` Promise utility that allows `some` an array with an async Promise some function.
   * It's an alternative to `Array.prototype.some` that accepts an async some function.
   * You can optionally configure a limit to set the maximum number of async operations at a time.
   *
   * Previously, with the Promise.all primitive, we can't set the parallelism limit and we have to
   * `some`, so, we replace the old `some` code:
   *     var someFileExist = false;
   *     await Promise.all(filePaths.map(async (filePath) => {
   *       if (await fsPromise.exists(filePath)) {
   *         someFileExist = true;
   *       }
   *     }));
   * with limit 5 parallel filesystem operations at a time:
   *    var someFileExist = await asyncSome(filePaths, fsPromise.exists, 5);
   *
   * @param array the array of items for `some`ing.
   * @param someFunction the async `some` function that returns a Promise that resolves to a boolean.
   * @param limit the configurable number of parallel async operations.
   */
  async asyncSome<T>(array: Array<T>, someFunction: (item: T) => Promise<boolean>, limit?: number): Promise<boolean> {
    var resolved = false;
    await promises.asyncLimit(array, limit || array.length, async (item: T) => {
      if (resolved) {
        // We don't need to call the someFunction anymore or wait any longer.
        return;
      }
      if (await someFunction(item)) {
        resolved = true;
      }
    });
    return resolved;
  },

  /*
   * Returns a promise that will resolve after `milliSeconds` milli seconds.
   * this can be used to pause execution asynchronously.
   * e.g. await awaitMilliSeconds(1000), pauses the async flow execution for 1 second.
   */
  awaitMilliSeconds(milliSeconds: number): Promise {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, milliSeconds);
    });
  },

  RequestSerializer,

  /**
   * Check if an object is Promise by testing if it has a `then` function property.
   */
  isPromise(object: any): boolean {
    return !!(object) && typeof object === 'object' && typeof object.then === 'function';
  },
};
