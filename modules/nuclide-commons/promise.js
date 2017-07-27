'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asyncSome = exports.asyncObjFilter = exports.asyncFilter = exports.Deferred = exports.retryLimit = exports.triggerAfterWait = exports.RequestSerializer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Executes a provided callback only if a promise takes longer than
 * `milliSeconds` milliseconds to resolve.
 *
 * @param `promise` the promise to wait on.
 * @param `milliSeconds` max amount of time that `promise` can take to resolve
 * before timeoutFn is fired.
 * @param `timeoutFn` the function to execute when a promise takes longer than
 * `milliSeconds` ms to resolve.
 * @param `cleanupFn` the cleanup function to execute after the promise resolves.
 */
let triggerAfterWait = exports.triggerAfterWait = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (promise, milliSeconds, timeoutFn, cleanupFn) {
    const timeout = setTimeout(timeoutFn, milliSeconds);
    try {
      return yield promise;
    } finally {
      clearTimeout(timeout);
      if (cleanupFn) {
        cleanupFn();
      }
    }
  });

  return function triggerAfterWait(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Returns a Promise that resolves to the same value as the given promise, or rejects if it takes
 * longer than `milliseconds` milliseconds
 */


/**
 * Call an async function repeatedly with a maximum number of trials limit,
 * until a valid result that's defined by a validation function.
 * A failed call can result from an async thrown exception, or invalid result.
 *
 * @param `retryFunction` the async logic that's wanted to be retried.
 * @param `validationFunction` the validation function that decides whether a response is valid.
 * @param `maximumTries` the number of times the `retryFunction` can fail to get a valid
 * response before the `retryLimit` is terminated reporting an error.
 * @param `retryIntervalMs` optional, the number of milliseconds to wait between trials, if wanted.
 *
 * If an exception is encountered on the last trial, the exception is thrown.
 * If no valid response is found, an exception is thrown.
 */
let retryLimit = exports.retryLimit = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (retryFunction, validationFunction, maximumTries, retryIntervalMs = 0) {
    let result = null;
    let tries = 0;
    let lastError = null;
    while (tries === 0 || tries < maximumTries) {
      try {
        // eslint-disable-next-line no-await-in-loop
        result = yield retryFunction();
        lastError = null;
        if (validationFunction(result)) {
          return result;
        }
      } catch (error) {
        lastError = error;
        result = null;
      }

      if (++tries < maximumTries && retryIntervalMs !== 0) {
        // eslint-disable-next-line no-await-in-loop
        yield sleep(retryIntervalMs);
      }
    }
    if (lastError != null) {
      throw lastError;
    } else if (tries === maximumTries) {
      throw new Error('No valid response found!');
    } else {
      return result;
    }
  });

  return function retryLimit(_x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Limits async function execution parallelism to only one at a time.
 * Hence, if a call is already running, it will wait for it to finish,
 * then start the next async execution, but if called again while not finished,
 * it will return the scheduled execution promise.
 *
 * Sample Usage:
 * ```
 * let i = 1;
 * const oneExecAtATime = oneParallelAsyncCall(() => {
 *   return next Promise((resolve, reject) => {
 *     setTimeout(200, () => resolve(i++));
 *   });
 * });
 *
 * const result1Promise = oneExecAtATime(); // Start an async, and resolve to 1 in 200 ms.
 * const result2Promise = oneExecAtATime(); // Schedule the next async, and resolve to 2 in 400 ms.
 * const result3Promise = oneExecAtATime(); // Reuse scheduled promise and resolve to 2 in 400 ms.
 * ```
 */


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
 * @param filterFunction the async `filter` function that returns a Promise that resolves to a
 *   boolean.
 * @param limit the configurable number of parallel async operations.
 */
let asyncFilter = exports.asyncFilter = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (array, filterFunction, limit) {
    const filteredList = [];
    yield asyncLimit(array, limit || array.length, (() => {
      var _ref6 = (0, _asyncToGenerator.default)(function* (item) {
        if (yield filterFunction(item)) {
          filteredList.push(item);
        }
      });

      return function (_x12) {
        return _ref6.apply(this, arguments);
      };
    })());
    return filteredList;
  });

  return function asyncFilter(_x9, _x10, _x11) {
    return _ref5.apply(this, arguments);
  };
})();

