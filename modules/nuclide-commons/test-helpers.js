'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.generateFixture = exports.expectObservableToStartWith = exports.expectAsyncFailure = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));



























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
                                                                                                                                                                                                                                                                  */let expectAsyncFailure = exports.expectAsyncFailure = (() => {var _ref = (0, _asyncToGenerator.default)(
  function* (
  promise,
  verify)
  {
    try {
      yield promise;
      return Promise.reject(
      new Error('Promise should have failed, but did not.'));

    } catch (e) {
      verify(e);
    }
  });return function expectAsyncFailure(_x, _x2) {return _ref.apply(this, arguments);};})();

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
                                                                                                  * Warning: Callsites *must* await the resulting promise, or test failures may go unreported or
                                                                                                  * misattributed.
                                                                                                  */let expectObservableToStartWith = exports.expectObservableToStartWith = (() => {var _ref2 = (0, _asyncToGenerator.default)(
  function* (
  source,
  expected)
  {
    const actual = yield source.
    take(expected.length).
    toArray().
    toPromise();
    expect(actual).toEqual(expected);
  });return function expectObservableToStartWith(_x3, _x4) {return _ref2.apply(this, arguments);};})();

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
                                                                                                         */let generateFixture = exports.generateFixture = (() => {var _ref3 = (0, _asyncToGenerator.default)(
  function* (
  fixtureName,
  files)
  {
    (_temp || _load_temp()).default.track();

    const MAX_CONCURRENT_FILE_OPS = 100;
    const tempDir = yield (_fsPromise || _load_fsPromise()).default.tempdir(fixtureName);

    if (files == null) {
      return tempDir;
    }

    // Map -> Array with full paths
    const fileTuples = Array.from(files, function (tuple) {
      // It's our own array - it's ok to mutate it
      tuple[0] = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, tuple[0]);
      return tuple;
    });

    // Dedupe the dirs that we have to make.
    const dirsToMake = fileTuples.
    map(function ([filename]) {return (_nuclideUri || _load_nuclideUri()).default.dirname(filename);}).
    filter(function (dirname, i, arr) {return arr.indexOf(dirname) === i;});

    yield (0, (_promise || _load_promise()).asyncLimit)(dirsToMake, MAX_CONCURRENT_FILE_OPS, function (dirname) {return (
        (_fsPromise || _load_fsPromise()).default.mkdirp(dirname));});


    yield (0, (_promise || _load_promise()).asyncLimit)(
    fileTuples,
    MAX_CONCURRENT_FILE_OPS,
    function ([filename, contents]) {
      // We can't use fsPromise/fs-plus because it does too much extra work.
      // They call `mkdirp` before `writeFile`. We know that the target dir
      // exists, so we can optimize by going straight to `fs`. When you're
      // making 10k files, this adds ~500ms.
      return new Promise(function (resolve, reject) {
        _fs.default.writeFile(filename, contents || '', function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });


    return tempDir;
  });return function generateFixture(_x5, _x6) {return _ref3.apply(this, arguments);};})();exports.clearRequireCache = clearRequireCache;exports.uncachedRequire = uncachedRequire;exports.spyOnGetterValue = spyOnGetterValue;exports.arePropertiesEqual = arePropertiesEqual;exports.

writeCoverage = writeCoverage;var _fs = _interopRequireDefault(require('fs'));var _temp;function _load_temp() {return _temp = _interopRequireDefault(require('temp'));}var _uuid;function _load_uuid() {return _uuid = _interopRequireDefault(require('uuid'));}var _fsPromise;function _load_fsPromise() {return _fsPromise = _interopRequireDefault(require('./fsPromise'));}var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('./nuclideUri'));}var _promise;function _load_promise() {return _promise = require('./promise');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */if (!(typeof atom !== 'undefined' && atom.inSpecMode() || process.env.NODE_ENV === 'test')) {throw new Error('Test helpers should only be used in spec mode');}function clearRequireCache(require, module) {delete require.cache[require.resolve(module)];}function uncachedRequire(require, module) {clearRequireCache(require, module); // $FlowIgnore
  return require(module);} /**
                            * Jasmine has trouble spying on properties supplied by getters, so to make it
                            * work we have to get the value, delete the getter, and set the value as a
                            * property.
                            *
                            * This makes two assumptions:
                            * - The getter is idempotent (otherwise, callers in other tests might be
                            *   surprised when the value here is returned)
                            * - The getter returns a function (otherwise, it doesn't make sense to spy on
                            *   it)
                            */function spyOnGetterValue(object, f) {const value = object[f];delete object[f];object[f] = value;return spyOn(object, f);} /**
                                                                                                                                                          * Checks if the two objects have equal properties. This considers a property
                                                                                                                                                          * set to undefined to be equivalent to a property that was not set at all.
                                                                                                                                                          */function arePropertiesEqual(obj1, obj2) {const allProps = new Set();function addAllProps(obj) {for (const prop of Object.keys(obj)) {allProps.add(prop);}}[obj1, obj2].forEach(addAllProps);for (const prop of allProps) {if (obj1[prop] !== obj2[prop]) {return false;}}return true;}function writeCoverage() {const { COVERAGE_DIR } = process.env;if (COVERAGE_DIR != null) {const coverage = global.__coverage__;if (coverage != null) {_fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(COVERAGE_DIR, (_uuid || _load_uuid()).default.v4() + '.json'), JSON.stringify(coverage));}}}