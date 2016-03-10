

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
  var Rx = require('rx');
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
//# sourceMappingURL=data:application/json;base64,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QUFRLEVBQUUsQ0FBRyxDQUFDO0dBQ3RELEVBQ0QsWUFBTTtBQUNKLFdBQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0dBQ3RDLENBQ0YsQ0FBQztDQUNIOztBQUVELE1BQU0sQ0FBQyxPQUFPLDJCQUFHO0FBQ2YsYUFBVyxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXO0FBQzlDLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsb0JBQWtCLEVBQWxCLGtCQUFrQjs7QUFPbEIsa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixpQkFBZSxFQUFmLGVBQWU7QUFDZixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLGNBQVksRUFBWixZQUFZO0FBQ1osaUJBQWUsRUFBZixlQUFlO0NBQ2hCO0FBWEssVUFBUTtTQUFBLGVBQUc7QUFDYixhQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUM5Qjs7OztBQUNHLFNBQU87U0FBQSxlQUFHO0FBQ1osYUFBTyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0I7Ozs7RUFNRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgYSBQcm9taXNlIGZhaWxzIHdpdGggYW4gRXJyb3Igd2l0aCBzcGVjaWZpYyBleHBlY3RhdGlvbnMuIFdoZW5cbiAqIHJ1bm5pbmcgYSB0ZXN0IHdoZXJlIGEgUHJvbWlzZSBpcyBleHBlY3RlZCB0byBmYWlsLCBpdCBpcyBpbXBvcnRhbnQgdG8gdmVyaWZ5XG4gKiB0aGF0IGl0IGZhaWxlZCBpbiB0aGUgZXhwZWN0ZWQgd2F5IHRvIGF2b2lkIGZhbHNlIHBvc2l0aXZlcyBpbiB0ZXN0IHJlc3VsdHMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBzaG91bGQgYmUgdXNlZCB3aXRoIGBhd2FpdGAgaW5zaWRlIGB3YWl0c0ZvclByb21pc2UoKWAuXG4gKlxuICogQHBhcmFtIHByb21pc2Ugd2lsbCBiZSBhd2FpdGVkLiBJdCBpcyBleHBlY3RlZCB0byByZWplY3QuIElmIGl0IGRvZXMgbm90XG4gKiAgICAgcmVqZWN0LCB0aGVuIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gYSByZWplY3RlZCBQcm9taXNlLlxuICogQHBhcmFtIHZlcmlmeSBzaG91bGQgY29uZmlybSBleHBlY3RhdGlvbnMgYWJvdXQgdGhlIEVycm9yIHByb2R1Y2VkIGJ5IHRoZVxuICogICAgIHJlamVjdGlvbiBvZiBgcHJvbWlzZWAuIElmIHRoZXNlIGV4cGVjdGF0aW9ucyBhcmUgbm90IG1ldCwgdGhlblxuICogICAgIGB2ZXJpZnkoKWAgbXVzdCB0aHJvdyBhbiBleGNlcHRpb24uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4cGVjdEFzeW5jRmFpbHVyZShcbiAgICBwcm9taXNlOiBQcm9taXNlLFxuICAgIHZlcmlmeTogKGVycm9yOiBFcnJvcikgPT4gdm9pZCk6IFByb21pc2Uge1xuICB0cnkge1xuICAgIGF3YWl0IHByb21pc2U7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdQcm9taXNlIHNob3VsZCBoYXZlIGZhaWxlZCwgYnV0IGRpZCBub3QuJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2ZXJpZnkoZSk7XG4gIH1cbn1cblxuLyoqXG4gICogVGhpcyBpcyB1c2VmdWwgZm9yIG1vY2tpbmcgYSBtb2R1bGUgdGhhdCB0aGUgbW9kdWxlIHVuZGVyIHRlc3QgcmVxdWlyZXMuXG4gICogQWZ0ZXIgc2V0dGluZyB1cCB0aGUgbW9ja3MsIHlvdSBtdXN0IGludmFsaWRhdGUgdGhlIHJlcXVpcmUgY2FjaGUgYW5kIHRoZW5cbiAgKiByZS1yZXF1aXJlIHRoZSBtb2R1bGUgdW5kZXIgdGVzdCBzbyB0aGF0IGl0IHBpY2tzIHVwIHRoZSBtb2NrZWRcbiAgKiBkZXBlbmRlbmNpZXMuXG4gICpcbiAgKiBUaGUgcmVxdWlyZSBwYXJhbWV0ZXIgaXMgbmVlZGVkIGJlY2F1c2UgcmVxdWlyZSBpcyBib3VuZCBkaWZmZXJlbnRseSBpbiBlYWNoXG4gICogZmlsZSwgYW5kIHdlIG5lZWQgdG8gZXhlY3V0ZSB0aGlzIGluIHRoZSBjYWxsZXIncyBjb250ZXh0LlxuICAqL1xuZnVuY3Rpb24gY2xlYXJSZXF1aXJlQ2FjaGUocmVxdWlyZTogT2JqZWN0LCBtb2R1bGU6IHN0cmluZyk6IHZvaWQge1xuICBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUobW9kdWxlKV07XG59XG5cbmZ1bmN0aW9uIHVuY2FjaGVkUmVxdWlyZShyZXF1aXJlOiBPYmplY3QsIG1vZHVsZTogc3RyaW5nKTogbWl4ZWQge1xuICBjbGVhclJlcXVpcmVDYWNoZShyZXF1aXJlLCBtb2R1bGUpO1xuICAvLyAkRmxvd0lnbm9yZVxuICByZXR1cm4gcmVxdWlyZShtb2R1bGUpO1xufVxuXG4vKipcbiAqIEphc21pbmUgaGFzIHRyb3VibGUgc3B5aW5nIG9uIHByb3BlcnRpZXMgc3VwcGxpZWQgYnkgZ2V0dGVycywgc28gdG8gbWFrZSBpdFxuICogd29yayB3ZSBoYXZlIHRvIGdldCB0aGUgdmFsdWUsIGRlbGV0ZSB0aGUgZ2V0dGVyLCBhbmQgc2V0IHRoZSB2YWx1ZSBhcyBhXG4gKiBwcm9wZXJ0eS5cbiAqXG4gKiBUaGlzIG1ha2VzIHR3byBhc3N1bXB0aW9uczpcbiAqIC0gVGhlIGdldHRlciBpcyBpZGVtcG90ZW50IChvdGhlcndpc2UsIGNhbGxlcnMgaW4gb3RoZXIgdGVzdHMgbWlnaHQgYmVcbiAqICAgc3VycHJpc2VkIHdoZW4gdGhlIHZhbHVlIGhlcmUgaXMgcmV0dXJuZWQpXG4gKiAtIFRoZSBnZXR0ZXIgcmV0dXJucyBhIGZ1bmN0aW9uIChvdGhlcndpc2UsIGl0IGRvZXNuJ3QgbWFrZSBzZW5zZSB0byBzcHkgb25cbiAqICAgaXQpXG4gKi9cbmZ1bmN0aW9uIHNweU9uR2V0dGVyVmFsdWUob2JqZWN0OiBPYmplY3QsIGY6IHN0cmluZyk6IEphc21pbmVTcHkge1xuICBjb25zdCB2YWx1ZSA9IG9iamVjdFtmXTtcbiAgZGVsZXRlIG9iamVjdFtmXTtcbiAgb2JqZWN0W2ZdID0gdmFsdWU7XG4gIHJldHVybiBzcHlPbihvYmplY3QsIGYpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgdHdvIG9iamVjdHMgaGF2ZSBlcXVhbCBwcm9wZXJ0aWVzLiBUaGlzIGNvbnNpZGVycyBhIHByb3BlcnR5XG4gKiBzZXQgdG8gdW5kZWZpbmVkIHRvIGJlIGVxdWl2YWxlbnQgdG8gYSBwcm9wZXJ0eSB0aGF0IHdhcyBub3Qgc2V0IGF0IGFsbC5cbiAqL1xuZnVuY3Rpb24gYXJlUHJvcGVydGllc0VxdWFsKG9iajE6IE9iamVjdCwgb2JqMjogT2JqZWN0KTogYm9vbGVhbiB7XG4gIGNvbnN0IGFsbFByb3BzID0gbmV3IFNldCgpO1xuICBmdW5jdGlvbiBhZGRBbGxQcm9wcyhvYmopIHtcbiAgICBmb3IgKGNvbnN0IHByb3Agb2YgT2JqZWN0LmtleXMob2JqKSkge1xuICAgICAgYWxsUHJvcHMuYWRkKHByb3ApO1xuICAgIH1cbiAgfVxuICBbb2JqMSwgb2JqMl0uZm9yRWFjaChhZGRBbGxQcm9wcyk7XG4gIGZvciAoY29uc3QgcHJvcCBvZiBhbGxQcm9wcykge1xuICAgIGlmIChvYmoxW3Byb3BdICE9PSBvYmoyW3Byb3BdKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY29udGVudHMgb2YgdHdvIHNldHMgYXJlIGlkZW50aWNhbFxuICovXG5mdW5jdGlvbiBhcmVTZXRzRXF1YWwoc2V0MTogU2V0LCBzZXQyOiBTZXQpOiBib29sZWFuIHtcbiAgZm9yIChjb25zdCB2MSBvZiBzZXQxKSB7XG4gICAgaWYgKCFzZXQyLmhhcyh2MSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCB2MiBvZiBzZXQyKSB7XG4gICAgaWYgKCFzZXQxLmhhcyh2MikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmltcG9ydCB0eXBlIHtPYnNlcnZlcn0gZnJvbSAncngnO1xuXG4vKipcbiAqIExvZ3MgYW4gb2JzZXJ2YWJsZSB0byB0aGUgY29uc29sZS5cbiAqIFVzZWZ1bCBmb3IgZGVidWdnaW5nIG9ic2VydmFibGUgY29kZS5cbiAqIFVzYWdlOlxuICogICAgIG9ic2VydmFibGUgPSBvYnNlcnZhYmxlLmRvKGxvZ2dpbmdPYnNlcnZlcignTXkgUHJlZml4JykpO1xuICovXG5mdW5jdGlvbiBsb2dnaW5nT2JzZXJ2ZXIobWVzc2FnZTogc3RyaW5nKTogT2JzZXJ2ZXIge1xuICBjb25zdCBSeCA9IHJlcXVpcmUoJ3J4Jyk7XG4gIHJldHVybiBSeC5PYnNlcnZlci5jcmVhdGUoXG4gICAgdmFsdWUgPT4ge1xuICAgICAgY29uc29sZS5sb2coYCR7bWVzc2FnZX06ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9LFxuICAgIGVycm9yID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBFcnJvciAke21lc3NhZ2V9OiAke2Vycm9yLnRvU3RyaW5nKCl9YCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH0sXG4gICAgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ0NvbXBsZXRlZDogJyArIG1lc3NhZ2UpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRNYXRjaGVyczogcmVxdWlyZSgnLi9tYXRjaGVycycpLmFkZE1hdGNoZXJzLFxuICBjbGVhclJlcXVpcmVDYWNoZSxcbiAgZXhwZWN0QXN5bmNGYWlsdXJlLFxuICBnZXQgZml4dHVyZXMoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4vZml4dHVyZXMnKTtcbiAgfSxcbiAgZ2V0IHRlbXBkaXIoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4vdGVtcGRpcicpO1xuICB9LFxuICBzcHlPbkdldHRlclZhbHVlLFxuICB1bmNhY2hlZFJlcXVpcmUsXG4gIGFyZVByb3BlcnRpZXNFcXVhbCxcbiAgYXJlU2V0c0VxdWFsLFxuICBsb2dnaW5nT2JzZXJ2ZXIsXG59O1xuIl19