let asyncObjFilter = exports.asyncObjFilter = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (obj, filterFunction, limit) {
    const keys = Object.keys(obj);
    const filteredObj = {};
    yield asyncLimit(keys, limit || keys.length, (() => {
      var _ref8 = (0, _asyncToGenerator.default)(function* (key) {
        const item = obj[key];
        if (yield filterFunction(item, key)) {
          filteredObj[key] = item;
        }
      });

      return function (_x16) {
        return _ref8.apply(this, arguments);
      };
    })());
    return filteredObj;
  });

  return function asyncObjFilter(_x13, _x14, _x15) {
    return _ref7.apply(this, arguments);
  };
})();

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
 * @param someFunction the async `some` function that returns a Promise that resolves to a
 *   boolean.
 * @param limit the configurable number of parallel async operations.
 */


let asyncSome = exports.asyncSome = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (array, someFunction, limit) {
    let resolved = false;
    yield asyncLimit(array, limit || array.length, (() => {
      var _ref10 = (0, _asyncToGenerator.default)(function* (item) {
        if (resolved) {
          // We don't need to call the someFunction anymore or wait any longer.
          return;
        }
        if (yield someFunction(item)) {
          resolved = true;
        }
      });

      return function (_x20) {
        return _ref10.apply(this, arguments);
      };
    })());
    return resolved;
  });

  return function asyncSome(_x17, _x18, _x19) {
    return _ref9.apply(this, arguments);
  };
})();

/**
 * Check if an object is Promise by testing if it has a `then` function property.
 */


exports.sleep = sleep;
exports.nextTick = nextTick;
exports.timeoutPromise = timeoutPromise;
exports.serializeAsyncCall = serializeAsyncCall;
exports.asyncFind = asyncFind;
exports.denodeify = denodeify;
exports.asyncLimit = asyncLimit;
exports.isPromise = isPromise;
exports.lastly = lastly;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class RequestSerializer {

  constructor() {
    this._lastDispatchedOp = 0;
    this._lastFinishedOp = 0;
    this._latestPromise = new Promise((resolve, reject) => {
      this._waitResolve = resolve;
    });
  }

  run(promise) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const thisOp = _this._lastDispatchedOp + 1;
      _this._lastDispatchedOp = thisOp;
      _this._latestPromise = promise;
      _this._waitResolve();
      const result = yield promise;
      if (_this._lastFinishedOp < thisOp) {
        _this._lastFinishedOp = thisOp;
        return {
          status: 'success',
          result
        };
      } else {
        return {
          status: 'outdated'
        };
      }
    })();
  }

  /**
   * Returns a Promise that resolves to the last result of `run`,
   * as soon as there are no more outstanding `run` calls.
   */
  waitForLatestResult() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let lastPromise = null;
      let result = null;
      while (lastPromise !== _this2._latestPromise) {
        lastPromise = _this2._latestPromise;
        // Wait for the current last know promise to resolve, or a next run have started.
        // eslint-disable-next-line no-await-in-loop
        result = yield new Promise(function (resolve, reject) {
          _this2._waitResolve = resolve;
          _this2._latestPromise.then(resolve);
        });
      }
      return result;
    })();
  }

  isRunInProgress() {
    return this._lastDispatchedOp > this._lastFinishedOp;
  }
}

exports.RequestSerializer = RequestSerializer; /*
                                                * Returns a promise that will resolve after `milliSeconds` milli seconds.
                                                * this can be used to pause execution asynchronously.
                                                * e.g. await sleep(1000), pauses the async flow execution for 1 second.
                                                */

function sleep(milliSeconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliSeconds);
  });
}

