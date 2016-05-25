

/**
 * When called from a file in a spec/ directory that has a subdirectory named fixtures/, it copies
 * the specified subdirectory of fixtures into a temp directory. The temp directory will be deleted
 * automatically when the current process exits.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory that should be copied.
 * @param dirname The calling function should call `__dirname` as this argument. This should
 *   correspond to the spec/ directory with a fixtures/ subdirectory.
 */

var copyFixture = _asyncToGenerator(function* (fixtureName, dirname) {
  var tempDir = yield (0, (_tempdir2 || _tempdir()).mkdir)(fixtureName);

  // Recursively copy the contents of the fixture to the temp directory.
  yield new Promise(function (resolve, reject) {
    var sourceDirectory = (_path2 || _path()).default.join(dirname, 'fixtures', fixtureName);
    (_fsExtra2 || _fsExtra()).default.copy(sourceDirectory, tempDir, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return tempDir;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fsExtra2;

function _fsExtra() {
  return _fsExtra2 = _interopRequireDefault(require('fs-extra'));
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _tempdir2;

function _tempdir() {
  return _tempdir2 = require('./tempdir');
}

module.exports = {
  copyFixture: copyFixture
};