var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
      yield awaitMilliSeconds(retryIntervalMs);
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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
   * e.g. await awaitMilliSeconds(1000), pauses the async flow execution for 1 second.
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

function awaitMilliSeconds(milliSeconds) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, milliSeconds);
  });
}function serializeAsyncCall(asyncFun) {
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
      (0, _assert2['default'])(pendingCall, 'pendingCall must not be null!');
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
};

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
  asyncFind: function asyncFind(items, test, thisArg) {
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
  },

  Deferred: Deferred,

  denodeify: function denodeify(f) {
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
  },

  /**
   * A Promise utility that runs a maximum of limit async operations at a time iterating over an
   * array and returning the result of executions.
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
  asyncLimit: function asyncLimit(array, limit, mappingFunction) {
    var result = new Array(array.length);
    var parallelPromises = 0;
    var index = 0;

    var parallelLimit = Math.min(limit, array.length);

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
   * @param filterFunction the async `filter` function that returns a Promise that resolves to a
   *   boolean.
   * @param limit the configurable number of parallel async operations.
   */
  asyncFilter: _asyncToGenerator(function* (array, filterFunction, limit) {
    var filteredList = [];
    yield promises.asyncLimit(array, limit || array.length, _asyncToGenerator(function* (item) {
      if (yield filterFunction(item)) {
        filteredList.push(item);
      }
    }));
    return filteredList;
  }),

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
  asyncSome: _asyncToGenerator(function* (array, someFunction, limit) {
    var resolved = false;
    yield promises.asyncLimit(array, limit || array.length, _asyncToGenerator(function* (item) {
      if (resolved) {
        // We don't need to call the someFunction anymore or wait any longer.
        return;
      }
      if (yield someFunction(item)) {
        resolved = true;
      }
    }));
    return resolved;
  }),

  awaitMilliSeconds: awaitMilliSeconds,

  RequestSerializer: RequestSerializer,

  /**
   * Check if an object is Promise by testing if it has a `then` function property.
   */
  isPromise: function isPromise(object) {
    return !!object && typeof object === 'object' && typeof object.then === 'function';
  },

  retryLimit: retryLimit,

  serializeAsyncCall: serializeAsyncCall
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb21pc2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZ0llLFVBQVUscUJBQXpCLFdBQ0UsYUFBK0IsRUFDL0Isa0JBQTBDLEVBQzFDLFlBQW9CLEVBRVI7TUFEWixlQUF3Qix5REFBRyxDQUFDOztBQUU1QixNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbEIsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUVyQixTQUFPLEtBQUssS0FBSyxDQUFDLElBQUksS0FBSyxHQUFHLFlBQVksRUFBRTtBQUMxQyxRQUFJO0FBQ0YsWUFBTSxHQUFHLE1BQU0sYUFBYSxFQUFFLENBQUM7QUFDL0IsZUFBUyxHQUFHLElBQUksQ0FBQztBQUNqQixVQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzlCLGVBQU8sTUFBTSxDQUFDO09BQ2Y7S0FDRixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsZUFBUyxHQUFHLEtBQUssQ0FBQztBQUNsQixZQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ2Y7O0FBRUQsUUFBSSxFQUFFLEtBQUssR0FBRyxZQUFZLElBQUksZUFBZSxLQUFLLENBQUMsRUFBRTtBQUNuRCxZQUFNLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQzFDO0dBQ0Y7O0FBRUQsTUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLFVBQU0sU0FBUyxDQUFDO0dBQ2pCLE1BQU0sSUFBSSxLQUFLLEtBQUssWUFBWSxFQUFFO0FBQ2pDLFVBQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztHQUM3QyxNQUFNO0FBQ0wsV0FBUyxNQUFNLENBQVc7R0FDM0I7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBdkpxQixRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQ3hCLGlCQUFpQjtBQU1WLFdBTlAsaUJBQWlCLEdBTVA7OzswQkFOVixpQkFBaUI7O0FBT25CLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDM0IsUUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDekIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDckQsWUFBSyxZQUFZLEdBQUcsT0FBTyxDQUFDO0tBQzdCLENBQUMsQ0FBQztHQUNKOzs7Ozs7OztlQVpHLGlCQUFpQjs7NkJBY1osV0FBQyxPQUFtQixFQUF5QjtBQUNwRCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUM7QUFDaEMsVUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7QUFDOUIsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLFVBQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDO0FBQzdCLFVBQUksSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLEVBQUU7QUFDakMsWUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7QUFDOUIsZUFBTztBQUNMLGdCQUFNLEVBQUUsU0FBUztBQUNqQixnQkFBTSxFQUFOLE1BQU07U0FDUCxDQUFDO09BQ0gsTUFBTTtBQUNMLGVBQU87QUFDTCxnQkFBTSxFQUFFLFVBQVU7U0FDbkIsQ0FBQztPQUNIO0tBQ0Y7Ozs7Ozs7OzZCQU13QixhQUFlOzs7QUFDdEMsVUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFVBQUksTUFBVyxHQUFHLElBQUksQ0FBQzs7QUFFdkIsYUFBTyxXQUFXLEtBQUssSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUMxQyxtQkFBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7O0FBRWxDLGNBQU0sR0FBRyxNQUFNLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUM5QyxpQkFBSyxZQUFZLEdBQUcsT0FBTyxDQUFDO0FBQzVCLGlCQUFLLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkMsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsYUFBUSxNQUFNLENBQUs7S0FDcEI7OztXQUVjLDJCQUFZO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7S0FDdEQ7OztTQXZERyxpQkFBaUI7OztBQStEdkIsU0FBUyxpQkFBaUIsQ0FBQyxZQUFvQixFQUFXO0FBQ3hELFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLGNBQVUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7R0FDbkMsQ0FBQyxDQUFDO0NBQ0osQUF3RUQsU0FBUyxrQkFBa0IsQ0FBSSxRQUEwQixFQUFvQjtBQUMzRSxNQUFJLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDekIsTUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLE1BQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsR0FBUztBQUMzQixRQUFNLGFBQWEsR0FBRyxRQUFRLEVBQUUsQ0FBQztBQUNqQyxlQUFXLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FDOUI7YUFBTSxXQUFXLEdBQUcsSUFBSTtLQUFBLEVBQ3hCO2FBQU0sV0FBVyxHQUFHLElBQUk7S0FBQSxDQUN6QixDQUFDO0FBQ0YsV0FBTyxhQUFhLENBQUM7R0FDdEIsQ0FBQztBQUNGLE1BQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxHQUFTO0FBQ3JCLGlCQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFdBQU8sY0FBYyxFQUFFLENBQUM7R0FDekIsQ0FBQztBQUNGLE1BQU0sZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLEdBQVM7QUFDN0IsUUFBSSxhQUFhLElBQUksSUFBSSxFQUFFO0FBQ3pCLCtCQUFVLFdBQVcsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO0FBQ3hELG1CQUFhLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDdEQ7QUFDRCxXQUFPLGFBQWEsQ0FBQztHQUN0QixDQUFDO0FBQ0YsU0FBTyxZQUFNO0FBQ1gsUUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO0FBQ3ZCLGFBQU8sY0FBYyxFQUFFLENBQUM7S0FDekIsTUFBTTtBQUNMLGFBQU8sZ0JBQWdCLEVBQUUsQ0FBQztLQUMzQjtHQUNGLENBQUM7Q0FDSDs7Ozs7Ozs7OztJQVNLLFFBQVEsR0FLRCxTQUxQLFFBQVEsR0FLRTs7O3dCQUxWLFFBQVE7O0FBTVYsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDOUMsV0FBSyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFdBQUssTUFBTSxHQUFHLE1BQU0sQ0FBQztHQUN0QixDQUFDLENBQUM7Q0FDSjs7QUFHSCxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CaEMsV0FBUyxFQUFNLG1CQUFDLEtBQWUsRUFBRSxJQUEyQixFQUFFLE9BQWUsRUFBZTtBQUMxRixXQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSzs7O0FBR3RDLFdBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEIsVUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFOUIsVUFBTSxJQUFJLHFCQUFHLFdBQWUsS0FBSyxFQUFFO0FBQ2pDLFlBQUksS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUN0QixpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsaUJBQU87U0FDUjs7QUFFRCxZQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUIsWUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5QyxZQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7QUFDbkIsaUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqQixNQUFNO0FBQ0wsY0FBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNqQjtPQUNGLENBQUEsQ0FBQzs7QUFFRixVQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDVCxDQUFDLENBQUM7R0FDSjs7QUFFRCxVQUFRLEVBQVIsUUFBUTs7QUFFUixXQUFTLEVBQUEsbUJBQUMsQ0FBK0IsRUFBeUM7QUFDaEYsV0FBTyxZQUE4Qjs7O3dDQUFsQixJQUFJO0FBQUosWUFBSTs7O0FBQ3JCLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLGlCQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQy9CLGNBQUksS0FBSyxFQUFFO0FBQ1Qsa0JBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztXQUNmLE1BQU07QUFDTCxtQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQ2pCO1NBQ0Y7QUFDRCxTQUFDLENBQUMsS0FBSyxTQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDeEMsQ0FBQyxDQUFDO0tBQ0osQ0FBQztHQUNIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQsWUFBVSxFQUFNLG9CQUNkLEtBQWUsRUFDZixLQUFhLEVBQ2IsZUFBd0MsRUFDckI7QUFDbkIsUUFBTSxNQUFnQixHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRCxRQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQUN6QixRQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7O0FBRWQsUUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVwRCxXQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxVQUFNLFVBQVUscUJBQUcsYUFBWTtBQUM3QixZQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQzFCLGNBQUksZ0JBQWdCLEtBQUssQ0FBQyxFQUFFO0FBQzFCLG1CQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDakI7QUFDRCxpQkFBTztTQUNSO0FBQ0QsVUFBRSxnQkFBZ0IsQ0FBQztBQUNuQixZQUFNLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUNsQixZQUFJO0FBQ0YsZ0JBQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3QyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsZ0JBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNYO0FBQ0QsVUFBRSxnQkFBZ0IsQ0FBQztBQUNuQixrQkFBVSxFQUFFLENBQUM7T0FDZCxDQUFBLENBQUM7O0FBRUYsYUFBTyxnQkFBZ0IsR0FBRyxhQUFhLEVBQUU7QUFDdkMsa0JBQVUsRUFBRSxDQUFDO09BQ2Q7S0FDRixDQUFDLENBQUM7R0FDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QkQsQUFBTSxhQUFXLG9CQUFHLFdBQ2xCLEtBQWUsRUFDZixjQUE2QyxFQUM3QyxLQUFjLEVBQ0s7QUFDbkIsUUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFVBQU0sUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLG9CQUFFLFdBQU8sSUFBSSxFQUFRO0FBQ3pFLFVBQUksTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDOUIsb0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDekI7S0FDRixFQUFDLENBQUM7QUFDSCxXQUFPLFlBQVksQ0FBQztHQUNyQixDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCRCxBQUFNLFdBQVMsb0JBQUcsV0FDaEIsS0FBZSxFQUNmLFlBQTJDLEVBQzNDLEtBQWMsRUFDSTtBQUNsQixRQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDckIsVUFBTSxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sb0JBQUUsV0FBTyxJQUFJLEVBQVE7QUFDekUsVUFBSSxRQUFRLEVBQUU7O0FBRVosZUFBTztPQUNSO0FBQ0QsVUFBSSxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM1QixnQkFBUSxHQUFHLElBQUksQ0FBQztPQUNqQjtLQUNGLEVBQUMsQ0FBQztBQUNILFdBQU8sUUFBUSxDQUFDO0dBQ2pCLENBQUE7O0FBRUQsbUJBQWlCLEVBQWpCLGlCQUFpQjs7QUFFakIsbUJBQWlCLEVBQWpCLGlCQUFpQjs7Ozs7QUFLakIsV0FBUyxFQUFBLG1CQUFDLE1BQVcsRUFBVztBQUM5QixXQUFPLENBQUMsQ0FBRSxNQUFNLEFBQUMsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztHQUN0Rjs7QUFFRCxZQUFVLEVBQVYsVUFBVTs7QUFFVixvQkFBa0IsRUFBbEIsa0JBQWtCO0NBQ25CLENBQUMiLCJmaWxlIjoicHJvbWlzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbnR5cGUgUnVuUmV0dXJuPFQ+ID0ge1xuICBzdGF0dXM6ICdzdWNjZXNzJztcbiAgcmVzdWx0OiBUO1xufSB8IHtcbiAgc3RhdHVzOiAnb3V0ZGF0ZWQnO1xufTtcblxuLyoqXG4gKiBBbGxvd3MgYSBjYWxsZXIgdG8gZW5zdXJlIHRoYXQgdGhlIHJlc3VsdHMgaXQgcmVjZWl2ZXMgZnJvbSBjb25zZWN1dGl2ZVxuICogcHJvbWlzZSByZXNvbHV0aW9ucyBhcmUgbmV2ZXIgb3V0ZGF0ZWQuIFVzYWdlOlxuICpcbiAqIHZhciByZXF1ZXN0U2VyaWFsaXplciA9IG5ldyBSZXF1ZXN0U2VyaWFsaXplcigpO1xuICpcbiAqIC8vIGluIHNvbWUgbGF0ZXIgbG9vcDpcbiAqXG4gKiAvLyBub3RlIHRoYXQgeW91IGRvIG5vdCBhd2FpdCB0aGUgYXN5bmMgZnVuY3Rpb24gaGVyZSAtLSB5b3UgbXVzdCBwYXNzIHRoZVxuICogLy8gcHJvbWlzZSBpdCByZXR1cm5zIHRvIGBydW5gXG4gKiB2YXIgcmVzdWx0ID0gYXdhaXQgcmVxdWVzdFNlcmlhbGl6ZXIucnVuKHNvbWVBc3luY0Z1bmN0aW9uKCkpXG4gKlxuICogaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICogICAuLi4uXG4gKiAgIHJlc3VsdC5yZXN1bHRcbiAqIH0gZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ291dGRhdGVkJykge1xuICogICAuLi4uXG4gKiB9XG4gKlxuICogVGhlIGNvbnRyYWN0IGlzIHRoYXQgdGhlIHN0YXR1cyBpcyAnc3VjY2VzcycgaWYgYW5kIG9ubHkgaWYgdGhpcyB3YXMgdGhlIG1vc3RcbiAqIHJlY2VudGx5IGRpc3BhdGNoZWQgY2FsbCBvZiAncnVuJy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBjYWxsIHJ1bihwcm9taXNlMSkgYW5kXG4gKiB0aGVuIHJ1bihwcm9taXNlMiksIGFuZCBwcm9taXNlMiByZXNvbHZlcyBmaXJzdCwgdGhlIHNlY29uZCBjYWxsc2l0ZSB3b3VsZFxuICogcmVjZWl2ZSBhICdzdWNjZXNzJyBzdGF0dXMuIElmIHByb21pc2UxIGxhdGVyIHJlc29sdmVkLCB0aGUgZmlyc3QgY2FsbHNpdGVcbiAqIHdvdWxkIHJlY2VpdmUgYW4gJ291dGRhdGVkJyBzdGF0dXMuXG4gKi9cbmNsYXNzIFJlcXVlc3RTZXJpYWxpemVyPFQ+IHtcbiAgX2xhc3REaXNwYXRjaGVkT3A6IG51bWJlcjtcbiAgX2xhc3RGaW5pc2hlZE9wOiBudW1iZXI7XG4gIF9sYXRlc3RQcm9taXNlOiBQcm9taXNlPFQ+O1xuICBfd2FpdFJlc29sdmU6IEZ1bmN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2xhc3REaXNwYXRjaGVkT3AgPSAwO1xuICAgIHRoaXMuX2xhc3RGaW5pc2hlZE9wID0gMDtcbiAgICB0aGlzLl9sYXRlc3RQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fd2FpdFJlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgcnVuKHByb21pc2U6IFByb21pc2U8VD4pOiBQcm9taXNlPFJ1blJldHVybjxUPj4ge1xuICAgIGNvbnN0IHRoaXNPcCA9IHRoaXMuX2xhc3REaXNwYXRjaGVkT3AgKyAxO1xuICAgIHRoaXMuX2xhc3REaXNwYXRjaGVkT3AgPSB0aGlzT3A7XG4gICAgdGhpcy5fbGF0ZXN0UHJvbWlzZSA9IHByb21pc2U7XG4gICAgdGhpcy5fd2FpdFJlc29sdmUoKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwcm9taXNlO1xuICAgIGlmICh0aGlzLl9sYXN0RmluaXNoZWRPcCA8IHRoaXNPcCkge1xuICAgICAgdGhpcy5fbGFzdEZpbmlzaGVkT3AgPSB0aGlzT3A7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXM6ICdzdWNjZXNzJyxcbiAgICAgICAgcmVzdWx0LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzOiAnb3V0ZGF0ZWQnLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgbGFzdCByZXN1bHQgb2YgYHJ1bmAsXG4gICAqIGFzIHNvb24gYXMgdGhlcmUgYXJlIG5vIG1vcmUgb3V0c3RhbmRpbmcgYHJ1bmAgY2FsbHMuXG4gICAqL1xuICBhc3luYyB3YWl0Rm9yTGF0ZXN0UmVzdWx0KCk6IFByb21pc2U8VD4ge1xuICAgIGxldCBsYXN0UHJvbWlzZSA9IG51bGw7XG4gICAgbGV0IHJlc3VsdDogYW55ID0gbnVsbDtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgd2hpbGUgKGxhc3RQcm9taXNlICE9PSB0aGlzLl9sYXRlc3RQcm9taXNlKSB7XG4gICAgICBsYXN0UHJvbWlzZSA9IHRoaXMuX2xhdGVzdFByb21pc2U7XG4gICAgICAvLyBXYWl0IGZvciB0aGUgY3VycmVudCBsYXN0IGtub3cgcHJvbWlzZSB0byByZXNvbHZlLCBvciBhIG5leHQgcnVuIGhhdmUgc3RhcnRlZC5cbiAgICAgIHJlc3VsdCA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdGhpcy5fd2FpdFJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICB0aGlzLl9sYXRlc3RQcm9taXNlLnRoZW4ocmVzb2x2ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgcmV0dXJuIChyZXN1bHQ6IFQpO1xuICB9XG5cbiAgaXNSdW5JblByb2dyZXNzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9sYXN0RGlzcGF0Y2hlZE9wID4gdGhpcy5fbGFzdEZpbmlzaGVkT3A7XG4gIH1cbn1cblxuLypcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIGFmdGVyIGBtaWxsaVNlY29uZHNgIG1pbGxpIHNlY29uZHMuXG4gKiB0aGlzIGNhbiBiZSB1c2VkIHRvIHBhdXNlIGV4ZWN1dGlvbiBhc3luY2hyb25vdXNseS5cbiAqIGUuZy4gYXdhaXQgYXdhaXRNaWxsaVNlY29uZHMoMTAwMCksIHBhdXNlcyB0aGUgYXN5bmMgZmxvdyBleGVjdXRpb24gZm9yIDEgc2Vjb25kLlxuICovXG5mdW5jdGlvbiBhd2FpdE1pbGxpU2Vjb25kcyhtaWxsaVNlY29uZHM6IG51bWJlcik6IFByb21pc2Uge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgbWlsbGlTZWNvbmRzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogQ2FsbCBhbiBhc3luYyBmdW5jdGlvbiByZXBlYXRlZGx5IHdpdGggYSBtYXhpbXVtIG51bWJlciBvZiB0cmlhbHMgbGltaXQsXG4gKiB1bnRpbCBhIHZhbGlkIHJlc3VsdCB0aGF0J3MgZGVmaW5lZCBieSBhIHZhbGlkYXRpb24gZnVuY3Rpb24uXG4gKiBBIGZhaWxlZCBjYWxsIGNhbiByZXN1bHQgZnJvbSBhbiBhc3luYyB0aHJvd24gZXhjZXB0aW9uLCBvciBpbnZhbGlkIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0gYHJldHJ5RnVuY3Rpb25gIHRoZSBhc3luYyBsb2dpYyB0aGF0J3Mgd2FudGVkIHRvIGJlIHJldHJpZWQuXG4gKiBAcGFyYW0gYHZhbGlkYXRpb25GdW5jdGlvbmAgdGhlIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhhdCBkZWNpZGVzIHdoZXRoZXIgYSByZXNwb25zZSBpcyB2YWxpZC5cbiAqIEBwYXJhbSBgbWF4aW11bVRyaWVzYCB0aGUgbnVtYmVyIG9mIHRpbWVzIHRoZSBgcmV0cnlGdW5jdGlvbmAgY2FuIGZhaWwgdG8gZ2V0IGEgdmFsaWRcbiAqIHJlc3BvbnNlIGJlZm9yZSB0aGUgYHJldHJ5TGltaXRgIGlzIHRlcm1pbmF0ZWQgcmVwb3J0aW5nIGFuIGVycm9yLlxuICogQHBhcmFtIGByZXRyeUludGVydmFsTXNgIG9wdGlvbmFsLCB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJldHdlZW4gdHJpYWxzLCBpZiB3YW50ZWQuXG4gKlxuICogSWYgYW4gZXhjZXB0aW9uIGlzIGVuY291bnRlcmVkIG9uIHRoZSBsYXN0IHRyaWFsLCB0aGUgZXhjZXB0aW9uIGlzIHRocm93bi5cbiAqIElmIG5vIHZhbGlkIHJlc3BvbnNlIGlzIGZvdW5kLCBhbiBleGNlcHRpb24gaXMgdGhyb3duLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXRyeUxpbWl0PFQ+KFxuICByZXRyeUZ1bmN0aW9uOiAoKSA9PiBQcm9taXNlPFQ+LFxuICB2YWxpZGF0aW9uRnVuY3Rpb246IChyZXN1bHQ6IFQpID0+IGJvb2xlYW4sXG4gIG1heGltdW1UcmllczogbnVtYmVyLFxuICByZXRyeUludGVydmFsTXM/OiBudW1iZXIgPSAwLFxuKTogUHJvbWlzZTxUPiB7XG4gIGxldCByZXN1bHQgPSBudWxsO1xuICBsZXQgdHJpZXMgPSAwO1xuICBsZXQgbGFzdEVycm9yID0gbnVsbDtcbiAgLyogZXNsaW50LWRpc2FibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICB3aGlsZSAodHJpZXMgPT09IDAgfHwgdHJpZXMgPCBtYXhpbXVtVHJpZXMpIHtcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gYXdhaXQgcmV0cnlGdW5jdGlvbigpO1xuICAgICAgbGFzdEVycm9yID0gbnVsbDtcbiAgICAgIGlmICh2YWxpZGF0aW9uRnVuY3Rpb24ocmVzdWx0KSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsYXN0RXJyb3IgPSBlcnJvcjtcbiAgICAgIHJlc3VsdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCsrdHJpZXMgPCBtYXhpbXVtVHJpZXMgJiYgcmV0cnlJbnRlcnZhbE1zICE9PSAwKSB7XG4gICAgICBhd2FpdCBhd2FpdE1pbGxpU2Vjb25kcyhyZXRyeUludGVydmFsTXMpO1xuICAgIH1cbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgaWYgKGxhc3RFcnJvciAhPSBudWxsKSB7XG4gICAgdGhyb3cgbGFzdEVycm9yO1xuICB9IGVsc2UgaWYgKHRyaWVzID09PSBtYXhpbXVtVHJpZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbGlkIHJlc3BvbnNlIGZvdW5kIScpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAoKHJlc3VsdDogYW55KTogVCk7XG4gIH1cbn1cblxuLyoqXG4gKiBMaW1pdHMgYXN5bmMgZnVuY3Rpb24gZXhlY3V0aW9uIHBhcmFsbGVsaXNtIHRvIG9ubHkgb25lIGF0IGEgdGltZS5cbiAqIEhlbmNlLCBpZiBhIGNhbGwgaXMgYWxyZWFkeSBydW5uaW5nLCBpdCB3aWxsIHdhaXQgZm9yIGl0IHRvIGZpbmlzaCxcbiAqIHRoZW4gc3RhcnQgdGhlIG5leHQgYXN5bmMgZXhlY3V0aW9uLCBidXQgaWYgY2FsbGVkIGFnYWluIHdoaWxlIG5vdCBmaW5pc2hlZCxcbiAqIGl0IHdpbGwgcmV0dXJuIHRoZSBzY2hlZHVsZWQgZXhlY3V0aW9uIHByb21pc2UuXG4gKlxuICogU2FtcGxlIFVzYWdlOlxuICogYGBgXG4gKiBsZXQgaSA9IDE7XG4gKiBjb25zdCBvbmVFeGVjQXRBVGltZSA9IG9uZVBhcmFsbGVsQXN5bmNDYWxsKCgpID0+IHtcbiAqICAgcmV0dXJuIG5leHQgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gKiAgICAgc2V0VGltZW91dCgyMDAsICgpID0+IHJlc29sdmUoaSsrKSk7XG4gKiAgIH0pO1xuICogfSk7XG4gKlxuICogY29uc3QgcmVzdWx0MVByb21pc2UgPSBvbmVFeGVjQXRBVGltZSgpOyAvLyBTdGFydCBhbiBhc3luYywgYW5kIHJlc29sdmUgdG8gMSBpbiAyMDAgbXMuXG4gKiBjb25zdCByZXN1bHQyUHJvbWlzZSA9IG9uZUV4ZWNBdEFUaW1lKCk7IC8vIFNjaGVkdWxlIHRoZSBuZXh0IGFzeW5jLCBhbmQgcmVzb2x2ZSB0byAyIGluIDQwMCBtcy5cbiAqIGNvbnN0IHJlc3VsdDNQcm9taXNlID0gb25lRXhlY0F0QVRpbWUoKTsgLy8gUmV1c2Ugc2NoZWR1bGVkIHByb21pc2UgYW5kIHJlc29sdmUgdG8gMiBpbiA0MDAgbXMuXG4gKiBgYGBcbiAqL1xuZnVuY3Rpb24gc2VyaWFsaXplQXN5bmNDYWxsPFQ+KGFzeW5jRnVuOiAoKSA9PiBQcm9taXNlPFQ+KTogKCkgPT4gUHJvbWlzZTxUPiB7XG4gIGxldCBzY2hlZHVsZWRDYWxsID0gbnVsbDtcbiAgbGV0IHBlbmRpbmdDYWxsID0gbnVsbDtcbiAgY29uc3Qgc3RhcnRBc3luY0NhbGwgPSAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0UHJvbWlzZSA9IGFzeW5jRnVuKCk7XG4gICAgcGVuZGluZ0NhbGwgPSByZXN1bHRQcm9taXNlLnRoZW4oXG4gICAgICAoKSA9PiBwZW5kaW5nQ2FsbCA9IG51bGwsXG4gICAgICAoKSA9PiBwZW5kaW5nQ2FsbCA9IG51bGwsXG4gICAgKTtcbiAgICByZXR1cm4gcmVzdWx0UHJvbWlzZTtcbiAgfTtcbiAgY29uc3QgY2FsbE5leHQgPSAoKSA9PiB7XG4gICAgc2NoZWR1bGVkQ2FsbCA9IG51bGw7XG4gICAgcmV0dXJuIHN0YXJ0QXN5bmNDYWxsKCk7XG4gIH07XG4gIGNvbnN0IHNjaGVkdWxlTmV4dENhbGwgPSAoKSA9PiB7XG4gICAgaWYgKHNjaGVkdWxlZENhbGwgPT0gbnVsbCkge1xuICAgICAgaW52YXJpYW50KHBlbmRpbmdDYWxsLCAncGVuZGluZ0NhbGwgbXVzdCBub3QgYmUgbnVsbCEnKTtcbiAgICAgIHNjaGVkdWxlZENhbGwgPSBwZW5kaW5nQ2FsbC50aGVuKGNhbGxOZXh0LCBjYWxsTmV4dCk7XG4gICAgfVxuICAgIHJldHVybiBzY2hlZHVsZWRDYWxsO1xuICB9O1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmIChwZW5kaW5nQ2FsbCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3RhcnRBc3luY0NhbGwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNjaGVkdWxlTmV4dENhbGwoKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYSBwcm9taXNlIGFsb25nIHdpdGggbWV0aG9kcyB0byBjaGFuZ2UgaXRzIHN0YXRlLiBPdXIgdmVyc2lvbiBvZiB0aGUgbm9uLXN0YW5kYXJkXG4gKiBgUHJvbWlzZS5kZWZlcigpYC5cbiAqXG4gKiBJTVBPUlRBTlQ6IFRoaXMgc2hvdWxkIGFsbW9zdCBuZXZlciBiZSB1c2VkISEgSW5zdGVhZCwgdXNlIHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yLiBTZWVcbiAqICA8aHR0cHM6Ly9naXRodWIuY29tL3BldGthYW50b25vdi9ibHVlYmlyZC93aWtpL1Byb21pc2UtYW50aS1wYXR0ZXJucyN0aGUtZGVmZXJyZWQtYW50aS1wYXR0ZXJuPlxuICovXG5jbGFzcyBEZWZlcnJlZDxUPiB7XG4gIHByb21pc2U6IFByb21pc2U8VD47XG4gIHJlc29sdmU6ICh2YWx1ZTogVCkgPT4gdm9pZDtcbiAgcmVqZWN0OiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBwcm9taXNlcyA9IG1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsdWUgZGVyaXZlZCBhc3luY2hyb25vdXNseSBmcm9tIGFuIGVsZW1lbnQgaW4gdGhlIGl0ZW1zIGFycmF5LlxuICAgKiBUaGUgdGVzdCBmdW5jdGlvbiBpcyBhcHBsaWVkIHNlcXVlbnRpYWxseSB0byBlYWNoIGVsZW1lbnQgaW4gaXRlbXMgdW50aWxcbiAgICogb25lIHJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBub24tbnVsbCB2YWx1ZS4gV2hlbiB0aGlzIGhhcHBlbnMsXG4gICAqIHRoZSBQcm9taXNlIHJldHVybmVkIGJ5IHRoaXMgbWV0aG9kIHdpbGwgcmVzb2x2ZSB0byB0aGF0IG5vbi1udWxsIHZhbHVlLiBJZlxuICAgKiBubyBzdWNoIFByb21pc2UgaXMgcHJvZHVjZWQsIHRoZW4gdGhlIFByb21pc2UgcmV0dXJuZWQgYnkgdGhpcyBmdW5jdGlvblxuICAgKiB3aWxsIHJlc29sdmUgdG8gbnVsbC5cbiAgICpcbiAgICogQHBhcmFtIGl0ZW1zIEFycmF5IG9mIGVsZW1lbnRzIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gdGVzdCwgb25lIGF0IGEgdGltZS5cbiAgICogQHBhcmFtIHRlc3QgV2lsbCBiZSBjYWxsZWQgd2l0aCBlYWNoIGl0ZW0gYW5kIG11c3QgcmV0dXJuIGVpdGhlcjpcbiAgICogICAgICgxKSBBIFwidGhlbmFibGVcIiAoaS5lLCBhIFByb21pc2Ugb3IgcHJvbWlzZS1saWtlIG9iamVjdCkgdGhhdCByZXNvbHZlc1xuICAgKiAgICAgICAgIHRvIGEgZGVyaXZlZCB2YWx1ZSAodGhhdCB3aWxsIGJlIHJldHVybmVkKSBvciBudWxsLlxuICAgKiAgICAgKDIpIG51bGwuXG4gICAqICAgICBJbiBib3RoIGNhc2VzIHdoZXJlIG51bGwgaXMgcmV0dXJuZWQsIHRlc3Qgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBuZXh0XG4gICAqICAgICBpdGVtIGluIHRoZSBhcnJheS5cbiAgICogQHBhcmFtIHRoaXNBcmcgUmVjZWl2ZXIgdGhhdCB3aWxsIGJlIHVzZWQgd2hlbiB0ZXN0IGlzIGNhbGxlZC5cbiAgICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYXN5bmNocm9ub3VzbHkgZGVyaXZlZCB2YWx1ZSBvciBudWxsLlxuICAgKi9cbiAgYXN5bmNGaW5kPFQsIFU+KGl0ZW1zOiBBcnJheTxUPiwgdGVzdDogKHQ6IFQpID0+ID9Qcm9taXNlPFU+LCB0aGlzQXJnPzogbWl4ZWQpOiBQcm9taXNlPD9VPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIENyZWF0ZSBhIGxvY2FsIGNvcHkgb2YgaXRlbXMgdG8gZGVmZW5kIGFnYWluc3QgdGhlIGNhbGxlciBtb2RpZnlpbmcgdGhlXG4gICAgICAvLyBhcnJheSBiZWZvcmUgdGhpcyBQcm9taXNlIGlzIHJlc29sdmVkLlxuICAgICAgaXRlbXMgPSBpdGVtcy5zbGljZSgpO1xuICAgICAgY29uc3QgbnVtSXRlbXMgPSBpdGVtcy5sZW5ndGg7XG5cbiAgICAgIGNvbnN0IG5leHQgPSBhc3luYyBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPT09IG51bUl0ZW1zKSB7XG4gICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaW5kZXhdO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0ZXN0LmNhbGwodGhpc0FyZywgaXRlbSk7XG4gICAgICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dChpbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBuZXh0KDApO1xuICAgIH0pO1xuICB9LFxuXG4gIERlZmVycmVkLFxuXG4gIGRlbm9kZWlmeShmOiAoLi4uYXJnczogQXJyYXk8YW55PikgPT4gYW55KTogKC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3M6IEFycmF5PGFueT4pIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGVycm9yLCByZXN1bHQpIHtcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZi5hcHBseSh0aGlzLCBhcmdzLmNvbmNhdChbY2FsbGJhY2tdKSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBBIFByb21pc2UgdXRpbGl0eSB0aGF0IHJ1bnMgYSBtYXhpbXVtIG9mIGxpbWl0IGFzeW5jIG9wZXJhdGlvbnMgYXQgYSB0aW1lIGl0ZXJhdGluZyBvdmVyIGFuXG4gICAqIGFycmF5IGFuZCByZXR1cm5pbmcgdGhlIHJlc3VsdCBvZiBleGVjdXRpb25zLlxuICAgKiBlLmcuIHRvIGxpbWl0IHRoZSBudW1iZXIgb2YgZmlsZSByZWFkcyB0byA1LFxuICAgKiByZXBsYWNlIHRoZSBjb2RlOlxuICAgKiAgICB2YXIgZmlsZUNvbnRlbnRzID0gYXdhaXQgUHJvbWlzZS5hbGwoZmlsZVBhdGhzLm1hcChmc1Byb21pc2UucmVhZEZpbGUpKVxuICAgKiB3aXRoOlxuICAgKiAgICB2YXIgZmlsZUNvbnRlbnRzID0gYXdhaXQgYXN5bmNMaW1pdChmaWxlUGF0aHMsIDUsIGZzUHJvbWlzZS5yZWFkRmlsZSlcbiAgICpcbiAgICogVGhpcyBpcyBwYXJ0aWN1bHJpbHkgdXNlZnVsIHRvIGxpbWl0IElPIG9wZXJhdGlvbnMgdG8gYSBjb25maWd1cmFibGUgbWF4aW11bSAodG8gYXZvaWRcbiAgICogYmxvY2tpbmcpLCB3aGlsZSBlbmpveWluZyB0aGUgY29uZmlndXJlZCBsZXZlbCBvZiBwYXJhbGxlbGlzbS5cbiAgICpcbiAgICogQHBhcmFtIGFycmF5IHRoZSBhcnJheSBvZiBpdGVtcyBmb3IgaXRlcmF0aW9uLlxuICAgKiBAcGFyYW0gbGltaXQgdGhlIGNvbmZpZ3VyYWJsZSBudW1iZXIgb2YgcGFyYWxsZWwgYXN5bmMgb3BlcmF0aW9ucy5cbiAgICogQHBhcmFtIG1hcHBpbmdGdW5jdGlvbiB0aGUgYXN5bmMgUHJvbWlzZSBmdW5jdGlvbiB0aGF0IGNvdWxkIHJldHVybiBhIHVzZWZ1bCByZXN1bHQuXG4gICAqL1xuICBhc3luY0xpbWl0PFQsIFY+KFxuICAgIGFycmF5OiBBcnJheTxUPixcbiAgICBsaW1pdDogbnVtYmVyLFxuICAgIG1hcHBpbmdGdW5jdGlvbjogKGl0ZW06IFQpID0+IFByb21pc2U8Vj5cbiAgKTogUHJvbWlzZTxBcnJheTxWPj4ge1xuICAgIGNvbnN0IHJlc3VsdDogQXJyYXk8Vj4gPSBuZXcgQXJyYXkoYXJyYXkubGVuZ3RoKTtcbiAgICBsZXQgcGFyYWxsZWxQcm9taXNlcyA9IDA7XG4gICAgbGV0IGluZGV4ID0gMDtcblxuICAgIGNvbnN0IHBhcmFsbGVsTGltaXQgPSBNYXRoLm1pbihsaW1pdCwgYXJyYXkubGVuZ3RoKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBydW5Qcm9taXNlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoaW5kZXggPT09IGFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgIGlmIChwYXJhbGxlbFByb21pc2VzID09PSAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICArK3BhcmFsbGVsUHJvbWlzZXM7XG4gICAgICAgIGNvbnN0IGkgPSBpbmRleCsrO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdFtpXSA9IGF3YWl0IG1hcHBpbmdGdW5jdGlvbihhcnJheVtpXSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICAgICAgLS1wYXJhbGxlbFByb21pc2VzO1xuICAgICAgICBydW5Qcm9taXNlKCk7XG4gICAgICB9O1xuXG4gICAgICB3aGlsZSAocGFyYWxsZWxQcm9taXNlcyA8IHBhcmFsbGVsTGltaXQpIHtcbiAgICAgICAgcnVuUHJvbWlzZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBgZmlsdGVyYCBQcm9taXNlIHV0aWxpdHkgdGhhdCBhbGxvd3MgZmlsdGVyaW5nIGFuIGFycmF5IHdpdGggYW4gYXN5bmMgUHJvbWlzZSBmdW5jdGlvbi5cbiAgICogSXQncyBhbiBhbHRlcm5hdGl2ZSB0byBgQXJyYXkucHJvdG90eXBlLmZpbHRlcmAgdGhhdCBhY2NlcHRzIGFuIGFzeW5jIGZ1bmN0aW9uLlxuICAgKiBZb3UgY2FuIG9wdGlvbmFsbHkgY29uZmlndXJlIGEgbGltaXQgdG8gc2V0IHRoZSBtYXhpbXVtIG51bWJlciBvZiBhc3luYyBvcGVyYXRpb25zIGF0IGEgdGltZS5cbiAgICpcbiAgICogUHJldmlvdXNseSwgd2l0aCB0aGUgYFByb21pc2UuYWxsYCBwcmltaXRpdmUsIHdlIGNhbid0IHNldCB0aGUgcGFyYWxsZWxpc20gbGltaXQgYW5kIHdlIGhhdmUgdG9cbiAgICogYGZpbHRlcmAsIHNvLCB3ZSByZXBsYWNlIHRoZSBvbGQgYGZpbHRlcmAgY29kZTpcbiAgICogICAgIHZhciBleGlzdGluZ0ZpbGVQYXRocyA9IFtdO1xuICAgKiAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZVBhdGhzLm1hcChhc3luYyAoZmlsZVBhdGgpID0+IHtcbiAgICogICAgICAgaWYgKGF3YWl0IGZzUHJvbWlzZS5leGlzdHMoZmlsZVBhdGgpKSB7XG4gICAqICAgICAgICAgZXhpc3RpbmdGaWxlUGF0aHMucHVzaChmaWxlUGF0aCk7XG4gICAqICAgICAgIH1cbiAgICogICAgIH0pKTtcbiAgICogd2l0aCBsaW1pdCA1IHBhcmFsbGVsIGZpbGVzeXN0ZW0gb3BlcmF0aW9ucyBhdCBhIHRpbWU6XG4gICAqICAgIHZhciBleGlzdGluZ0ZpbGVQYXRocyA9IGF3YWl0IGFzeW5jRmlsdGVyKGZpbGVQYXRocywgZnNQcm9taXNlLmV4aXN0cywgNSk7XG4gICAqXG4gICAqIEBwYXJhbSBhcnJheSB0aGUgYXJyYXkgb2YgaXRlbXMgZm9yIGBmaWx0ZXJgaW5nLlxuICAgKiBAcGFyYW0gZmlsdGVyRnVuY3Rpb24gdGhlIGFzeW5jIGBmaWx0ZXJgIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhXG4gICAqICAgYm9vbGVhbi5cbiAgICogQHBhcmFtIGxpbWl0IHRoZSBjb25maWd1cmFibGUgbnVtYmVyIG9mIHBhcmFsbGVsIGFzeW5jIG9wZXJhdGlvbnMuXG4gICAqL1xuICBhc3luYyBhc3luY0ZpbHRlcjxUPihcbiAgICBhcnJheTogQXJyYXk8VD4sXG4gICAgZmlsdGVyRnVuY3Rpb246IChpdGVtOiBUKSA9PiBQcm9taXNlPGJvb2xlYW4+LFxuICAgIGxpbWl0PzogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8VD4+IHtcbiAgICBjb25zdCBmaWx0ZXJlZExpc3QgPSBbXTtcbiAgICBhd2FpdCBwcm9taXNlcy5hc3luY0xpbWl0KGFycmF5LCBsaW1pdCB8fCBhcnJheS5sZW5ndGgsIGFzeW5jIChpdGVtOiBUKSA9PiB7XG4gICAgICBpZiAoYXdhaXQgZmlsdGVyRnVuY3Rpb24oaXRlbSkpIHtcbiAgICAgICAgZmlsdGVyZWRMaXN0LnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbHRlcmVkTGlzdDtcbiAgfSxcblxuICAvKipcbiAgICogYHNvbWVgIFByb21pc2UgdXRpbGl0eSB0aGF0IGFsbG93cyBgc29tZWAgYW4gYXJyYXkgd2l0aCBhbiBhc3luYyBQcm9taXNlIHNvbWUgZnVuY3Rpb24uXG4gICAqIEl0J3MgYW4gYWx0ZXJuYXRpdmUgdG8gYEFycmF5LnByb3RvdHlwZS5zb21lYCB0aGF0IGFjY2VwdHMgYW4gYXN5bmMgc29tZSBmdW5jdGlvbi5cbiAgICogWW91IGNhbiBvcHRpb25hbGx5IGNvbmZpZ3VyZSBhIGxpbWl0IHRvIHNldCB0aGUgbWF4aW11bSBudW1iZXIgb2YgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUuXG4gICAqXG4gICAqIFByZXZpb3VzbHksIHdpdGggdGhlIFByb21pc2UuYWxsIHByaW1pdGl2ZSwgd2UgY2FuJ3Qgc2V0IHRoZSBwYXJhbGxlbGlzbSBsaW1pdCBhbmQgd2UgaGF2ZSB0b1xuICAgKiBgc29tZWAsIHNvLCB3ZSByZXBsYWNlIHRoZSBvbGQgYHNvbWVgIGNvZGU6XG4gICAqICAgICB2YXIgc29tZUZpbGVFeGlzdCA9IGZhbHNlO1xuICAgKiAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZVBhdGhzLm1hcChhc3luYyAoZmlsZVBhdGgpID0+IHtcbiAgICogICAgICAgaWYgKGF3YWl0IGZzUHJvbWlzZS5leGlzdHMoZmlsZVBhdGgpKSB7XG4gICAqICAgICAgICAgc29tZUZpbGVFeGlzdCA9IHRydWU7XG4gICAqICAgICAgIH1cbiAgICogICAgIH0pKTtcbiAgICogd2l0aCBsaW1pdCA1IHBhcmFsbGVsIGZpbGVzeXN0ZW0gb3BlcmF0aW9ucyBhdCBhIHRpbWU6XG4gICAqICAgIHZhciBzb21lRmlsZUV4aXN0ID0gYXdhaXQgYXN5bmNTb21lKGZpbGVQYXRocywgZnNQcm9taXNlLmV4aXN0cywgNSk7XG4gICAqXG4gICAqIEBwYXJhbSBhcnJheSB0aGUgYXJyYXkgb2YgaXRlbXMgZm9yIGBzb21lYGluZy5cbiAgICogQHBhcmFtIHNvbWVGdW5jdGlvbiB0aGUgYXN5bmMgYHNvbWVgIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhXG4gICAqICAgYm9vbGVhbi5cbiAgICogQHBhcmFtIGxpbWl0IHRoZSBjb25maWd1cmFibGUgbnVtYmVyIG9mIHBhcmFsbGVsIGFzeW5jIG9wZXJhdGlvbnMuXG4gICAqL1xuICBhc3luYyBhc3luY1NvbWU8VD4oXG4gICAgYXJyYXk6IEFycmF5PFQ+LFxuICAgIHNvbWVGdW5jdGlvbjogKGl0ZW06IFQpID0+IFByb21pc2U8Ym9vbGVhbj4sXG4gICAgbGltaXQ/OiBudW1iZXJcbiAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgbGV0IHJlc29sdmVkID0gZmFsc2U7XG4gICAgYXdhaXQgcHJvbWlzZXMuYXN5bmNMaW1pdChhcnJheSwgbGltaXQgfHwgYXJyYXkubGVuZ3RoLCBhc3luYyAoaXRlbTogVCkgPT4ge1xuICAgICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gY2FsbCB0aGUgc29tZUZ1bmN0aW9uIGFueW1vcmUgb3Igd2FpdCBhbnkgbG9uZ2VyLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoYXdhaXQgc29tZUZ1bmN0aW9uKGl0ZW0pKSB7XG4gICAgICAgIHJlc29sdmVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gIH0sXG5cbiAgYXdhaXRNaWxsaVNlY29uZHMsXG5cbiAgUmVxdWVzdFNlcmlhbGl6ZXIsXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGFuIG9iamVjdCBpcyBQcm9taXNlIGJ5IHRlc3RpbmcgaWYgaXQgaGFzIGEgYHRoZW5gIGZ1bmN0aW9uIHByb3BlcnR5LlxuICAgKi9cbiAgaXNQcm9taXNlKG9iamVjdDogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKG9iamVjdCkgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSAnZnVuY3Rpb24nO1xuICB9LFxuXG4gIHJldHJ5TGltaXQsXG5cbiAgc2VyaWFsaXplQXN5bmNDYWxsLFxufTtcbiJdfQ==