function nextTick() {
  return new Promise(resolve => {
    process.nextTick(resolve);
  });
}function timeoutPromise(promise, milliseconds) {
  return new Promise((resolve, reject) => {
    let timeout = setTimeout(() => {
      timeout = null;
      reject(new Error(`Promise timed out after ${String(milliseconds)} ms`));
    }, milliseconds);
    promise.then(value => {
      if (timeout != null) {
        clearTimeout(timeout);
      }
      resolve(value);
    }).catch(value => {
      if (timeout != null) {
        clearTimeout(timeout);
      }
      reject(value);
    });
  });
}function serializeAsyncCall(asyncFun) {
  let scheduledCall = null;
  let pendingCall = null;
  const startAsyncCall = () => {
    const resultPromise = asyncFun();
    pendingCall = resultPromise.then(() => pendingCall = null, () => pendingCall = null);
    return resultPromise;
  };
  const callNext = () => {
    scheduledCall = null;
    return startAsyncCall();
  };
  const scheduleNextCall = () => {
    if (scheduledCall == null) {
      if (!pendingCall) {
        throw new Error('pendingCall must not be null!');
      }

      scheduledCall = pendingCall.then(callNext, callNext);
    }
    return scheduledCall;
  };
  return () => {
    if (pendingCall == null) {
      return startAsyncCall();
    } else {
      return scheduleNextCall();
    }
  };
}

/**
 * Provides a promise along with methods to change its state. Our version of the non-standard
 * `Promise.defer()`.
 *
 * IMPORTANT: This should almost never be used!! Instead, use the Promise constructor. See
 *  <https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns#the-deferred-anti-pattern>
 */
class Deferred {

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

exports.Deferred = Deferred; /**
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

function asyncFind(items_, test, thisArg) {
  let items = items_;
  return new Promise((resolve, reject) => {
    // Create a local copy of items to defend against the caller modifying the
    // array before this Promise is resolved.
    items = items.slice();
    const numItems = items.length;

    const next = (() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (index) {
        if (index === numItems) {
          resolve(null);
          return;
        }

        const item = items[index];
        const result = yield test.call(thisArg, item);
        if (result != null) {
          resolve(result);
        } else {
          next(index + 1);
        }
      });

      return function next(_x8) {
        return _ref3.apply(this, arguments);
      };
    })();

    next(0);
  });
}

function denodeify(f) {
  return function (...args) {
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
}

/**
 * A Promise utility that runs a maximum of limit async operations at a time
 * iterating over an array and returning the result of executions.
 * e.g. to limit the number of file reads to 5,
 * replace the code:
 *    var fileContents = await Promise.all(filePaths.map(fsPromise.readFile))
 * with:
 *    var fileContents = await asyncLimit(filePaths, 5, fsPromise.readFile)
 *
 * This is particulrily useful to limit IO operations to a configurable maximum (to avoid
 * blocking), while enjoying the configured level of parallelism.
 *
 * @param array the array of items for iteration.
 * @param limit the configurable number of parallel async operations.
 * @param mappingFunction the async Promise function that could return a useful result.
 */
function asyncLimit(array, limit, mappingFunction) {
  const result = new Array(array.length);
  let parallelPromises = 0;
  let index = 0;

  let parallelLimit = Math.min(limit, array.length) || 1;

  return new Promise((resolve, reject) => {
    const runPromise = (() => {
      var _ref4 = (0, _asyncToGenerator.default)(function* () {
        if (index === array.length) {
          if (parallelPromises === 0) {
            resolve(result);
          }
          return;
        }
        ++parallelPromises;
        const i = index++;
        try {
          result[i] = yield mappingFunction(array[i]);
        } catch (e) {
          reject(e);
        }
        --parallelPromises;
        runPromise();
      });

      return function runPromise() {
        return _ref4.apply(this, arguments);
      };
    })();

    while (parallelLimit--) {
      runPromise();
    }
  });
}function isPromise(object) {
  return Boolean(object) && typeof object === 'object' && typeof object.then === 'function';
}

/**
 * We can't name a function 'finally', so use lastly instead.
 * fn() will be executed (and completed) after the provided promise resolves/rejects.
 */
function lastly(promise, fn) {
  return promise.then(ret => {
    return Promise.resolve(fn()).then(() => ret);
  }, err => {
    return Promise.resolve(fn()).then(() => Promise.reject(err));
  });
}