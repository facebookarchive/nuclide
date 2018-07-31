"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expectAsyncFailure = expectAsyncFailure;
exports.clearRequireCache = clearRequireCache;
exports.uncachedRequire = uncachedRequire;
exports.spyOnGetterValue = spyOnGetterValue;
exports.arePropertiesEqual = arePropertiesEqual;
exports.expectObservableToStartWith = expectObservableToStartWith;
exports.generateFixture = generateFixture;
exports.writeCoverage = writeCoverage;

var _fs = _interopRequireDefault(require("fs"));

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("./fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("./nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("./promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
if (!(typeof atom !== 'undefined' && atom.inSpecMode() || process.env.NODE_ENV === 'test')) {
  throw new Error('Test helpers should only be used in spec mode');
}
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


async function expectAsyncFailure(promise, verify) {
  try {
    await promise;
    return Promise.reject(new Error('Promise should have failed, but did not.'));
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


function clearRequireCache(require, module) {
  delete require.cache[require.resolve(module)];
}

function uncachedRequire(require, module) {
  clearRequireCache(require, module); // $FlowIgnore

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
}
/**
 * Warning: Callsites *must* await the resulting promise, or test failures may go unreported or
 * misattributed.
 */


async function expectObservableToStartWith(source, expected) {
  const actual = await source.take(expected.length).toArray().toPromise();
  expect(actual).toEqual(expected);
}
/**
 * Takes of Map of file/file-content pairs, and creates a temp dir that matches
 * the file structure of the Map. Example:
 *
 * generateFixture('myfixture', new Map([
 *   ['foo.js'],
 *   ['bar/baz.txt', 'some text'],
 * ]));
 *
 * Creates:
 *
 * /tmp/myfixture_1/foo.js (empty file)
 * /tmp/myfixture_1/bar/baz.txt (with 'some text')
 */


async function generateFixture(fixtureName, files) {
  _temp().default.track();

  const MAX_CONCURRENT_FILE_OPS = 100;
  const tempDir = await _fsPromise().default.tempdir(fixtureName);

  if (files == null) {
    return tempDir;
  } // Map -> Array with full paths


  const fileTuples = Array.from(files, tuple => {
    // It's our own array - it's ok to mutate it
    tuple[0] = _nuclideUri().default.join(tempDir, tuple[0]);
    return tuple;
  }); // Dedupe the dirs that we have to make.

  const dirsToMake = fileTuples.map(([filename]) => _nuclideUri().default.dirname(filename)).filter((dirname, i, arr) => arr.indexOf(dirname) === i);
  await (0, _promise().asyncLimit)(dirsToMake, MAX_CONCURRENT_FILE_OPS, dirname => _fsPromise().default.mkdirp(dirname));
  await (0, _promise().asyncLimit)(fileTuples, MAX_CONCURRENT_FILE_OPS, ([filename, contents]) => {
    // We can't use fsPromise/fs-plus because it does too much extra work.
    // They call `mkdirp` before `writeFile`. We know that the target dir
    // exists, so we can optimize by going straight to `fs`. When you're
    // making 10k files, this adds ~500ms.
    return new Promise((resolve, reject) => {
      _fs.default.writeFile(filename, contents || '', err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
  return tempDir;
}

function writeCoverage() {
  const {
    COVERAGE_DIR
  } = process.env;

  if (COVERAGE_DIR != null) {
    const coverage = global.__coverage__;

    if (coverage != null) {
      _fs.default.writeFileSync(_nuclideUri().default.join(COVERAGE_DIR, _uuid().default.v4() + '.json'), JSON.stringify(coverage));
    }
  }
}