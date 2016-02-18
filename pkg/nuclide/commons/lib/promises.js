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
//# sourceMappingURL=data:application/json;base64,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QUksQ0FBQztPQUNqQjtLQUNGLEVBQUMsQ0FBQztBQUNILFdBQU8sUUFBUSxDQUFDO0dBQ2pCLENBQUE7O0FBRUQsbUJBQWlCLEVBQWpCLGlCQUFpQjs7QUFFakIsbUJBQWlCLEVBQWpCLGlCQUFpQjs7Ozs7QUFLakIsV0FBUyxFQUFBLG1CQUFDLE1BQVcsRUFBVztBQUM5QixXQUFPLENBQUMsQ0FBRSxNQUFNLEFBQUMsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztHQUN0Rjs7QUFFRCxZQUFVLEVBQVYsVUFBVTs7QUFFVixvQkFBa0IsRUFBbEIsa0JBQWtCO0NBQ25CLENBQUMiLCJmaWxlIjoicHJvbWlzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbnR5cGUgUnVuUmV0dXJuPFQ+ID0ge1xuICBzdGF0dXM6ICdzdWNjZXNzJyxcbiAgcmVzdWx0OiBULFxufSB8IHtcbiAgc3RhdHVzOiAnb3V0ZGF0ZWQnLFxufTtcblxuLyoqXG4gKiBBbGxvd3MgYSBjYWxsZXIgdG8gZW5zdXJlIHRoYXQgdGhlIHJlc3VsdHMgaXQgcmVjZWl2ZXMgZnJvbSBjb25zZWN1dGl2ZVxuICogcHJvbWlzZSByZXNvbHV0aW9ucyBhcmUgbmV2ZXIgb3V0ZGF0ZWQuIFVzYWdlOlxuICpcbiAqIHZhciByZXF1ZXN0U2VyaWFsaXplciA9IG5ldyBSZXF1ZXN0U2VyaWFsaXplcigpO1xuICpcbiAqIC8vIGluIHNvbWUgbGF0ZXIgbG9vcDpcbiAqXG4gKiAvLyBub3RlIHRoYXQgeW91IGRvIG5vdCBhd2FpdCB0aGUgYXN5bmMgZnVuY3Rpb24gaGVyZSAtLSB5b3UgbXVzdCBwYXNzIHRoZVxuICogLy8gcHJvbWlzZSBpdCByZXR1cm5zIHRvIGBydW5gXG4gKiB2YXIgcmVzdWx0ID0gYXdhaXQgcmVxdWVzdFNlcmlhbGl6ZXIucnVuKHNvbWVBc3luY0Z1bmN0aW9uKCkpXG4gKlxuICogaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICogICAuLi4uXG4gKiAgIHJlc3VsdC5yZXN1bHRcbiAqIH0gZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ291dGRhdGVkJykge1xuICogICAuLi4uXG4gKiB9XG4gKlxuICogVGhlIGNvbnRyYWN0IGlzIHRoYXQgdGhlIHN0YXR1cyBpcyAnc3VjY2VzcycgaWYgYW5kIG9ubHkgaWYgdGhpcyB3YXMgdGhlIG1vc3RcbiAqIHJlY2VudGx5IGRpc3BhdGNoZWQgY2FsbCBvZiAncnVuJy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBjYWxsIHJ1bihwcm9taXNlMSkgYW5kXG4gKiB0aGVuIHJ1bihwcm9taXNlMiksIGFuZCBwcm9taXNlMiByZXNvbHZlcyBmaXJzdCwgdGhlIHNlY29uZCBjYWxsc2l0ZSB3b3VsZFxuICogcmVjZWl2ZSBhICdzdWNjZXNzJyBzdGF0dXMuIElmIHByb21pc2UxIGxhdGVyIHJlc29sdmVkLCB0aGUgZmlyc3QgY2FsbHNpdGVcbiAqIHdvdWxkIHJlY2VpdmUgYW4gJ291dGRhdGVkJyBzdGF0dXMuXG4gKi9cbmNsYXNzIFJlcXVlc3RTZXJpYWxpemVyPFQ+IHtcbiAgX2xhc3REaXNwYXRjaGVkT3A6IG51bWJlcjtcbiAgX2xhc3RGaW5pc2hlZE9wOiBudW1iZXI7XG4gIF9sYXRlc3RQcm9taXNlOiBQcm9taXNlPFQ+O1xuICBfd2FpdFJlc29sdmU6IEZ1bmN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2xhc3REaXNwYXRjaGVkT3AgPSAwO1xuICAgIHRoaXMuX2xhc3RGaW5pc2hlZE9wID0gMDtcbiAgICB0aGlzLl9sYXRlc3RQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fd2FpdFJlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgcnVuKHByb21pc2U6IFByb21pc2U8VD4pOiBQcm9taXNlPFJ1blJldHVybjxUPj4ge1xuICAgIGNvbnN0IHRoaXNPcCA9IHRoaXMuX2xhc3REaXNwYXRjaGVkT3AgKyAxO1xuICAgIHRoaXMuX2xhc3REaXNwYXRjaGVkT3AgPSB0aGlzT3A7XG4gICAgdGhpcy5fbGF0ZXN0UHJvbWlzZSA9IHByb21pc2U7XG4gICAgdGhpcy5fd2FpdFJlc29sdmUoKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwcm9taXNlO1xuICAgIGlmICh0aGlzLl9sYXN0RmluaXNoZWRPcCA8IHRoaXNPcCkge1xuICAgICAgdGhpcy5fbGFzdEZpbmlzaGVkT3AgPSB0aGlzT3A7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXM6ICdzdWNjZXNzJyxcbiAgICAgICAgcmVzdWx0LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzOiAnb3V0ZGF0ZWQnLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgbGFzdCByZXN1bHQgb2YgYHJ1bmAsXG4gICAqIGFzIHNvb24gYXMgdGhlcmUgYXJlIG5vIG1vcmUgb3V0c3RhbmRpbmcgYHJ1bmAgY2FsbHMuXG4gICAqL1xuICBhc3luYyB3YWl0Rm9yTGF0ZXN0UmVzdWx0KCk6IFByb21pc2U8VD4ge1xuICAgIGxldCBsYXN0UHJvbWlzZSA9IG51bGw7XG4gICAgbGV0IHJlc3VsdDogYW55ID0gbnVsbDtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgd2hpbGUgKGxhc3RQcm9taXNlICE9PSB0aGlzLl9sYXRlc3RQcm9taXNlKSB7XG4gICAgICBsYXN0UHJvbWlzZSA9IHRoaXMuX2xhdGVzdFByb21pc2U7XG4gICAgICAvLyBXYWl0IGZvciB0aGUgY3VycmVudCBsYXN0IGtub3cgcHJvbWlzZSB0byByZXNvbHZlLCBvciBhIG5leHQgcnVuIGhhdmUgc3RhcnRlZC5cbiAgICAgIHJlc3VsdCA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdGhpcy5fd2FpdFJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICB0aGlzLl9sYXRlc3RQcm9taXNlLnRoZW4ocmVzb2x2ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgcmV0dXJuIChyZXN1bHQ6IFQpO1xuICB9XG5cbiAgaXNSdW5JblByb2dyZXNzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9sYXN0RGlzcGF0Y2hlZE9wID4gdGhpcy5fbGFzdEZpbmlzaGVkT3A7XG4gIH1cbn1cblxuLypcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIGFmdGVyIGBtaWxsaVNlY29uZHNgIG1pbGxpIHNlY29uZHMuXG4gKiB0aGlzIGNhbiBiZSB1c2VkIHRvIHBhdXNlIGV4ZWN1dGlvbiBhc3luY2hyb25vdXNseS5cbiAqIGUuZy4gYXdhaXQgYXdhaXRNaWxsaVNlY29uZHMoMTAwMCksIHBhdXNlcyB0aGUgYXN5bmMgZmxvdyBleGVjdXRpb24gZm9yIDEgc2Vjb25kLlxuICovXG5mdW5jdGlvbiBhd2FpdE1pbGxpU2Vjb25kcyhtaWxsaVNlY29uZHM6IG51bWJlcik6IFByb21pc2Uge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgbWlsbGlTZWNvbmRzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogQ2FsbCBhbiBhc3luYyBmdW5jdGlvbiByZXBlYXRlZGx5IHdpdGggYSBtYXhpbXVtIG51bWJlciBvZiB0cmlhbHMgbGltaXQsXG4gKiB1bnRpbCBhIHZhbGlkIHJlc3VsdCB0aGF0J3MgZGVmaW5lZCBieSBhIHZhbGlkYXRpb24gZnVuY3Rpb24uXG4gKiBBIGZhaWxlZCBjYWxsIGNhbiByZXN1bHQgZnJvbSBhbiBhc3luYyB0aHJvd24gZXhjZXB0aW9uLCBvciBpbnZhbGlkIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0gYHJldHJ5RnVuY3Rpb25gIHRoZSBhc3luYyBsb2dpYyB0aGF0J3Mgd2FudGVkIHRvIGJlIHJldHJpZWQuXG4gKiBAcGFyYW0gYHZhbGlkYXRpb25GdW5jdGlvbmAgdGhlIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhhdCBkZWNpZGVzIHdoZXRoZXIgYSByZXNwb25zZSBpcyB2YWxpZC5cbiAqIEBwYXJhbSBgbWF4aW11bVRyaWVzYCB0aGUgbnVtYmVyIG9mIHRpbWVzIHRoZSBgcmV0cnlGdW5jdGlvbmAgY2FuIGZhaWwgdG8gZ2V0IGEgdmFsaWRcbiAqIHJlc3BvbnNlIGJlZm9yZSB0aGUgYHJldHJ5TGltaXRgIGlzIHRlcm1pbmF0ZWQgcmVwb3J0aW5nIGFuIGVycm9yLlxuICogQHBhcmFtIGByZXRyeUludGVydmFsTXNgIG9wdGlvbmFsLCB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJldHdlZW4gdHJpYWxzLCBpZiB3YW50ZWQuXG4gKlxuICogSWYgYW4gZXhjZXB0aW9uIGlzIGVuY291bnRlcmVkIG9uIHRoZSBsYXN0IHRyaWFsLCB0aGUgZXhjZXB0aW9uIGlzIHRocm93bi5cbiAqIElmIG5vIHZhbGlkIHJlc3BvbnNlIGlzIGZvdW5kLCBhbiBleGNlcHRpb24gaXMgdGhyb3duLlxuICovXG5hc3luYyBmdW5jdGlvbiByZXRyeUxpbWl0PFQ+KFxuICByZXRyeUZ1bmN0aW9uOiAoKSA9PiBQcm9taXNlPFQ+LFxuICB2YWxpZGF0aW9uRnVuY3Rpb246IChyZXN1bHQ6IFQpID0+IGJvb2xlYW4sXG4gIG1heGltdW1UcmllczogbnVtYmVyLFxuICByZXRyeUludGVydmFsTXM/OiBudW1iZXIgPSAwLFxuKTogUHJvbWlzZTxUPiB7XG4gIGxldCByZXN1bHQgPSBudWxsO1xuICBsZXQgdHJpZXMgPSAwO1xuICBsZXQgbGFzdEVycm9yID0gbnVsbDtcbiAgLyogZXNsaW50LWRpc2FibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICB3aGlsZSAodHJpZXMgPT09IDAgfHwgdHJpZXMgPCBtYXhpbXVtVHJpZXMpIHtcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gYXdhaXQgcmV0cnlGdW5jdGlvbigpO1xuICAgICAgbGFzdEVycm9yID0gbnVsbDtcbiAgICAgIGlmICh2YWxpZGF0aW9uRnVuY3Rpb24ocmVzdWx0KSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsYXN0RXJyb3IgPSBlcnJvcjtcbiAgICAgIHJlc3VsdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCsrdHJpZXMgPCBtYXhpbXVtVHJpZXMgJiYgcmV0cnlJbnRlcnZhbE1zICE9PSAwKSB7XG4gICAgICBhd2FpdCBhd2FpdE1pbGxpU2Vjb25kcyhyZXRyeUludGVydmFsTXMpO1xuICAgIH1cbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgaWYgKGxhc3RFcnJvciAhPSBudWxsKSB7XG4gICAgdGhyb3cgbGFzdEVycm9yO1xuICB9IGVsc2UgaWYgKHRyaWVzID09PSBtYXhpbXVtVHJpZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHZhbGlkIHJlc3BvbnNlIGZvdW5kIScpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAoKHJlc3VsdDogYW55KTogVCk7XG4gIH1cbn1cblxuLyoqXG4gKiBMaW1pdHMgYXN5bmMgZnVuY3Rpb24gZXhlY3V0aW9uIHBhcmFsbGVsaXNtIHRvIG9ubHkgb25lIGF0IGEgdGltZS5cbiAqIEhlbmNlLCBpZiBhIGNhbGwgaXMgYWxyZWFkeSBydW5uaW5nLCBpdCB3aWxsIHdhaXQgZm9yIGl0IHRvIGZpbmlzaCxcbiAqIHRoZW4gc3RhcnQgdGhlIG5leHQgYXN5bmMgZXhlY3V0aW9uLCBidXQgaWYgY2FsbGVkIGFnYWluIHdoaWxlIG5vdCBmaW5pc2hlZCxcbiAqIGl0IHdpbGwgcmV0dXJuIHRoZSBzY2hlZHVsZWQgZXhlY3V0aW9uIHByb21pc2UuXG4gKlxuICogU2FtcGxlIFVzYWdlOlxuICogYGBgXG4gKiBsZXQgaSA9IDE7XG4gKiBjb25zdCBvbmVFeGVjQXRBVGltZSA9IG9uZVBhcmFsbGVsQXN5bmNDYWxsKCgpID0+IHtcbiAqICAgcmV0dXJuIG5leHQgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gKiAgICAgc2V0VGltZW91dCgyMDAsICgpID0+IHJlc29sdmUoaSsrKSk7XG4gKiAgIH0pO1xuICogfSk7XG4gKlxuICogY29uc3QgcmVzdWx0MVByb21pc2UgPSBvbmVFeGVjQXRBVGltZSgpOyAvLyBTdGFydCBhbiBhc3luYywgYW5kIHJlc29sdmUgdG8gMSBpbiAyMDAgbXMuXG4gKiBjb25zdCByZXN1bHQyUHJvbWlzZSA9IG9uZUV4ZWNBdEFUaW1lKCk7IC8vIFNjaGVkdWxlIHRoZSBuZXh0IGFzeW5jLCBhbmQgcmVzb2x2ZSB0byAyIGluIDQwMCBtcy5cbiAqIGNvbnN0IHJlc3VsdDNQcm9taXNlID0gb25lRXhlY0F0QVRpbWUoKTsgLy8gUmV1c2Ugc2NoZWR1bGVkIHByb21pc2UgYW5kIHJlc29sdmUgdG8gMiBpbiA0MDAgbXMuXG4gKiBgYGBcbiAqL1xuZnVuY3Rpb24gc2VyaWFsaXplQXN5bmNDYWxsPFQ+KGFzeW5jRnVuOiAoKSA9PiBQcm9taXNlPFQ+KTogKCkgPT4gUHJvbWlzZTxUPiB7XG4gIGxldCBzY2hlZHVsZWRDYWxsID0gbnVsbDtcbiAgbGV0IHBlbmRpbmdDYWxsID0gbnVsbDtcbiAgY29uc3Qgc3RhcnRBc3luY0NhbGwgPSAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0UHJvbWlzZSA9IGFzeW5jRnVuKCk7XG4gICAgcGVuZGluZ0NhbGwgPSByZXN1bHRQcm9taXNlLnRoZW4oXG4gICAgICAoKSA9PiBwZW5kaW5nQ2FsbCA9IG51bGwsXG4gICAgICAoKSA9PiBwZW5kaW5nQ2FsbCA9IG51bGwsXG4gICAgKTtcbiAgICByZXR1cm4gcmVzdWx0UHJvbWlzZTtcbiAgfTtcbiAgY29uc3QgY2FsbE5leHQgPSAoKSA9PiB7XG4gICAgc2NoZWR1bGVkQ2FsbCA9IG51bGw7XG4gICAgcmV0dXJuIHN0YXJ0QXN5bmNDYWxsKCk7XG4gIH07XG4gIGNvbnN0IHNjaGVkdWxlTmV4dENhbGwgPSAoKSA9PiB7XG4gICAgaWYgKHNjaGVkdWxlZENhbGwgPT0gbnVsbCkge1xuICAgICAgaW52YXJpYW50KHBlbmRpbmdDYWxsLCAncGVuZGluZ0NhbGwgbXVzdCBub3QgYmUgbnVsbCEnKTtcbiAgICAgIHNjaGVkdWxlZENhbGwgPSBwZW5kaW5nQ2FsbC50aGVuKGNhbGxOZXh0LCBjYWxsTmV4dCk7XG4gICAgfVxuICAgIHJldHVybiBzY2hlZHVsZWRDYWxsO1xuICB9O1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmIChwZW5kaW5nQ2FsbCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3RhcnRBc3luY0NhbGwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNjaGVkdWxlTmV4dENhbGwoKTtcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHByb21pc2VzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB2YWx1ZSBkZXJpdmVkIGFzeW5jaHJvbm91c2x5IGZyb20gYW4gZWxlbWVudCBpbiB0aGUgaXRlbXMgYXJyYXkuXG4gICAqIFRoZSB0ZXN0IGZ1bmN0aW9uIGlzIGFwcGxpZWQgc2VxdWVudGlhbGx5IHRvIGVhY2ggZWxlbWVudCBpbiBpdGVtcyB1bnRpbFxuICAgKiBvbmUgcmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIG5vbi1udWxsIHZhbHVlLiBXaGVuIHRoaXMgaGFwcGVucyxcbiAgICogdGhlIFByb21pc2UgcmV0dXJuZWQgYnkgdGhpcyBtZXRob2Qgd2lsbCByZXNvbHZlIHRvIHRoYXQgbm9uLW51bGwgdmFsdWUuIElmXG4gICAqIG5vIHN1Y2ggUHJvbWlzZSBpcyBwcm9kdWNlZCwgdGhlbiB0aGUgUHJvbWlzZSByZXR1cm5lZCBieSB0aGlzIGZ1bmN0aW9uXG4gICAqIHdpbGwgcmVzb2x2ZSB0byBudWxsLlxuICAgKlxuICAgKiBAcGFyYW0gaXRlbXMgQXJyYXkgb2YgZWxlbWVudHMgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byB0ZXN0LCBvbmUgYXQgYSB0aW1lLlxuICAgKiBAcGFyYW0gdGVzdCBXaWxsIGJlIGNhbGxlZCB3aXRoIGVhY2ggaXRlbSBhbmQgbXVzdCByZXR1cm4gZWl0aGVyOlxuICAgKiAgICAgKDEpIEEgXCJ0aGVuYWJsZVwiIChpLmUsIGEgUHJvbWlzZSBvciBwcm9taXNlLWxpa2Ugb2JqZWN0KSB0aGF0IHJlc29sdmVzXG4gICAqICAgICAgICAgdG8gYSBkZXJpdmVkIHZhbHVlICh0aGF0IHdpbGwgYmUgcmV0dXJuZWQpIG9yIG51bGwuXG4gICAqICAgICAoMikgbnVsbC5cbiAgICogICAgIEluIGJvdGggY2FzZXMgd2hlcmUgbnVsbCBpcyByZXR1cm5lZCwgdGVzdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIG5leHRcbiAgICogICAgIGl0ZW0gaW4gdGhlIGFycmF5LlxuICAgKiBAcGFyYW0gdGhpc0FyZyBSZWNlaXZlciB0aGF0IHdpbGwgYmUgdXNlZCB3aGVuIHRlc3QgaXMgY2FsbGVkLlxuICAgKiBAcmV0dXJuIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBhc3luY2hyb25vdXNseSBkZXJpdmVkIHZhbHVlIG9yIG51bGwuXG4gICAqL1xuICBhc3luY0ZpbmQ8VCwgVT4oaXRlbXM6IEFycmF5PFQ+LCB0ZXN0OiAodDogVCkgPT4gP1Byb21pc2U8VT4sIHRoaXNBcmc/OiBtaXhlZCk6IFByb21pc2U8P1U+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gQ3JlYXRlIGEgbG9jYWwgY29weSBvZiBpdGVtcyB0byBkZWZlbmQgYWdhaW5zdCB0aGUgY2FsbGVyIG1vZGlmeWluZyB0aGVcbiAgICAgIC8vIGFycmF5IGJlZm9yZSB0aGlzIFByb21pc2UgaXMgcmVzb2x2ZWQuXG4gICAgICBpdGVtcyA9IGl0ZW1zLnNsaWNlKCk7XG4gICAgICBjb25zdCBudW1JdGVtcyA9IGl0ZW1zLmxlbmd0aDtcblxuICAgICAgY29uc3QgbmV4dCA9IGFzeW5jIGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gbnVtSXRlbXMpIHtcbiAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpbmRleF07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRlc3QuY2FsbCh0aGlzQXJnLCBpdGVtKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0KGluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIG5leHQoMCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZGVub2RlaWZ5KGY6ICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiBhbnkpOiAoLi4uYXJnczogQXJyYXk8YW55PikgPT4gUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJnczogQXJyYXk8YW55Pikge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyb3IsIHJlc3VsdCkge1xuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmLmFwcGx5KHRoaXMsIGFyZ3MuY29uY2F0KFtjYWxsYmFja10pKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgLyoqXG4gICAqIEEgUHJvbWlzZSB1dGlsaXR5IHRoYXQgcnVucyBhIG1heGltdW0gb2YgbGltaXQgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUgaXRlcmF0aW5nIG92ZXIgYW5cbiAgICogYXJyYXkgYW5kIHJldHVybmluZyB0aGUgcmVzdWx0IG9mIGV4ZWN1dGlvbnMuXG4gICAqIGUuZy4gdG8gbGltaXQgdGhlIG51bWJlciBvZiBmaWxlIHJlYWRzIHRvIDUsXG4gICAqIHJlcGxhY2UgdGhlIGNvZGU6XG4gICAqICAgIHZhciBmaWxlQ29udGVudHMgPSBhd2FpdCBQcm9taXNlLmFsbChmaWxlUGF0aHMubWFwKGZzUHJvbWlzZS5yZWFkRmlsZSkpXG4gICAqIHdpdGg6XG4gICAqICAgIHZhciBmaWxlQ29udGVudHMgPSBhd2FpdCBhc3luY0xpbWl0KGZpbGVQYXRocywgNSwgZnNQcm9taXNlLnJlYWRGaWxlKVxuICAgKlxuICAgKiBUaGlzIGlzIHBhcnRpY3VscmlseSB1c2VmdWwgdG8gbGltaXQgSU8gb3BlcmF0aW9ucyB0byBhIGNvbmZpZ3VyYWJsZSBtYXhpbXVtICh0byBhdm9pZFxuICAgKiBibG9ja2luZyksIHdoaWxlIGVuam95aW5nIHRoZSBjb25maWd1cmVkIGxldmVsIG9mIHBhcmFsbGVsaXNtLlxuICAgKlxuICAgKiBAcGFyYW0gYXJyYXkgdGhlIGFycmF5IG9mIGl0ZW1zIGZvciBpdGVyYXRpb24uXG4gICAqIEBwYXJhbSBsaW1pdCB0aGUgY29uZmlndXJhYmxlIG51bWJlciBvZiBwYXJhbGxlbCBhc3luYyBvcGVyYXRpb25zLlxuICAgKiBAcGFyYW0gbWFwcGluZ0Z1bmN0aW9uIHRoZSBhc3luYyBQcm9taXNlIGZ1bmN0aW9uIHRoYXQgY291bGQgcmV0dXJuIGEgdXNlZnVsIHJlc3VsdC5cbiAgICovXG4gIGFzeW5jTGltaXQ8VCwgVj4oXG4gICAgYXJyYXk6IEFycmF5PFQ+LFxuICAgIGxpbWl0OiBudW1iZXIsXG4gICAgbWFwcGluZ0Z1bmN0aW9uOiAoaXRlbTogVCkgPT4gUHJvbWlzZTxWPlxuICApOiBQcm9taXNlPEFycmF5PFY+PiB7XG4gICAgY29uc3QgcmVzdWx0OiBBcnJheTxWPiA9IG5ldyBBcnJheShhcnJheS5sZW5ndGgpO1xuICAgIGxldCBwYXJhbGxlbFByb21pc2VzID0gMDtcbiAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgY29uc3QgcGFyYWxsZWxMaW1pdCA9IE1hdGgubWluKGxpbWl0LCBhcnJheS5sZW5ndGgpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHJ1blByb21pc2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHBhcmFsbGVsUHJvbWlzZXMgPT09IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICsrcGFyYWxsZWxQcm9taXNlcztcbiAgICAgICAgY29uc3QgaSA9IGluZGV4Kys7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0W2ldID0gYXdhaXQgbWFwcGluZ0Z1bmN0aW9uKGFycmF5W2ldKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgICAtLXBhcmFsbGVsUHJvbWlzZXM7XG4gICAgICAgIHJ1blByb21pc2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHdoaWxlIChwYXJhbGxlbFByb21pc2VzIDwgcGFyYWxsZWxMaW1pdCkge1xuICAgICAgICBydW5Qcm9taXNlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGBmaWx0ZXJgIFByb21pc2UgdXRpbGl0eSB0aGF0IGFsbG93cyBmaWx0ZXJpbmcgYW4gYXJyYXkgd2l0aCBhbiBhc3luYyBQcm9taXNlIGZ1bmN0aW9uLlxuICAgKiBJdCdzIGFuIGFsdGVybmF0aXZlIHRvIGBBcnJheS5wcm90b3R5cGUuZmlsdGVyYCB0aGF0IGFjY2VwdHMgYW4gYXN5bmMgZnVuY3Rpb24uXG4gICAqIFlvdSBjYW4gb3B0aW9uYWxseSBjb25maWd1cmUgYSBsaW1pdCB0byBzZXQgdGhlIG1heGltdW0gbnVtYmVyIG9mIGFzeW5jIG9wZXJhdGlvbnMgYXQgYSB0aW1lLlxuICAgKlxuICAgKiBQcmV2aW91c2x5LCB3aXRoIHRoZSBgUHJvbWlzZS5hbGxgIHByaW1pdGl2ZSwgd2UgY2FuJ3Qgc2V0IHRoZSBwYXJhbGxlbGlzbSBsaW1pdCBhbmQgd2UgaGF2ZSB0b1xuICAgKiBgZmlsdGVyYCwgc28sIHdlIHJlcGxhY2UgdGhlIG9sZCBgZmlsdGVyYCBjb2RlOlxuICAgKiAgICAgdmFyIGV4aXN0aW5nRmlsZVBhdGhzID0gW107XG4gICAqICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlUGF0aHMubWFwKGFzeW5jIChmaWxlUGF0aCkgPT4ge1xuICAgKiAgICAgICBpZiAoYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhmaWxlUGF0aCkpIHtcbiAgICogICAgICAgICBleGlzdGluZ0ZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKTtcbiAgICogICAgICAgfVxuICAgKiAgICAgfSkpO1xuICAgKiB3aXRoIGxpbWl0IDUgcGFyYWxsZWwgZmlsZXN5c3RlbSBvcGVyYXRpb25zIGF0IGEgdGltZTpcbiAgICogICAgdmFyIGV4aXN0aW5nRmlsZVBhdGhzID0gYXdhaXQgYXN5bmNGaWx0ZXIoZmlsZVBhdGhzLCBmc1Byb21pc2UuZXhpc3RzLCA1KTtcbiAgICpcbiAgICogQHBhcmFtIGFycmF5IHRoZSBhcnJheSBvZiBpdGVtcyBmb3IgYGZpbHRlcmBpbmcuXG4gICAqIEBwYXJhbSBmaWx0ZXJGdW5jdGlvbiB0aGUgYXN5bmMgYGZpbHRlcmAgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFcbiAgICogICBib29sZWFuLlxuICAgKiBAcGFyYW0gbGltaXQgdGhlIGNvbmZpZ3VyYWJsZSBudW1iZXIgb2YgcGFyYWxsZWwgYXN5bmMgb3BlcmF0aW9ucy5cbiAgICovXG4gIGFzeW5jIGFzeW5jRmlsdGVyPFQ+KFxuICAgIGFycmF5OiBBcnJheTxUPixcbiAgICBmaWx0ZXJGdW5jdGlvbjogKGl0ZW06IFQpID0+IFByb21pc2U8Ym9vbGVhbj4sXG4gICAgbGltaXQ/OiBudW1iZXJcbiAgKTogUHJvbWlzZTxBcnJheTxUPj4ge1xuICAgIGNvbnN0IGZpbHRlcmVkTGlzdCA9IFtdO1xuICAgIGF3YWl0IHByb21pc2VzLmFzeW5jTGltaXQoYXJyYXksIGxpbWl0IHx8IGFycmF5Lmxlbmd0aCwgYXN5bmMgKGl0ZW06IFQpID0+IHtcbiAgICAgIGlmIChhd2FpdCBmaWx0ZXJGdW5jdGlvbihpdGVtKSkge1xuICAgICAgICBmaWx0ZXJlZExpc3QucHVzaChpdGVtKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZmlsdGVyZWRMaXN0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBgc29tZWAgUHJvbWlzZSB1dGlsaXR5IHRoYXQgYWxsb3dzIGBzb21lYCBhbiBhcnJheSB3aXRoIGFuIGFzeW5jIFByb21pc2Ugc29tZSBmdW5jdGlvbi5cbiAgICogSXQncyBhbiBhbHRlcm5hdGl2ZSB0byBgQXJyYXkucHJvdG90eXBlLnNvbWVgIHRoYXQgYWNjZXB0cyBhbiBhc3luYyBzb21lIGZ1bmN0aW9uLlxuICAgKiBZb3UgY2FuIG9wdGlvbmFsbHkgY29uZmlndXJlIGEgbGltaXQgdG8gc2V0IHRoZSBtYXhpbXVtIG51bWJlciBvZiBhc3luYyBvcGVyYXRpb25zIGF0IGEgdGltZS5cbiAgICpcbiAgICogUHJldmlvdXNseSwgd2l0aCB0aGUgUHJvbWlzZS5hbGwgcHJpbWl0aXZlLCB3ZSBjYW4ndCBzZXQgdGhlIHBhcmFsbGVsaXNtIGxpbWl0IGFuZCB3ZSBoYXZlIHRvXG4gICAqIGBzb21lYCwgc28sIHdlIHJlcGxhY2UgdGhlIG9sZCBgc29tZWAgY29kZTpcbiAgICogICAgIHZhciBzb21lRmlsZUV4aXN0ID0gZmFsc2U7XG4gICAqICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlUGF0aHMubWFwKGFzeW5jIChmaWxlUGF0aCkgPT4ge1xuICAgKiAgICAgICBpZiAoYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhmaWxlUGF0aCkpIHtcbiAgICogICAgICAgICBzb21lRmlsZUV4aXN0ID0gdHJ1ZTtcbiAgICogICAgICAgfVxuICAgKiAgICAgfSkpO1xuICAgKiB3aXRoIGxpbWl0IDUgcGFyYWxsZWwgZmlsZXN5c3RlbSBvcGVyYXRpb25zIGF0IGEgdGltZTpcbiAgICogICAgdmFyIHNvbWVGaWxlRXhpc3QgPSBhd2FpdCBhc3luY1NvbWUoZmlsZVBhdGhzLCBmc1Byb21pc2UuZXhpc3RzLCA1KTtcbiAgICpcbiAgICogQHBhcmFtIGFycmF5IHRoZSBhcnJheSBvZiBpdGVtcyBmb3IgYHNvbWVgaW5nLlxuICAgKiBAcGFyYW0gc29tZUZ1bmN0aW9uIHRoZSBhc3luYyBgc29tZWAgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFcbiAgICogICBib29sZWFuLlxuICAgKiBAcGFyYW0gbGltaXQgdGhlIGNvbmZpZ3VyYWJsZSBudW1iZXIgb2YgcGFyYWxsZWwgYXN5bmMgb3BlcmF0aW9ucy5cbiAgICovXG4gIGFzeW5jIGFzeW5jU29tZTxUPihcbiAgICBhcnJheTogQXJyYXk8VD4sXG4gICAgc29tZUZ1bmN0aW9uOiAoaXRlbTogVCkgPT4gUHJvbWlzZTxib29sZWFuPixcbiAgICBsaW1pdD86IG51bWJlclxuICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBsZXQgcmVzb2x2ZWQgPSBmYWxzZTtcbiAgICBhd2FpdCBwcm9taXNlcy5hc3luY0xpbWl0KGFycmF5LCBsaW1pdCB8fCBhcnJheS5sZW5ndGgsIGFzeW5jIChpdGVtOiBUKSA9PiB7XG4gICAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBjYWxsIHRoZSBzb21lRnVuY3Rpb24gYW55bW9yZSBvciB3YWl0IGFueSBsb25nZXIuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChhd2FpdCBzb21lRnVuY3Rpb24oaXRlbSkpIHtcbiAgICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXNvbHZlZDtcbiAgfSxcblxuICBhd2FpdE1pbGxpU2Vjb25kcyxcblxuICBSZXF1ZXN0U2VyaWFsaXplcixcblxuICAvKipcbiAgICogQ2hlY2sgaWYgYW4gb2JqZWN0IGlzIFByb21pc2UgYnkgdGVzdGluZyBpZiBpdCBoYXMgYSBgdGhlbmAgZnVuY3Rpb24gcHJvcGVydHkuXG4gICAqL1xuICBpc1Byb21pc2Uob2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEob2JqZWN0KSAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09ICdmdW5jdGlvbic7XG4gIH0sXG5cbiAgcmV0cnlMaW1pdCxcblxuICBzZXJpYWxpemVBc3luY0NhbGwsXG59O1xuIl19