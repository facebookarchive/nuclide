'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uncachedRequire = exports.spyOnGetterValue = exports.generateFixture = exports.generateHgRepo2Fixture = exports.generateHgRepo1Fixture = exports.expectObservableToStartWith = exports.expectAsyncFailure = exports.copyBuildFixture = exports.copyFixture = exports.clearRequireCache = exports.arePropertiesEqual = exports.addMatchers = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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
let expectAsyncFailure = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (promise, verify) {
    try {
      yield promise;
      return Promise.reject(new Error('Promise should have failed, but did not.'));
    } catch (e) {
      verify(e);
    }
  });

  return function expectAsyncFailure(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
  * This is useful for mocking a module that the module under test requires.
  * After setting up the mocks, you must invalidate the require cache and then
  * re-require the module under test so that it picks up the mocked
  * dependencies.
  *
  * The require parameter is needed because require is bound differently in each
  * file, and we need to execute this in the caller's context.
  */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/**
 * Warning: Callsites *must* await the resulting promise, or test failures may go unreported or
 * misattributed.
 */
let expectObservableToStartWith = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (source, expected) {
    const actual = yield source.take(expected.length).toArray().toPromise();
    expect(actual).toEqual(expected);
  });

  return function expectObservableToStartWith(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

var _fixtures;

function _load_fixtures() {
  return _fixtures = require('./fixtures');
}

var _matchers;

function _load_matchers() {
  return _matchers = require('./matchers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  const value = object[f];
  delete object[f];
  object[f] = value;
  return spyOn(object, f);
}

/**
 * Checks if the two objects have equal properties. This considers a property
 * set to undefined to be equivalent to a property that was not set at all.
 */
function arePropertiesEqual(obj1, obj2) {
  const allProps = new Set();
  function addAllProps(obj) {
    for (const prop of Object.keys(obj)) {
      allProps.add(prop);
    }
  }
  [obj1, obj2].forEach(addAllProps);
  for (const prop of allProps) {
    if (obj1[prop] !== obj2[prop]) {
      return false;
    }
  }
  return true;
}exports.addMatchers = (_matchers || _load_matchers()).addMatchers;
exports.arePropertiesEqual = arePropertiesEqual;
exports.clearRequireCache = clearRequireCache;
exports.copyFixture = (_fixtures || _load_fixtures()).copyFixture;
exports.copyBuildFixture = (_fixtures || _load_fixtures()).copyBuildFixture;
exports.expectAsyncFailure = expectAsyncFailure;
exports.expectObservableToStartWith = expectObservableToStartWith;
exports.generateHgRepo1Fixture = (_fixtures || _load_fixtures()).generateHgRepo1Fixture;
exports.generateHgRepo2Fixture = (_fixtures || _load_fixtures()).generateHgRepo2Fixture;
exports.generateFixture = (_fixtures || _load_fixtures()).generateFixture;
exports.spyOnGetterValue = spyOnGetterValue;
exports.uncachedRequire = uncachedRequire;