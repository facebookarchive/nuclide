Object.defineProperty(exports, '__esModule', {
  value: true
});

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

/**
 * Warning: Callsites *must* await the resulting promise, or test failures may go unreported or
 * misattributed.
 */

var expectObservableToStartWith = _asyncToGenerator(function* (source, expected) {
  var actual = yield source.take(expected.length).toArray().toPromise();
  expect(actual).toEqual(expected);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _fixtures2;

function _fixtures() {
  return _fixtures2 = require('./fixtures');
}

var _matchers2;

function _matchers() {
  return _matchers2 = require('./matchers');
}

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
 *
 * `id` should be the result of `require.resolve('module-name')`. That way relative modules are
 * resolved in the context of the caller.
 */
function spyOnDefault(id) {
  try {
    // Load the module in case it hasn't been loaded already.
    // $FlowIgnore
    require(id);
  } catch (e) {
    if (e.message === 'Cannot find module \'' + id + '\'') {
      throw new Error(e.message + '. Did you forget to call `require.resolve`?');
    }
    throw e;
  }
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

/**
 * Logs an observable to the console.
 * Useful for debugging observable code.
 * Usage:
 *     observable = observable.do(loggingObserver('My Prefix'));
 */
function loggingObserver(message) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observer.create(function (value) {
    // eslint-disable-next-line no-console
    console.log(message + ': ' + JSON.stringify(value));
  }, function (error) {
    // eslint-disable-next-line no-console
    console.log('Error ' + message + ': ' + error.toString());
  }, function () {
    // eslint-disable-next-line no-console
    console.log('Completed: ' + message);
  });
}exports.addMatchers = (_matchers2 || _matchers()).addMatchers;
exports.arePropertiesEqual = arePropertiesEqual;
exports.areSetsEqual = areSetsEqual;
exports.clearRequireCache = clearRequireCache;
exports.copyFixture = (_fixtures2 || _fixtures()).copyFixture;
exports.copyBuildFixture = (_fixtures2 || _fixtures()).copyBuildFixture;
exports.expectAsyncFailure = expectAsyncFailure;
exports.expectObservableToStartWith = expectObservableToStartWith;
exports.generateHgRepo1Fixture = (_fixtures2 || _fixtures()).generateHgRepo1Fixture;
exports.generateHgRepo2Fixture = (_fixtures2 || _fixtures()).generateHgRepo2Fixture;
exports.generateFixture = (_fixtures2 || _fixtures()).generateFixture;
exports.loggingObserver = loggingObserver;
exports.spyOnDefault = spyOnDefault;
exports.spyOnGetterValue = spyOnGetterValue;
exports.uncachedRequire = uncachedRequire;
exports.unspyOnDefault = unspyOnDefault;