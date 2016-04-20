

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Verifies that a Promise fails with an Error with specific expectations. When
 * running a test where a Promise is expected to fail, it is important to verify
 * that it failed in the expected way to avoid false positives in test results.
 *
 * This function should be used with `await` inside `waitsForPromise()`.
 *
 * @param promise will be awaited. It is expected to reject. If it does not
 *     reject, then this function will return a rejected Promise.
 * @param verify should confirm expectations about the Error produced by the
 *     rejection of `promise`. If these expectations are not met, then
 *     `verify()` must throw an exception.
 */

/**
 * Logs an observable to the console.
 * Useful for debugging observable code.
 * Usage:
 *     observable = observable.do(loggingObserver('My Prefix'));
 */

var expectAsyncFailure = _asyncToGenerator(function* (promise, verify) {
  try {
    yield promise;
    return Promise.reject('Promise should have failed, but did not.');
  } catch (e) {
    verify(e);
  }
}

/**
  * This is useful for mocking a module that the module under test requires.
  * After setting up the mocks, you must invalidate the require cache and then
  * re-require the module under test so that it picks up the mocked
  * dependencies.
  *
  * The require parameter is needed because require is bound differently in each
  * file, and we need to execute this in the caller's context.
  */
);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function clearRequireCache(require, module) {
  delete require.cache[require.resolve(module)];
}

function uncachedRequire(require, module) {
  clearRequireCache(require, module);
  // $FlowIgnore
  return require(module);
}

/**
 * Jasmine has trouble spying on properties supplied by getters, so to make it
 * work we have to get the value, delete the getter, and set the value as a
 * property.
 *
 * This makes two assumptions:
 * - The getter is idempotent (otherwise, callers in other tests might be
 *   surprised when the value here is returned)
 * - The getter returns a function (otherwise, it doesn't make sense to spy on
 *   it)
 */
function spyOnGetterValue(object, f) {
  var value = object[f];
  delete object[f];
  object[f] = value;
  return spyOn(object, f);
}

/**
 * Checks if the two objects have equal properties. This considers a property
 * set to undefined to be equivalent to a property that was not set at all.
 */
