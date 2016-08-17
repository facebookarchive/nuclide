Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/**
 * Traverses up the parent directories looking for `fixtures/FIXTURE_NAME`.
 * When found, it's copied to $TMP. Example:
 *
 *    const fixtureDir = await copyFixture('foo', __dirname)
 *
 *    1. Starts looking for `fixtures/foo` in `__dirname`, going up the parent
 *       until it's found.
 *    2. Copies `__dirname/fixtures/foo` to `$TMP/random-foo-temp-name`.
 *
 * When the process exists, the temporary directory is removed.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory
 * that should be copied.
 * @param startDir The calling function should call `__dirname` as this argument.
 * This should correspond to the spec/ directory with a fixtures/ subdirectory.
 * @returns the path to the temporary directory.
 */

var copyFixture = _asyncToGenerator(function* (fixtureName, startDir) {
  var fixturePath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join('fixtures', fixtureName);
  var fixtureRoot = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile(fixturePath, startDir);
  (0, (_assert2 || _assert()).default)(fixtureRoot != null, 'Could not find source fixture.');
  var sourceDir = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(fixtureRoot, fixturePath);

  (_temp2 || _temp()).default.track();
  var tempDir = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.tempdir(fixtureName);
  var realTempDir = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.realpath(tempDir);

  // Recursively copy the contents of the fixture to the temp directory.
  yield new Promise(function (resolve, reject) {
    (_fsExtra2 || _fsExtra()).default.copy(sourceDir, realTempDir, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return realTempDir;
}

/*
 * Copies a specified subdirectory of `spec/fixtures` to a temporary
 * location. The `fixtureName` parameter must contain a directory named
 * `.hg-rename`. After the directory specified by `fixtureName` is copied, its
 * `.hg-rename` folder will be renamed to `.hg`, so that it can act as a
 * mercurial repository.
 *
 * @param fixtureName The name of the subdirectory of the `fixtures/` directory.
 * Must contain a .hg-rename folder.
 * @returns the path to the temporary directory that this function creates.
 */
);

exports.copyFixture = copyFixture;

var copyMercurialFixture = _asyncToGenerator(function* (fixtureName, source) {
  var repo = yield copyFixture(fixtureName, source);

  var pathToFakeHg = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(repo, '.hg-rename');
  var pathToRealHg = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(repo, '.hg');
  (0, (_assert2 || _assert()).default)((_fs2 || _fs()).default.existsSync(pathToFakeHg), 'Directory: ' + pathToFakeHg + ' was not found.');

  yield new Promise(function (resolve, reject) {
    (_fsExtra2 || _fsExtra()).default.move(pathToFakeHg, pathToRealHg, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return repo;
}

/**
 * Like `copyMercurialFixture` but looks in the entire fixture directory for
 * `BUCK-rename` and `TARGETS-rename`.
 *
 * @param fixtureName The name of the subdirectory of the `fixtures/` directory.
 * @returns the path to the temporary directory that this function creates.
 */
);

exports.copyMercurialFixture = copyMercurialFixture;

var copyBuildFixture = _asyncToGenerator(function* (fixtureName, source) {
  var projectDir = yield copyFixture(fixtureName, source);
  var renames = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.glob('**/{BUCK,TARGETS}-rename', { cwd: projectDir });
  yield Promise.all(renames.map(function (name) {
    var prevName = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(projectDir, name);
    var newName = prevName.replace(/-rename$/, '');
    return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.rename(prevName, newName);
  }));
  return projectDir;
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

exports.copyBuildFixture = copyBuildFixture;

var generateFixture = _asyncToGenerator(function* (fixtureName, files) {
  (_temp2 || _temp()).default.track();

  var MAX_CONCURRENT_FILE_OPS = 100;
  var tempDir = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.tempdir(fixtureName);

  if (files == null) {
    return tempDir;
  }

  // Map -> Array with full paths
  var fileTuples = Array.from(files, function (tuple) {
    // It's our own array - it's ok to mutate it
    tuple[0] = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(tempDir, tuple[0]);
    return tuple;
  });

  // Dedupe the dirs that we have to make.
  var dirsToMake = fileTuples.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var filename = _ref2[0];
    return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(filename);
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

var _temp2;

function _temp() {
  return _temp2 = _interopRequireDefault(require('temp'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}