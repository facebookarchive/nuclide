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
  var fixturePath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join('fixtures', fixtureName);
  var fixtureRoot = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.findNearestFile(fixturePath, startDir);
  (0, (_assert || _load_assert()).default)(fixtureRoot != null, 'Could not find source fixture.');
  var sourceDir = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(fixtureRoot, fixturePath);

  (_temp || _load_temp()).default.track();
  var tempDir = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.tempdir(fixtureName);
  var realTempDir = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.realpath(tempDir);

  // Recursively copy the contents of the fixture to the temp directory.
  yield new Promise(function (resolve, reject) {
    (_fsExtra || _load_fsExtra()).default.copy(sourceDir, realTempDir, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return realTempDir;
}

/**
 * Generates an hg repository with the following structure:
 *
 * @ second commit
 * |
 * |
 * o first commit
 *
 * @returns the path to the temporary directory that this function creates.
 */
);

exports.copyFixture = copyFixture;

var generateHgRepo1Fixture = _asyncToGenerator(function* () {
  var testTxt = 'this is a test file\nline 2\n\n  indented line\n';
  var tempDir = yield generateFixture('hg_repo_1', new Map([['.watchmanconfig', '{}\n'], ['test.txt', testTxt]]));
  var repoPath = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.realpath(tempDir);
  yield (0, (_commonsNodeProcess || _load_commonsNodeProcess()).checkOutput)('hg', ['init'], { cwd: repoPath });
  yield (0, (_commonsNodeProcess || _load_commonsNodeProcess()).checkOutput)('hg', ['commit', '-A', '-m', 'first commit'], { cwd: repoPath });
  yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.writeFile((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(repoPath, 'test.txt'), testTxt + '\nthis line added on second commit\n');
  yield (0, (_commonsNodeProcess || _load_commonsNodeProcess()).checkOutput)('hg', ['commit', '-A', '-m', 'second commit'], { cwd: repoPath });
  return repoPath;
}

/**
 * Generates an hg repository with the following structure:
 *
 * @ add .arcconfig to select mercurial compare default
 * |
 * |
 * o second commit
 * |
 * |
 * o first commit
 *
 * @returns the path to the temporary directory that this function creates.
 */
);

exports.generateHgRepo1Fixture = generateHgRepo1Fixture;

var generateHgRepo2Fixture = _asyncToGenerator(function* () {
  var testTxt = 'this is a test file\nline 2\n\n  indented line\n';
  var tempDir = yield generateFixture('hg_repo_2', new Map([['.watchmanconfig', '{}\n'], ['test.txt', testTxt]]));
  var repoPath = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.realpath(tempDir);
  yield (0, (_commonsNodeProcess || _load_commonsNodeProcess()).checkOutput)('hg', ['init'], { cwd: repoPath });
  yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.writeFile((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(repoPath, '.hg/hgrc'), '[paths]\ndefault = .\n');
  yield (0, (_commonsNodeProcess || _load_commonsNodeProcess()).checkOutput)('hg', ['commit', '-A', '-m', 'first commit'], { cwd: repoPath });
  yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.writeFile((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(repoPath, 'test.txt'), testTxt + '\nthis line added on second commit\n');
  yield (0, (_commonsNodeProcess || _load_commonsNodeProcess()).checkOutput)('hg', ['commit', '-A', '-m', 'second commit'], { cwd: repoPath });
  yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.writeFile((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(repoPath, '.arcconfig'), '{\n  "arc.feature.start.default": "master"\n}\n');
  yield (0, (_commonsNodeProcess || _load_commonsNodeProcess()).checkOutput)('hg', ['commit', '-A', '-m', 'add .arcconfig to set base'], { cwd: repoPath });
  yield (0, (_commonsNodeProcess || _load_commonsNodeProcess()).checkOutput)('hg', ['bookmark', '--rev', '.~2', 'master', '--config', 'remotenames.disallowedbookmarks='], { cwd: repoPath });
  return repoPath;
}

/**
 * Like `copyMercurialFixture` but looks in the entire fixture directory for
 * `BUCK-rename` and `TARGETS-rename` and inserts a .buckversion if applicable.
 *
 * @param fixtureName The name of the subdirectory of the `fixtures/` directory.
 * @returns the path to the temporary directory that this function creates.
 */
);

exports.generateHgRepo2Fixture = generateHgRepo2Fixture;

var copyBuildFixture = _asyncToGenerator(function* (fixtureName, source) {
  var projectDir = yield copyFixture(fixtureName, source);

  yield Promise.all([copyBuckVersion(projectDir), renameBuckFiles(projectDir)]);

  return projectDir;
});

exports.copyBuildFixture = copyBuildFixture;

var copyBuckVersion = _asyncToGenerator(function* (projectDir) {
  var versionFile = '.buckversion';
  var buckVersionDir = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.findNearestFile(versionFile, __dirname);
  if (buckVersionDir != null) {
    yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.copy((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(buckVersionDir, versionFile), (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(projectDir, versionFile));
  }
});

var renameBuckFiles = _asyncToGenerator(function* (projectDir) {
  var renames = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.glob('**/{BUCK,TARGETS}-rename', { cwd: projectDir });
  yield Promise.all(renames.map(function (name) {
    var prevName = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(projectDir, name);
    var newName = prevName.replace(/-rename$/, '');
    return (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.rename(prevName, newName);
  }));
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

var generateFixture = _asyncToGenerator(function* (fixtureName, files) {
  (_temp || _load_temp()).default.track();

  var MAX_CONCURRENT_FILE_OPS = 100;
  var tempDir = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.tempdir(fixtureName);

  if (files == null) {
    return tempDir;
  }

  // Map -> Array with full paths
  var fileTuples = Array.from(files, function (tuple) {
    // It's our own array - it's ok to mutate it
    tuple[0] = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(tempDir, tuple[0]);
    return tuple;
  });

  // Dedupe the dirs that we have to make.
  var dirsToMake = fileTuples.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var filename = _ref2[0];
    return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(filename);
  }).filter(function (dirname, i, arr) {
    return arr.indexOf(dirname) === i;
  });

  yield (0, (_commonsNodePromise || _load_commonsNodePromise()).asyncLimit)(dirsToMake, MAX_CONCURRENT_FILE_OPS, function (dirname) {
    return (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.mkdirp(dirname);
  });

  yield (0, (_commonsNodePromise || _load_commonsNodePromise()).asyncLimit)(fileTuples, MAX_CONCURRENT_FILE_OPS, function (_ref3) {
    var _ref32 = _slicedToArray(_ref3, 2);

    var filename = _ref32[0];
    var contents = _ref32[1];

    // We can't use fsPromise/fs-plus because it does too much extra work.
    // They call `mkdirp` before `writeFile`. We know that the target dir
    // exists, so we can optimize by going straight to `fs`. When you're
    // making 10k files, this adds ~500ms.
    return new Promise(function (resolve, reject) {
      (_fs || _load_fs()).default.writeFile(filename, contents || '', function (err) {
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

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('fs'));
}

var _fsExtra;

function _load_fsExtra() {
  return _fsExtra = _interopRequireDefault(require('fs-extra'));
}

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodePromise;

function _load_commonsNodePromise() {
  return _commonsNodePromise = require('../../commons-node/promise');
}

var _commonsNodeProcess;

function _load_commonsNodeProcess() {
  return _commonsNodeProcess = require('../../commons-node/process');
}