function arePropertiesEqual(obj1, obj2) {
  var allProps = new Set();
  function addAllProps(obj) {
    for (var prop of Object.keys(obj)) {
      allProps.add(prop);
    }
  }
  [obj1, obj2].forEach(addAllProps);
  for (var prop of allProps) {
    if (obj1[prop] !== obj2[prop]) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if the contents of two sets are identical
 */
function areSetsEqual(set1, set2) {
  for (var v1 of set1) {
    if (!set2.has(v1)) {
      return false;
    }
  }
  for (var v2 of set2) {
    if (!set1.has(v2)) {
      return false;
    }
  }
  return true;
}

function loggingObserver(message) {
  var Rx = require('@reactivex/rxjs');
  return Rx.Observer.create(function (value) {
    console.log(message + ': ' + JSON.stringify(value)); // eslint-disable-line no-console
  }, function (error) {
    console.log('Error ' + message + ': ' + error.toString()); // eslint-disable-line no-console
  }, function () {
    console.log('Completed: ' + message); // eslint-disable-line no-console
  });
}

module.exports = Object.defineProperties({
  addMatchers: require('./matchers').addMatchers,
  clearRequireCache: clearRequireCache,
  expectAsyncFailure: expectAsyncFailure,

  spyOnGetterValue: spyOnGetterValue,
  uncachedRequire: uncachedRequire,
  arePropertiesEqual: arePropertiesEqual,
  areSetsEqual: areSetsEqual,
  loggingObserver: loggingObserver
}, {
  fixtures: {
    get: function get() {
      return require('./fixtures');
    },
    configurable: true,
    enumerable: true
  },
  tempdir: {
    get: function get() {
      return require('./tempdir');
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,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LFFBQVEsRUFBRSxDQUFHLENBQUM7R0FDdEQsRUFDRCxZQUFNO0FBQ0osV0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLENBQUM7R0FDdEMsQ0FDRixDQUFDO0NBQ0g7O0FBRUQsTUFBTSxDQUFDLE9BQU8sMkJBQUc7QUFDZixhQUFXLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLFdBQVc7QUFDOUMsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixvQkFBa0IsRUFBbEIsa0JBQWtCOztBQU9sQixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLGlCQUFlLEVBQWYsZUFBZTtBQUNmLG9CQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsY0FBWSxFQUFaLFlBQVk7QUFDWixpQkFBZSxFQUFmLGVBQWU7Q0FDaEI7QUFYSyxVQUFRO1NBQUEsZUFBRztBQUNiLGFBQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQzlCOzs7O0FBQ0csU0FBTztTQUFBLGVBQUc7QUFDWixhQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM3Qjs7OztFQU1GLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIFByb21pc2UgZmFpbHMgd2l0aCBhbiBFcnJvciB3aXRoIHNwZWNpZmljIGV4cGVjdGF0aW9ucy4gV2hlblxuICogcnVubmluZyBhIHRlc3Qgd2hlcmUgYSBQcm9taXNlIGlzIGV4cGVjdGVkIHRvIGZhaWwsIGl0IGlzIGltcG9ydGFudCB0byB2ZXJpZnlcbiAqIHRoYXQgaXQgZmFpbGVkIGluIHRoZSBleHBlY3RlZCB3YXkgdG8gYXZvaWQgZmFsc2UgcG9zaXRpdmVzIGluIHRlc3QgcmVzdWx0cy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSB1c2VkIHdpdGggYGF3YWl0YCBpbnNpZGUgYHdhaXRzRm9yUHJvbWlzZSgpYC5cbiAqXG4gKiBAcGFyYW0gcHJvbWlzZSB3aWxsIGJlIGF3YWl0ZWQuIEl0IGlzIGV4cGVjdGVkIHRvIHJlamVjdC4gSWYgaXQgZG9lcyBub3RcbiAqICAgICByZWplY3QsIHRoZW4gdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiBhIHJlamVjdGVkIFByb21pc2UuXG4gKiBAcGFyYW0gdmVyaWZ5IHNob3VsZCBjb25maXJtIGV4cGVjdGF0aW9ucyBhYm91dCB0aGUgRXJyb3IgcHJvZHVjZWQgYnkgdGhlXG4gKiAgICAgcmVqZWN0aW9uIG9mIGBwcm9taXNlYC4gSWYgdGhlc2UgZXhwZWN0YXRpb25zIGFyZSBub3QgbWV0LCB0aGVuXG4gKiAgICAgYHZlcmlmeSgpYCBtdXN0IHRocm93IGFuIGV4Y2VwdGlvbi5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZXhwZWN0QXN5bmNGYWlsdXJlKFxuICAgIHByb21pc2U6IFByb21pc2UsXG4gICAgdmVyaWZ5OiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkKTogUHJvbWlzZSB7XG4gIHRyeSB7XG4gICAgYXdhaXQgcHJvbWlzZTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ1Byb21pc2Ugc2hvdWxkIGhhdmUgZmFpbGVkLCBidXQgZGlkIG5vdC4nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHZlcmlmeShlKTtcbiAgfVxufVxuXG4vKipcbiAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgbW9ja2luZyBhIG1vZHVsZSB0aGF0IHRoZSBtb2R1bGUgdW5kZXIgdGVzdCByZXF1aXJlcy5cbiAgKiBBZnRlciBzZXR0aW5nIHVwIHRoZSBtb2NrcywgeW91IG11c3QgaW52YWxpZGF0ZSB0aGUgcmVxdWlyZSBjYWNoZSBhbmQgdGhlblxuICAqIHJlLXJlcXVpcmUgdGhlIG1vZHVsZSB1bmRlciB0ZXN0IHNvIHRoYXQgaXQgcGlja3MgdXAgdGhlIG1vY2tlZFxuICAqIGRlcGVuZGVuY2llcy5cbiAgKlxuICAqIFRoZSByZXF1aXJlIHBhcmFtZXRlciBpcyBuZWVkZWQgYmVjYXVzZSByZXF1aXJlIGlzIGJvdW5kIGRpZmZlcmVudGx5IGluIGVhY2hcbiAgKiBmaWxlLCBhbmQgd2UgbmVlZCB0byBleGVjdXRlIHRoaXMgaW4gdGhlIGNhbGxlcidzIGNvbnRleHQuXG4gICovXG5mdW5jdGlvbiBjbGVhclJlcXVpcmVDYWNoZShyZXF1aXJlOiBPYmplY3QsIG1vZHVsZTogc3RyaW5nKTogdm9pZCB7XG4gIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZShtb2R1bGUpXTtcbn1cblxuZnVuY3Rpb24gdW5jYWNoZWRSZXF1aXJlKHJlcXVpcmU6IE9iamVjdCwgbW9kdWxlOiBzdHJpbmcpOiBtaXhlZCB7XG4gIGNsZWFyUmVxdWlyZUNhY2hlKHJlcXVpcmUsIG1vZHVsZSk7XG4gIC8vICRGbG93SWdub3JlXG4gIHJldHVybiByZXF1aXJlKG1vZHVsZSk7XG59XG5cbi8qKlxuICogSmFzbWluZSBoYXMgdHJvdWJsZSBzcHlpbmcgb24gcHJvcGVydGllcyBzdXBwbGllZCBieSBnZXR0ZXJzLCBzbyB0byBtYWtlIGl0XG4gKiB3b3JrIHdlIGhhdmUgdG8gZ2V0IHRoZSB2YWx1ZSwgZGVsZXRlIHRoZSBnZXR0ZXIsIGFuZCBzZXQgdGhlIHZhbHVlIGFzIGFcbiAqIHByb3BlcnR5LlxuICpcbiAqIFRoaXMgbWFrZXMgdHdvIGFzc3VtcHRpb25zOlxuICogLSBUaGUgZ2V0dGVyIGlzIGlkZW1wb3RlbnQgKG90aGVyd2lzZSwgY2FsbGVycyBpbiBvdGhlciB0ZXN0cyBtaWdodCBiZVxuICogICBzdXJwcmlzZWQgd2hlbiB0aGUgdmFsdWUgaGVyZSBpcyByZXR1cm5lZClcbiAqIC0gVGhlIGdldHRlciByZXR1cm5zIGEgZnVuY3Rpb24gKG90aGVyd2lzZSwgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHRvIHNweSBvblxuICogICBpdClcbiAqL1xuZnVuY3Rpb24gc3B5T25HZXR0ZXJWYWx1ZShvYmplY3Q6IE9iamVjdCwgZjogc3RyaW5nKTogSmFzbWluZVNweSB7XG4gIGNvbnN0IHZhbHVlID0gb2JqZWN0W2ZdO1xuICBkZWxldGUgb2JqZWN0W2ZdO1xuICBvYmplY3RbZl0gPSB2YWx1ZTtcbiAgcmV0dXJuIHNweU9uKG9iamVjdCwgZik7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSB0d28gb2JqZWN0cyBoYXZlIGVxdWFsIHByb3BlcnRpZXMuIFRoaXMgY29uc2lkZXJzIGEgcHJvcGVydHlcbiAqIHNldCB0byB1bmRlZmluZWQgdG8gYmUgZXF1aXZhbGVudCB0byBhIHByb3BlcnR5IHRoYXQgd2FzIG5vdCBzZXQgYXQgYWxsLlxuICovXG5mdW5jdGlvbiBhcmVQcm9wZXJ0aWVzRXF1YWwob2JqMTogT2JqZWN0LCBvYmoyOiBPYmplY3QpOiBib29sZWFuIHtcbiAgY29uc3QgYWxsUHJvcHMgPSBuZXcgU2V0KCk7XG4gIGZ1bmN0aW9uIGFkZEFsbFByb3BzKG9iaikge1xuICAgIGZvciAoY29uc3QgcHJvcCBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgICBhbGxQcm9wcy5hZGQocHJvcCk7XG4gICAgfVxuICB9XG4gIFtvYmoxLCBvYmoyXS5mb3JFYWNoKGFkZEFsbFByb3BzKTtcbiAgZm9yIChjb25zdCBwcm9wIG9mIGFsbFByb3BzKSB7XG4gICAgaWYgKG9iajFbcHJvcF0gIT09IG9iajJbcHJvcF0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjb250ZW50cyBvZiB0d28gc2V0cyBhcmUgaWRlbnRpY2FsXG4gKi9cbmZ1bmN0aW9uIGFyZVNldHNFcXVhbChzZXQxOiBTZXQsIHNldDI6IFNldCk6IGJvb2xlYW4ge1xuICBmb3IgKGNvbnN0IHYxIG9mIHNldDEpIHtcbiAgICBpZiAoIXNldDIuaGFzKHYxKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IHYyIG9mIHNldDIpIHtcbiAgICBpZiAoIXNldDEuaGFzKHYyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuaW1wb3J0IHR5cGUge09ic2VydmVyfSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG4vKipcbiAqIExvZ3MgYW4gb2JzZXJ2YWJsZSB0byB0aGUgY29uc29sZS5cbiAqIFVzZWZ1bCBmb3IgZGVidWdnaW5nIG9ic2VydmFibGUgY29kZS5cbiAqIFVzYWdlOlxuICogICAgIG9ic2VydmFibGUgPSBvYnNlcnZhYmxlLmRvKGxvZ2dpbmdPYnNlcnZlcignTXkgUHJlZml4JykpO1xuICovXG5mdW5jdGlvbiBsb2dnaW5nT2JzZXJ2ZXIobWVzc2FnZTogc3RyaW5nKTogT2JzZXJ2ZXIge1xuICBjb25zdCBSeCA9IHJlcXVpcmUoJ0ByZWFjdGl2ZXgvcnhqcycpO1xuICByZXR1cm4gUnguT2JzZXJ2ZXIuY3JlYXRlKFxuICAgIHZhbHVlID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGAke21lc3NhZ2V9OiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfSxcbiAgICBlcnJvciA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgRXJyb3IgJHttZXNzYWdlfTogJHtlcnJvci50b1N0cmluZygpfWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9LFxuICAgICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb21wbGV0ZWQ6ICcgKyBtZXNzYWdlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkTWF0Y2hlcnM6IHJlcXVpcmUoJy4vbWF0Y2hlcnMnKS5hZGRNYXRjaGVycyxcbiAgY2xlYXJSZXF1aXJlQ2FjaGUsXG4gIGV4cGVjdEFzeW5jRmFpbHVyZSxcbiAgZ2V0IGZpeHR1cmVzKCkge1xuICAgIHJldHVybiByZXF1aXJlKCcuL2ZpeHR1cmVzJyk7XG4gIH0sXG4gIGdldCB0ZW1wZGlyKCkge1xuICAgIHJldHVybiByZXF1aXJlKCcuL3RlbXBkaXInKTtcbiAgfSxcbiAgc3B5T25HZXR0ZXJWYWx1ZSxcbiAgdW5jYWNoZWRSZXF1aXJlLFxuICBhcmVQcm9wZXJ0aWVzRXF1YWwsXG4gIGFyZVNldHNFcXVhbCxcbiAgbG9nZ2luZ09ic2VydmVyLFxufTtcbiJdfQ==