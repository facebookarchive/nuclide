

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
 * Allows spying on a function that is the default export of a module. Works
 * with ES modules and CommonJS.
 */
function spyOnDefault(id) {
  // Load the module in case it hasn't been loaded already.
  // $FlowIgnore
  require(id);
  var _module = require.cache[id];
  if (_module.exports.__esModule) {
    return spyOn(_module.exports, 'default');
  } else {
    return spyOn(_module, 'exports');
  }
}

function unspyOnDefault(id) {
  var _module = require.cache[id];
  if (_module.exports.__esModule) {
    return jasmine.unspy(_module.exports, 'default');
  } else {
    return jasmine.unspy(_module, 'exports');
  }
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
  var Rx = require('rxjs/bundles/Rx.umd.min.js');
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

  spyOnDefault: spyOnDefault,
  spyOnGetterValue: spyOnGetterValue,
  unspyOnDefault: unspyOnDefault,
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