Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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
    var sourceDirectory = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(dirname, 'fixtures', fixtureName);
    (_fsExtra2 || _fsExtra()).default.copy(sourceDirectory, tempDir, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return tempDir;
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
);

exports.copyFixture = copyFixture;

var generateFixture = _asyncToGenerator(function* (fixtureName, files) {
  var MAX_CONCURRENT_FILE_OPS = 100;
  var tempDir = yield (0, (_tempdir2 || _tempdir()).mkdir)(fixtureName);

  if (files == null) {
    return tempDir;
  }

  // Map -> Array with full paths
  var fileTuples = Array.from(files, function (tuple) {
    // It's our own array - it's ok to mutate it
    tuple[0] = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(tempDir, tuple[0]);
    return tuple;
  });

  // Dedupe the dirs that we have to make.
  var dirsToMake = fileTuples.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var filename = _ref2[0];
    return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(filename);
  }).filter(function (dirname, i, arr) {
    return arr.indexOf(dirname) === i;
  });

  yield (0, (_commonsNodePromise2 || _commonsNodePromise()).asyncLimit)(dirsToMake, MAX_CONCURRENT_FILE_OPS, function (dirname) {
    return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.mkdirp(dirname);
  });

  yield (0, (_commonsNodePromise2 || _commonsNodePromise()).asyncLimit)(fileTuples, MAX_CONCURRENT_FILE_OPS, function (_ref3) {
    var _ref32 = _slicedToArray(_ref3, 2);

    var filename = _ref32[0];
    var contents = _ref32[1];

    // We can't use fsPromise/fs-plus because it does too much extra work.
    // They call `mkdirp` before `writeFile`. We know that the target dir
    // exists, so we can optimize by going straight to `fs`. When you're
    // making 10k files, this adds ~500ms.
    return new Promise(function (resolve, reject) {
      (_fs2 || _fs()).default.writeFile(filename, contents || '', function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  return tempDir;
});

exports.generateFixture = generateFixture;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _fsExtra2;

function _fsExtra() {
  return _fsExtra2 = _interopRequireDefault(require('fs-extra'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _tempdir2;

function _tempdir() {
  return _tempdir2 = require('./tempdir');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}