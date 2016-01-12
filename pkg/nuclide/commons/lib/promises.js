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

  denodeify: function denodeify(f) {
    return function () {
      var _this3 = this;

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
        f.apply(_this3, args.concat([callback]));
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
   * @param filterFunction the async `filter` function that returns a Promise that resolves to a boolean.
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
   * @param someFunction the async `some` function that returns a Promise that resolves to a boolean.
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
//# sourceMappingURL=data:application/json;base64,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QUFDO09BQ2pCO0tBQ0YsRUFBQyxDQUFDO0FBQ0gsV0FBTyxRQUFRLENBQUM7R0FDakIsQ0FBQTs7QUFFRCxtQkFBaUIsRUFBakIsaUJBQWlCOztBQUVqQixtQkFBaUIsRUFBakIsaUJBQWlCOzs7OztBQUtqQixXQUFTLEVBQUEsbUJBQUMsTUFBVyxFQUFXO0FBQzlCLFdBQU8sQ0FBQyxDQUFFLE1BQU0sQUFBQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDO0dBQ3RGOztBQUVELFlBQVUsRUFBVixVQUFVOztBQUVWLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQyIsImZpbGUiOiJwcm9taXNlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxudHlwZSBSdW5SZXR1cm48VD4gPSB7XG4gIHN0YXR1czogJ3N1Y2Nlc3MnO1xuICByZXN1bHQ6IFQ7XG59IHwge1xuICBzdGF0dXM6ICdvdXRkYXRlZCc7XG59O1xuXG4vKipcbiAqIEFsbG93cyBhIGNhbGxlciB0byBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0cyBpdCByZWNlaXZlcyBmcm9tIGNvbnNlY3V0aXZlXG4gKiBwcm9taXNlIHJlc29sdXRpb25zIGFyZSBuZXZlciBvdXRkYXRlZC4gVXNhZ2U6XG4gKlxuICogdmFyIHJlcXVlc3RTZXJpYWxpemVyID0gbmV3IFJlcXVlc3RTZXJpYWxpemVyKCk7XG4gKlxuICogLy8gaW4gc29tZSBsYXRlciBsb29wOlxuICpcbiAqIC8vIG5vdGUgdGhhdCB5b3UgZG8gbm90IGF3YWl0IHRoZSBhc3luYyBmdW5jdGlvbiBoZXJlIC0tIHlvdSBtdXN0IHBhc3MgdGhlXG4gKiAvLyBwcm9taXNlIGl0IHJldHVybnMgdG8gYHJ1bmBcbiAqIHZhciByZXN1bHQgPSBhd2FpdCByZXF1ZXN0U2VyaWFsaXplci5ydW4oc29tZUFzeW5jRnVuY3Rpb24oKSlcbiAqXG4gKiBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gKiAgIC4uLi5cbiAqICAgcmVzdWx0LnJlc3VsdFxuICogfSBlbHNlIGlmIChyZXN1bHQuc3RhdHVzID09PSAnb3V0ZGF0ZWQnKSB7XG4gKiAgIC4uLi5cbiAqIH1cbiAqXG4gKiBUaGUgY29udHJhY3QgaXMgdGhhdCB0aGUgc3RhdHVzIGlzICdzdWNjZXNzJyBpZiBhbmQgb25seSBpZiB0aGlzIHdhcyB0aGUgbW9zdFxuICogcmVjZW50bHkgZGlzcGF0Y2hlZCBjYWxsIG9mICdydW4nLiBGb3IgZXhhbXBsZSwgaWYgeW91IGNhbGwgcnVuKHByb21pc2UxKSBhbmRcbiAqIHRoZW4gcnVuKHByb21pc2UyKSwgYW5kIHByb21pc2UyIHJlc29sdmVzIGZpcnN0LCB0aGUgc2Vjb25kIGNhbGxzaXRlIHdvdWxkXG4gKiByZWNlaXZlIGEgJ3N1Y2Nlc3MnIHN0YXR1cy4gSWYgcHJvbWlzZTEgbGF0ZXIgcmVzb2x2ZWQsIHRoZSBmaXJzdCBjYWxsc2l0ZVxuICogd291bGQgcmVjZWl2ZSBhbiAnb3V0ZGF0ZWQnIHN0YXR1cy5cbiAqL1xuY2xhc3MgUmVxdWVzdFNlcmlhbGl6ZXI8VD4ge1xuICBfbGFzdERpc3BhdGNoZWRPcDogbnVtYmVyO1xuICBfbGFzdEZpbmlzaGVkT3A6IG51bWJlcjtcbiAgX2xhdGVzdFByb21pc2U6IFByb21pc2U8VD47XG4gIF93YWl0UmVzb2x2ZTogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbGFzdERpc3BhdGNoZWRPcCA9IDA7XG4gICAgdGhpcy5fbGFzdEZpbmlzaGVkT3AgPSAwO1xuICAgIHRoaXMuX2xhdGVzdFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl93YWl0UmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBydW4ocHJvbWlzZTogUHJvbWlzZTxUPik6IFByb21pc2U8UnVuUmV0dXJuPFQ+PiB7XG4gICAgY29uc3QgdGhpc09wID0gdGhpcy5fbGFzdERpc3BhdGNoZWRPcCArIDE7XG4gICAgdGhpcy5fbGFzdERpc3BhdGNoZWRPcCA9IHRoaXNPcDtcbiAgICB0aGlzLl9sYXRlc3RQcm9taXNlID0gcHJvbWlzZTtcbiAgICB0aGlzLl93YWl0UmVzb2x2ZSgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHByb21pc2U7XG4gICAgaWYgKHRoaXMuX2xhc3RGaW5pc2hlZE9wIDwgdGhpc09wKSB7XG4gICAgICB0aGlzLl9sYXN0RmluaXNoZWRPcCA9IHRoaXNPcDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1czogJ3N1Y2Nlc3MnLFxuICAgICAgICByZXN1bHQsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXM6ICdvdXRkYXRlZCcsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBsYXN0IHJlc3VsdCBvZiBgcnVuYCxcbiAgICogYXMgc29vbiBhcyB0aGVyZSBhcmUgbm8gbW9yZSBvdXRzdGFuZGluZyBgcnVuYCBjYWxscy5cbiAgICovXG4gIGFzeW5jIHdhaXRGb3JMYXRlc3RSZXN1bHQoKTogUHJvbWlzZTxUPiB7XG4gICAgbGV0IGxhc3RQcm9taXNlID0gbnVsbDtcbiAgICBsZXQgcmVzdWx0OiBhbnkgPSBudWxsO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgICB3aGlsZSAobGFzdFByb21pc2UgIT09IHRoaXMuX2xhdGVzdFByb21pc2UpIHtcbiAgICAgIGxhc3RQcm9taXNlID0gdGhpcy5fbGF0ZXN0UHJvbWlzZTtcbiAgICAgIC8vIFdhaXQgZm9yIHRoZSBjdXJyZW50IGxhc3Qga25vdyBwcm9taXNlIHRvIHJlc29sdmUsIG9yIGEgbmV4dCBydW4gaGF2ZSBzdGFydGVkLlxuICAgICAgcmVzdWx0ID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICB0aGlzLl93YWl0UmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgIHRoaXMuX2xhdGVzdFByb21pc2UudGhlbihyZXNvbHZlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgICByZXR1cm4gKHJlc3VsdDogVCk7XG4gIH1cblxuICBpc1J1bkluUHJvZ3Jlc3MoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3REaXNwYXRjaGVkT3AgPiB0aGlzLl9sYXN0RmluaXNoZWRPcDtcbiAgfVxufVxuXG4vKlxuICogUmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgYWZ0ZXIgYG1pbGxpU2Vjb25kc2AgbWlsbGkgc2Vjb25kcy5cbiAqIHRoaXMgY2FuIGJlIHVzZWQgdG8gcGF1c2UgZXhlY3V0aW9uIGFzeW5jaHJvbm91c2x5LlxuICogZS5nLiBhd2FpdCBhd2FpdE1pbGxpU2Vjb25kcygxMDAwKSwgcGF1c2VzIHRoZSBhc3luYyBmbG93IGV4ZWN1dGlvbiBmb3IgMSBzZWNvbmQuXG4gKi9cbmZ1bmN0aW9uIGF3YWl0TWlsbGlTZWNvbmRzKG1pbGxpU2Vjb25kczogbnVtYmVyKTogUHJvbWlzZSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgc2V0VGltZW91dChyZXNvbHZlLCBtaWxsaVNlY29uZHMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBDYWxsIGFuIGFzeW5jIGZ1bmN0aW9uIHJlcGVhdGVkbHkgd2l0aCBhIG1heGltdW0gbnVtYmVyIG9mIHRyaWFscyBsaW1pdCxcbiAqIHVudGlsIGEgdmFsaWQgcmVzdWx0IHRoYXQncyBkZWZpbmVkIGJ5IGEgdmFsaWRhdGlvbiBmdW5jdGlvbi5cbiAqIEEgZmFpbGVkIGNhbGwgY2FuIHJlc3VsdCBmcm9tIGFuIGFzeW5jIHRocm93biBleGNlcHRpb24sIG9yIGludmFsaWQgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSBgcmV0cnlGdW5jdGlvbmAgdGhlIGFzeW5jIGxvZ2ljIHRoYXQncyB3YW50ZWQgdG8gYmUgcmV0cmllZC5cbiAqIEBwYXJhbSBgdmFsaWRhdGlvbkZ1bmN0aW9uYCB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvbiB0aGF0IGRlY2lkZXMgd2hldGhlciBhIHJlc3BvbnNlIGlzIHZhbGlkLlxuICogQHBhcmFtIGBtYXhpbXVtVHJpZXNgIHRoZSBudW1iZXIgb2YgdGltZXMgdGhlIGByZXRyeUZ1bmN0aW9uYCBjYW4gZmFpbCB0byBnZXQgYSB2YWxpZFxuICogcmVzcG9uc2UgYmVmb3JlIHRoZSBgcmV0cnlMaW1pdGAgaXMgdGVybWluYXRlZCByZXBvcnRpbmcgYW4gZXJyb3IuXG4gKiBAcGFyYW0gYHJldHJ5SW50ZXJ2YWxNc2Agb3B0aW9uYWwsIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmV0d2VlbiB0cmlhbHMsIGlmIHdhbnRlZC5cbiAqXG4gKiBJZiBhbiBleGNlcHRpb24gaXMgZW5jb3VudGVyZWQgb24gdGhlIGxhc3QgdHJpYWwsIHRoZSBleGNlcHRpb24gaXMgdGhyb3duLlxuICogSWYgbm8gdmFsaWQgcmVzcG9uc2UgaXMgZm91bmQsIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJldHJ5TGltaXQ8VD4oXG4gIHJldHJ5RnVuY3Rpb246ICgpID0+IFByb21pc2U8VD4sXG4gIHZhbGlkYXRpb25GdW5jdGlvbjogKHJlc3VsdDogVCkgPT4gYm9vbGVhbixcbiAgbWF4aW11bVRyaWVzOiBudW1iZXIsXG4gIHJldHJ5SW50ZXJ2YWxNcz86IG51bWJlciA9IDAsXG4pOiBQcm9taXNlPFQ+IHtcbiAgbGV0IHJlc3VsdCA9IG51bGw7XG4gIGxldCB0cmllcyA9IDA7XG4gIGxldCBsYXN0RXJyb3IgPSBudWxsO1xuICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gIHdoaWxlICh0cmllcyA9PT0gMCB8fCB0cmllcyA8IG1heGltdW1Ucmllcykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSBhd2FpdCByZXRyeUZ1bmN0aW9uKCk7XG4gICAgICBsYXN0RXJyb3IgPSBudWxsO1xuICAgICAgaWYgKHZhbGlkYXRpb25GdW5jdGlvbihyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxhc3RFcnJvciA9IGVycm9yO1xuICAgICAgcmVzdWx0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoKyt0cmllcyA8IG1heGltdW1UcmllcyAmJiByZXRyeUludGVydmFsTXMgIT09IDApIHtcbiAgICAgIGF3YWl0IGF3YWl0TWlsbGlTZWNvbmRzKHJldHJ5SW50ZXJ2YWxNcyk7XG4gICAgfVxuICB9XG4gIC8qIGVzbGludC1lbmFibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICBpZiAobGFzdEVycm9yICE9IG51bGwpIHtcbiAgICB0aHJvdyBsYXN0RXJyb3I7XG4gIH0gZWxzZSBpZiAodHJpZXMgPT09IG1heGltdW1Ucmllcykge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gdmFsaWQgcmVzcG9uc2UgZm91bmQhJyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICgocmVzdWx0OiBhbnkpOiBUKTtcbiAgfVxufVxuXG4vKipcbiAqIExpbWl0cyBhc3luYyBmdW5jdGlvbiBleGVjdXRpb24gcGFyYWxsZWxpc20gdG8gb25seSBvbmUgYXQgYSB0aW1lLlxuICogSGVuY2UsIGlmIGEgY2FsbCBpcyBhbHJlYWR5IHJ1bm5pbmcsIGl0IHdpbGwgd2FpdCBmb3IgaXQgdG8gZmluaXNoLFxuICogdGhlbiBzdGFydCB0aGUgbmV4dCBhc3luYyBleGVjdXRpb24sIGJ1dCBpZiBjYWxsZWQgYWdhaW4gd2hpbGUgbm90IGZpbmlzaGVkLFxuICogaXQgd2lsbCByZXR1cm4gdGhlIHNjaGVkdWxlZCBleGVjdXRpb24gcHJvbWlzZS5cbiAqXG4gKiBTYW1wbGUgVXNhZ2U6XG4gKiBgYGBcbiAqIGxldCBpID0gMTtcbiAqIGNvbnN0IG9uZUV4ZWNBdEFUaW1lID0gb25lUGFyYWxsZWxBc3luY0NhbGwoKCkgPT4ge1xuICogICByZXR1cm4gbmV4dCBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAqICAgICBzZXRUaW1lb3V0KDIwMCwgKCkgPT4gcmVzb2x2ZShpKyspKTtcbiAqICAgfSk7XG4gKiB9KTtcbiAqXG4gKiBjb25zdCByZXN1bHQxUHJvbWlzZSA9IG9uZUV4ZWNBdEFUaW1lKCk7IC8vIFN0YXJ0IGFuIGFzeW5jLCBhbmQgcmVzb2x2ZSB0byAxIGluIDIwMCBtcy5cbiAqIGNvbnN0IHJlc3VsdDJQcm9taXNlID0gb25lRXhlY0F0QVRpbWUoKTsgLy8gU2NoZWR1bGUgdGhlIG5leHQgYXN5bmMsIGFuZCByZXNvbHZlIHRvIDIgaW4gNDAwIG1zLlxuICogY29uc3QgcmVzdWx0M1Byb21pc2UgPSBvbmVFeGVjQXRBVGltZSgpOyAvLyBSZXVzZSBzY2hlZHVsZWQgcHJvbWlzZSBhbmQgcmVzb2x2ZSB0byAyIGluIDQwMCBtcy5cbiAqIGBgYFxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVBc3luY0NhbGw8VD4oYXN5bmNGdW46ICgpID0+IFByb21pc2U8VD4pOiAoKSA9PiBQcm9taXNlPFQ+IHtcbiAgbGV0IHNjaGVkdWxlZENhbGwgPSBudWxsO1xuICBsZXQgcGVuZGluZ0NhbGwgPSBudWxsO1xuICBjb25zdCBzdGFydEFzeW5jQ2FsbCA9ICgpID0+IHtcbiAgICBjb25zdCByZXN1bHRQcm9taXNlID0gYXN5bmNGdW4oKTtcbiAgICBwZW5kaW5nQ2FsbCA9IHJlc3VsdFByb21pc2UudGhlbihcbiAgICAgICgpID0+IHBlbmRpbmdDYWxsID0gbnVsbCxcbiAgICAgICgpID0+IHBlbmRpbmdDYWxsID0gbnVsbCxcbiAgICApO1xuICAgIHJldHVybiByZXN1bHRQcm9taXNlO1xuICB9O1xuICBjb25zdCBjYWxsTmV4dCA9ICgpID0+IHtcbiAgICBzY2hlZHVsZWRDYWxsID0gbnVsbDtcbiAgICByZXR1cm4gc3RhcnRBc3luY0NhbGwoKTtcbiAgfTtcbiAgY29uc3Qgc2NoZWR1bGVOZXh0Q2FsbCA9ICgpID0+IHtcbiAgICBpZiAoc2NoZWR1bGVkQ2FsbCA9PSBudWxsKSB7XG4gICAgICBpbnZhcmlhbnQocGVuZGluZ0NhbGwsICdwZW5kaW5nQ2FsbCBtdXN0IG5vdCBiZSBudWxsIScpO1xuICAgICAgc2NoZWR1bGVkQ2FsbCA9IHBlbmRpbmdDYWxsLnRoZW4oY2FsbE5leHQsIGNhbGxOZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHNjaGVkdWxlZENhbGw7XG4gIH07XG4gIHJldHVybiAoKSA9PiB7XG4gICAgaWYgKHBlbmRpbmdDYWxsID09IG51bGwpIHtcbiAgICAgIHJldHVybiBzdGFydEFzeW5jQ2FsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc2NoZWR1bGVOZXh0Q2FsbCgpO1xuICAgIH1cbiAgfTtcbn1cblxuY29uc3QgcHJvbWlzZXMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogUmV0dXJucyBhIHZhbHVlIGRlcml2ZWQgYXN5bmNocm9ub3VzbHkgZnJvbSBhbiBlbGVtZW50IGluIHRoZSBpdGVtcyBhcnJheS5cbiAgICogVGhlIHRlc3QgZnVuY3Rpb24gaXMgYXBwbGllZCBzZXF1ZW50aWFsbHkgdG8gZWFjaCBlbGVtZW50IGluIGl0ZW1zIHVudGlsXG4gICAqIG9uZSByZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgbm9uLW51bGwgdmFsdWUuIFdoZW4gdGhpcyBoYXBwZW5zLFxuICAgKiB0aGUgUHJvbWlzZSByZXR1cm5lZCBieSB0aGlzIG1ldGhvZCB3aWxsIHJlc29sdmUgdG8gdGhhdCBub24tbnVsbCB2YWx1ZS4gSWZcbiAgICogbm8gc3VjaCBQcm9taXNlIGlzIHByb2R1Y2VkLCB0aGVuIHRoZSBQcm9taXNlIHJldHVybmVkIGJ5IHRoaXMgZnVuY3Rpb25cbiAgICogd2lsbCByZXNvbHZlIHRvIG51bGwuXG4gICAqXG4gICAqIEBwYXJhbSBpdGVtcyBBcnJheSBvZiBlbGVtZW50cyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRlc3QsIG9uZSBhdCBhIHRpbWUuXG4gICAqIEBwYXJhbSB0ZXN0IFdpbGwgYmUgY2FsbGVkIHdpdGggZWFjaCBpdGVtIGFuZCBtdXN0IHJldHVybiBlaXRoZXI6XG4gICAqICAgICAoMSkgQSBcInRoZW5hYmxlXCIgKGkuZSwgYSBQcm9taXNlIG9yIHByb21pc2UtbGlrZSBvYmplY3QpIHRoYXQgcmVzb2x2ZXNcbiAgICogICAgICAgICB0byBhIGRlcml2ZWQgdmFsdWUgKHRoYXQgd2lsbCBiZSByZXR1cm5lZCkgb3IgbnVsbC5cbiAgICogICAgICgyKSBudWxsLlxuICAgKiAgICAgSW4gYm90aCBjYXNlcyB3aGVyZSBudWxsIGlzIHJldHVybmVkLCB0ZXN0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgbmV4dFxuICAgKiAgICAgaXRlbSBpbiB0aGUgYXJyYXkuXG4gICAqIEBwYXJhbSB0aGlzQXJnIFJlY2VpdmVyIHRoYXQgd2lsbCBiZSB1c2VkIHdoZW4gdGVzdCBpcyBjYWxsZWQuXG4gICAqIEByZXR1cm4gUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGFzeW5jaHJvbm91c2x5IGRlcml2ZWQgdmFsdWUgb3IgbnVsbC5cbiAgICovXG4gIGFzeW5jRmluZDxULCBVPihpdGVtczogQXJyYXk8VD4sIHRlc3Q6ICh0OiBUKSA9PiA/UHJvbWlzZTxVPiwgdGhpc0FyZz86IG1peGVkKTogUHJvbWlzZTw/VT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBDcmVhdGUgYSBsb2NhbCBjb3B5IG9mIGl0ZW1zIHRvIGRlZmVuZCBhZ2FpbnN0IHRoZSBjYWxsZXIgbW9kaWZ5aW5nIHRoZVxuICAgICAgLy8gYXJyYXkgYmVmb3JlIHRoaXMgUHJvbWlzZSBpcyByZXNvbHZlZC5cbiAgICAgIGl0ZW1zID0gaXRlbXMuc2xpY2UoKTtcbiAgICAgIGNvbnN0IG51bUl0ZW1zID0gaXRlbXMubGVuZ3RoO1xuXG4gICAgICBjb25zdCBuZXh0ID0gYXN5bmMgZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4ID09PSBudW1JdGVtcykge1xuICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2luZGV4XTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGVzdC5jYWxsKHRoaXNBcmcsIGl0ZW0pO1xuICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQoaW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbmV4dCgwKTtcbiAgICB9KTtcbiAgfSxcblxuICBkZW5vZGVpZnkoZjogKC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IGFueSk6ICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzOiBBcnJheTxhbnk+KSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBmdW5jdGlvbiBjYWxsYmFjayhlcnJvciwgcmVzdWx0KSB7XG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGYuYXBwbHkodGhpcywgYXJncy5jb25jYXQoW2NhbGxiYWNrXSkpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICogQSBQcm9taXNlIHV0aWxpdHkgdGhhdCBydW5zIGEgbWF4aW11bSBvZiBsaW1pdCBhc3luYyBvcGVyYXRpb25zIGF0IGEgdGltZSBpdGVyYXRpbmcgb3ZlciBhbiBhcnJheVxuICAgKiBhbmQgcmV0dXJuaW5nIHRoZSByZXN1bHQgb2YgZXhlY3V0aW9ucy5cbiAgICogZS5nLiB0byBsaW1pdCB0aGUgbnVtYmVyIG9mIGZpbGUgcmVhZHMgdG8gNSxcbiAgICogcmVwbGFjZSB0aGUgY29kZTpcbiAgICogICAgdmFyIGZpbGVDb250ZW50cyA9IGF3YWl0IFByb21pc2UuYWxsKGZpbGVQYXRocy5tYXAoZnNQcm9taXNlLnJlYWRGaWxlKSlcbiAgICogd2l0aDpcbiAgICogICAgdmFyIGZpbGVDb250ZW50cyA9IGF3YWl0IGFzeW5jTGltaXQoZmlsZVBhdGhzLCA1LCBmc1Byb21pc2UucmVhZEZpbGUpXG4gICAqXG4gICAqIFRoaXMgaXMgcGFydGljdWxyaWx5IHVzZWZ1bCB0byBsaW1pdCBJTyBvcGVyYXRpb25zIHRvIGEgY29uZmlndXJhYmxlIG1heGltdW0gKHRvIGF2b2lkIGJsb2NraW5nKSxcbiAgICogd2hpbGUgZW5qb3lpbmcgdGhlIGNvbmZpZ3VyZWQgbGV2ZWwgb2YgcGFyYWxsZWxpc20uXG4gICAqXG4gICAqIEBwYXJhbSBhcnJheSB0aGUgYXJyYXkgb2YgaXRlbXMgZm9yIGl0ZXJhdGlvbi5cbiAgICogQHBhcmFtIGxpbWl0IHRoZSBjb25maWd1cmFibGUgbnVtYmVyIG9mIHBhcmFsbGVsIGFzeW5jIG9wZXJhdGlvbnMuXG4gICAqIEBwYXJhbSBtYXBwaW5nRnVuY3Rpb24gdGhlIGFzeW5jIFByb21pc2UgZnVuY3Rpb24gdGhhdCBjb3VsZCByZXR1cm4gYSB1c2VmdWwgcmVzdWx0LlxuICAgKi9cbiAgYXN5bmNMaW1pdDxULCBWPihhcnJheTogQXJyYXk8VD4sIGxpbWl0OiBudW1iZXIsIG1hcHBpbmdGdW5jdGlvbjogKGl0ZW06IFQpID0+IFByb21pc2U8Vj4pOiBQcm9taXNlPEFycmF5PFY+PiB7XG4gICAgY29uc3QgcmVzdWx0OiBBcnJheTxWPiA9IG5ldyBBcnJheShhcnJheS5sZW5ndGgpO1xuICAgIGxldCBwYXJhbGxlbFByb21pc2VzID0gMDtcbiAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgY29uc3QgcGFyYWxsZWxMaW1pdCA9IE1hdGgubWluKGxpbWl0LCBhcnJheS5sZW5ndGgpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHJ1blByb21pc2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHBhcmFsbGVsUHJvbWlzZXMgPT09IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICsrcGFyYWxsZWxQcm9taXNlcztcbiAgICAgICAgY29uc3QgaSA9IGluZGV4Kys7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0W2ldID0gYXdhaXQgbWFwcGluZ0Z1bmN0aW9uKGFycmF5W2ldKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgICAtLXBhcmFsbGVsUHJvbWlzZXM7XG4gICAgICAgIHJ1blByb21pc2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHdoaWxlIChwYXJhbGxlbFByb21pc2VzIDwgcGFyYWxsZWxMaW1pdCkge1xuICAgICAgICBydW5Qcm9taXNlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGBmaWx0ZXJgIFByb21pc2UgdXRpbGl0eSB0aGF0IGFsbG93cyBmaWx0ZXJpbmcgYW4gYXJyYXkgd2l0aCBhbiBhc3luYyBQcm9taXNlIGZ1bmN0aW9uLlxuICAgKiBJdCdzIGFuIGFsdGVybmF0aXZlIHRvIGBBcnJheS5wcm90b3R5cGUuZmlsdGVyYCB0aGF0IGFjY2VwdHMgYW4gYXN5bmMgZnVuY3Rpb24uXG4gICAqIFlvdSBjYW4gb3B0aW9uYWxseSBjb25maWd1cmUgYSBsaW1pdCB0byBzZXQgdGhlIG1heGltdW0gbnVtYmVyIG9mIGFzeW5jIG9wZXJhdGlvbnMgYXQgYSB0aW1lLlxuICAgKlxuICAgKiBQcmV2aW91c2x5LCB3aXRoIHRoZSBgUHJvbWlzZS5hbGxgIHByaW1pdGl2ZSwgd2UgY2FuJ3Qgc2V0IHRoZSBwYXJhbGxlbGlzbSBsaW1pdCBhbmQgd2UgaGF2ZSB0b1xuICAgKiBgZmlsdGVyYCwgc28sIHdlIHJlcGxhY2UgdGhlIG9sZCBgZmlsdGVyYCBjb2RlOlxuICAgKiAgICAgdmFyIGV4aXN0aW5nRmlsZVBhdGhzID0gW107XG4gICAqICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlUGF0aHMubWFwKGFzeW5jIChmaWxlUGF0aCkgPT4ge1xuICAgKiAgICAgICBpZiAoYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhmaWxlUGF0aCkpIHtcbiAgICogICAgICAgICBleGlzdGluZ0ZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKTtcbiAgICogICAgICAgfVxuICAgKiAgICAgfSkpO1xuICAgKiB3aXRoIGxpbWl0IDUgcGFyYWxsZWwgZmlsZXN5c3RlbSBvcGVyYXRpb25zIGF0IGEgdGltZTpcbiAgICogICAgdmFyIGV4aXN0aW5nRmlsZVBhdGhzID0gYXdhaXQgYXN5bmNGaWx0ZXIoZmlsZVBhdGhzLCBmc1Byb21pc2UuZXhpc3RzLCA1KTtcbiAgICpcbiAgICogQHBhcmFtIGFycmF5IHRoZSBhcnJheSBvZiBpdGVtcyBmb3IgYGZpbHRlcmBpbmcuXG4gICAqIEBwYXJhbSBmaWx0ZXJGdW5jdGlvbiB0aGUgYXN5bmMgYGZpbHRlcmAgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgYm9vbGVhbi5cbiAgICogQHBhcmFtIGxpbWl0IHRoZSBjb25maWd1cmFibGUgbnVtYmVyIG9mIHBhcmFsbGVsIGFzeW5jIG9wZXJhdGlvbnMuXG4gICAqL1xuICBhc3luYyBhc3luY0ZpbHRlcjxUPihhcnJheTogQXJyYXk8VD4sIGZpbHRlckZ1bmN0aW9uOiAoaXRlbTogVCkgPT4gUHJvbWlzZTxib29sZWFuPiwgbGltaXQ/OiBudW1iZXIpOiBQcm9taXNlPEFycmF5PFQ+PiB7XG4gICAgY29uc3QgZmlsdGVyZWRMaXN0ID0gW107XG4gICAgYXdhaXQgcHJvbWlzZXMuYXN5bmNMaW1pdChhcnJheSwgbGltaXQgfHwgYXJyYXkubGVuZ3RoLCBhc3luYyAoaXRlbTogVCkgPT4ge1xuICAgICAgaWYgKGF3YWl0IGZpbHRlckZ1bmN0aW9uKGl0ZW0pKSB7XG4gICAgICAgIGZpbHRlcmVkTGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBmaWx0ZXJlZExpc3Q7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGBzb21lYCBQcm9taXNlIHV0aWxpdHkgdGhhdCBhbGxvd3MgYHNvbWVgIGFuIGFycmF5IHdpdGggYW4gYXN5bmMgUHJvbWlzZSBzb21lIGZ1bmN0aW9uLlxuICAgKiBJdCdzIGFuIGFsdGVybmF0aXZlIHRvIGBBcnJheS5wcm90b3R5cGUuc29tZWAgdGhhdCBhY2NlcHRzIGFuIGFzeW5jIHNvbWUgZnVuY3Rpb24uXG4gICAqIFlvdSBjYW4gb3B0aW9uYWxseSBjb25maWd1cmUgYSBsaW1pdCB0byBzZXQgdGhlIG1heGltdW0gbnVtYmVyIG9mIGFzeW5jIG9wZXJhdGlvbnMgYXQgYSB0aW1lLlxuICAgKlxuICAgKiBQcmV2aW91c2x5LCB3aXRoIHRoZSBQcm9taXNlLmFsbCBwcmltaXRpdmUsIHdlIGNhbid0IHNldCB0aGUgcGFyYWxsZWxpc20gbGltaXQgYW5kIHdlIGhhdmUgdG9cbiAgICogYHNvbWVgLCBzbywgd2UgcmVwbGFjZSB0aGUgb2xkIGBzb21lYCBjb2RlOlxuICAgKiAgICAgdmFyIHNvbWVGaWxlRXhpc3QgPSBmYWxzZTtcbiAgICogICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGVQYXRocy5tYXAoYXN5bmMgKGZpbGVQYXRoKSA9PiB7XG4gICAqICAgICAgIGlmIChhd2FpdCBmc1Byb21pc2UuZXhpc3RzKGZpbGVQYXRoKSkge1xuICAgKiAgICAgICAgIHNvbWVGaWxlRXhpc3QgPSB0cnVlO1xuICAgKiAgICAgICB9XG4gICAqICAgICB9KSk7XG4gICAqIHdpdGggbGltaXQgNSBwYXJhbGxlbCBmaWxlc3lzdGVtIG9wZXJhdGlvbnMgYXQgYSB0aW1lOlxuICAgKiAgICB2YXIgc29tZUZpbGVFeGlzdCA9IGF3YWl0IGFzeW5jU29tZShmaWxlUGF0aHMsIGZzUHJvbWlzZS5leGlzdHMsIDUpO1xuICAgKlxuICAgKiBAcGFyYW0gYXJyYXkgdGhlIGFycmF5IG9mIGl0ZW1zIGZvciBgc29tZWBpbmcuXG4gICAqIEBwYXJhbSBzb21lRnVuY3Rpb24gdGhlIGFzeW5jIGBzb21lYCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBib29sZWFuLlxuICAgKiBAcGFyYW0gbGltaXQgdGhlIGNvbmZpZ3VyYWJsZSBudW1iZXIgb2YgcGFyYWxsZWwgYXN5bmMgb3BlcmF0aW9ucy5cbiAgICovXG4gIGFzeW5jIGFzeW5jU29tZTxUPihhcnJheTogQXJyYXk8VD4sIHNvbWVGdW5jdGlvbjogKGl0ZW06IFQpID0+IFByb21pc2U8Ym9vbGVhbj4sIGxpbWl0PzogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgbGV0IHJlc29sdmVkID0gZmFsc2U7XG4gICAgYXdhaXQgcHJvbWlzZXMuYXN5bmNMaW1pdChhcnJheSwgbGltaXQgfHwgYXJyYXkubGVuZ3RoLCBhc3luYyAoaXRlbTogVCkgPT4ge1xuICAgICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gY2FsbCB0aGUgc29tZUZ1bmN0aW9uIGFueW1vcmUgb3Igd2FpdCBhbnkgbG9uZ2VyLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoYXdhaXQgc29tZUZ1bmN0aW9uKGl0ZW0pKSB7XG4gICAgICAgIHJlc29sdmVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gIH0sXG5cbiAgYXdhaXRNaWxsaVNlY29uZHMsXG5cbiAgUmVxdWVzdFNlcmlhbGl6ZXIsXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGFuIG9iamVjdCBpcyBQcm9taXNlIGJ5IHRlc3RpbmcgaWYgaXQgaGFzIGEgYHRoZW5gIGZ1bmN0aW9uIHByb3BlcnR5LlxuICAgKi9cbiAgaXNQcm9taXNlKG9iamVjdDogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKG9iamVjdCkgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSAnZnVuY3Rpb24nO1xuICB9LFxuXG4gIHJldHJ5TGltaXQsXG5cbiAgc2VyaWFsaXplQXN5bmNDYWxsLFxufTtcbiJdfQ==