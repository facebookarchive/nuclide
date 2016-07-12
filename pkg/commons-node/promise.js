Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.sleep = sleep;

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

var triggerAfterWait = _asyncToGenerator(function* (promise, milliSeconds, timeoutFn, cleanupFn) {
  var timeout = setTimeout(timeoutFn, milliSeconds);
  try {
    return yield promise;
  } finally {
    clearTimeout(timeout);
    if (cleanupFn) {
      cleanupFn();
    }
  }
}

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
);

exports.triggerAfterWait = triggerAfterWait;

var retryLimit = _asyncToGenerator(function* (retryFunction, validationFunction, maximumTries) {
  var retryIntervalMs = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var result = null;
  var tries = 0;
  var lastError = null;
  /* eslint-disable babel/no-await-in-loop */
  while (tries === 0 || tries < maximumTries) {
    try {
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
      yield sleep(retryIntervalMs);
    }
  }
  /* eslint-enable babel/no-await-in-loop */
  if (lastError != null) {
    throw lastError;
  } else if (tries === maximumTries) {
    throw new Error('No valid response found!');
  } else {
    return result;
  }
}

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
);

exports.retryLimit = retryLimit;
exports.serializeAsyncCall = serializeAsyncCall;
exports.asyncFind = asyncFind;
exports.denodeify = denodeify;
exports.asyncLimit = asyncLimit;

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

var asyncFilter = _asyncToGenerator(function* (array, filterFunction, limit) {
  var filteredList = [];
  yield asyncLimit(array, limit || array.length, _asyncToGenerator(function* (item) {
    if (yield filterFunction(item)) {
      filteredList.push(item);
    }
  }));
  return filteredList;
});

exports.asyncFilter = asyncFilter;

var asyncObjFilter = _asyncToGenerator(function* (obj, filterFunction, limit) {
  var keys = Object.keys(obj);
  var filteredObj = {};
  yield asyncLimit(keys, limit || keys.length, _asyncToGenerator(function* (key) {
    var item = obj[key];
    if (yield filterFunction(item, key)) {
      filteredObj[key] = item;
    }
  }));
  return filteredObj;
}

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
);

exports.asyncObjFilter = asyncObjFilter;

var asyncSome = _asyncToGenerator(function* (array, someFunction, limit) {
  var resolved = false;
  yield asyncLimit(array, limit || array.length, _asyncToGenerator(function* (item) {
    if (resolved) {
      // We don't need to call the someFunction anymore or wait any longer.
      return;
    }
    if (yield someFunction(item)) {
      resolved = true;
    }
  }));
  return resolved;
}

/**
 * Check if an object is Promise by testing if it has a `then` function property.
 */
);

exports.asyncSome = asyncSome;
exports.isPromise = isPromise;
exports.lastly = lastly;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

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

var RequestSerializer = (function () {
  function RequestSerializer() {
    var _this = this;

    _classCallCheck(this, RequestSerializer);

    this._lastDispatchedOp = 0;
    this._lastFinishedOp = 0;
    this._latestPromise = new Promise(function (resolve, reject) {
      _this._waitResolve = resolve;
    });
  }

  /*
   * Returns a promise that will resolve after `milliSeconds` milli seconds.
   * this can be used to pause execution asynchronously.
   * e.g. await sleep(1000), pauses the async flow execution for 1 second.
   */

  _createClass(RequestSerializer, [{
    key: 'run',
    value: _asyncToGenerator(function* (promise) {
      var thisOp = this._lastDispatchedOp + 1;
      this._lastDispatchedOp = thisOp;
      this._latestPromise = promise;
      this._waitResolve();
      var result = yield promise;
      if (this._lastFinishedOp < thisOp) {
        this._lastFinishedOp = thisOp;
        return {
          status: 'success',
          result: result
        };
      } else {
        return {
          status: 'outdated'
        };
      }
    })

    /**
     * Returns a Promise that resolves to the last result of `run`,
     * as soon as there are no more outstanding `run` calls.
     */
  }, {
    key: 'waitForLatestResult',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      var lastPromise = null;
      var result = null;
      /* eslint-disable babel/no-await-in-loop */
      while (lastPromise !== this._latestPromise) {
        lastPromise = this._latestPromise;
        // Wait for the current last know promise to resolve, or a next run have started.
        result = yield new Promise(function (resolve, reject) {
          _this2._waitResolve = resolve;
          _this2._latestPromise.then(resolve);
        });
      }
      /* eslint-enable babel/no-await-in-loop */
      return result;
    })
  }, {
    key: 'isRunInProgress',
    value: function isRunInProgress() {
      return this._lastDispatchedOp > this._lastFinishedOp;
    }
  }]);

  return RequestSerializer;
})();

exports.RequestSerializer = RequestSerializer;

function sleep(milliSeconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliSeconds);
  });
}

function serializeAsyncCall(asyncFun) {
  var scheduledCall = null;
  var pendingCall = null;
  var startAsyncCall = function startAsyncCall() {
    var resultPromise = asyncFun();
    pendingCall = resultPromise.then(function () {
      return pendingCall = null;
    }, function () {
      return pendingCall = null;
    });
    return resultPromise;
  };
  var callNext = function callNext() {
    scheduledCall = null;
    return startAsyncCall();
  };
  var scheduleNextCall = function scheduleNextCall() {
    if (scheduledCall == null) {
      (0, (_assert2 || _assert()).default)(pendingCall, 'pendingCall must not be null!');
      scheduledCall = pendingCall.then(callNext, callNext);
    }
    return scheduledCall;
  };
  return function () {
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

var Deferred = function Deferred() {
  var _this3 = this;

  _classCallCheck(this, Deferred);

  this.promise = new Promise(function (resolve, reject) {
    _this3.resolve = resolve;
    _this3.reject = reject;
  });
}

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
;

exports.Deferred = Deferred;

function asyncFind(items, test, thisArg) {
  return new Promise(function (resolve, reject) {
    // Create a local copy of items to defend against the caller modifying the
    // array before this Promise is resolved.
    items = items.slice();
    var numItems = items.length;

    var next = _asyncToGenerator(function* (index) {
      if (index === numItems) {
        resolve(null);
        return;
      }

      var item = items[index];
      var result = yield test.call(thisArg, item);
      if (result !== null) {
        resolve(result);
      } else {
        next(index + 1);
      }
    });

    next(0);
  });
}

function denodeify(f) {
  return function () {
    var _this4 = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      function callback(error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
      f.apply(_this4, args.concat([callback]));
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
  var result = new Array(array.length);
  var parallelPromises = 0;
  var index = 0;

  var parallelLimit = Math.min(limit, array.length) || 1;

  return new Promise(function (resolve, reject) {
    var runPromise = _asyncToGenerator(function* () {
      if (index === array.length) {
        if (parallelPromises === 0) {
          resolve(result);
        }
        return;
      }
      ++parallelPromises;
      var i = index++;
      try {
        result[i] = yield mappingFunction(array[i]);
      } catch (e) {
        reject(e);
      }
      --parallelPromises;
      runPromise();
    });

    while (parallelLimit--) {
      runPromise();
    }
  });
}

function isPromise(object) {
  return Boolean(object) && typeof object === 'object' && typeof object.then === 'function';
}

/**
 * We can't name a function 'finally', so use lastly instead.
 * fn() will be executed (and completed) after the provided promise resolves/rejects.
 */

function lastly(promise, fn) {
  return promise.then(function (ret) {
    return Promise.resolve(fn()).then(function () {
      return ret;
    });
  }, function (err) {
    return Promise.resolve(fn()).then(function () {
      return Promise.reject(err);
    });
  });
}