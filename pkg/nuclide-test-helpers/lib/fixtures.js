'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.copyBuildFixture = exports.generateHgRepo2Fixture = exports.generateHgRepo1Fixture = exports.copyFixture = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

// This is in devDependencies. This file should only be used in tests.
// eslint-disable-next-line rulesdir/no-unresolved
let copyFixture = exports.copyFixture = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fixtureName, startDir) {
    const fixturePath = (_nuclideUri || _load_nuclideUri()).default.join('fixtures', fixtureName);
    const fixtureRoot = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(fixturePath, startDir);

    if (!(fixtureRoot != null)) {
      throw new Error('Could not find source fixture.');
    }

    const sourceDir = (_nuclideUri || _load_nuclideUri()).default.join(fixtureRoot, fixturePath);

    (_temp || _load_temp()).default.track();
    const tempDir = yield (_fsPromise || _load_fsPromise()).default.tempdir(fixtureName);
    const realTempDir = yield (_fsPromise || _load_fsPromise()).default.realpath(tempDir);

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
  });

  return function copyFixture(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

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


let generateHgRepo1Fixture = exports.generateHgRepo1Fixture = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    const testTxt = 'this is a test file\nline 2\n\n  indented line\n';
    const tempDir = yield (0, (_testHelpers || _load_testHelpers()).generateFixture)('hg_repo_1', new Map([['.watchmanconfig', '{}\n'], ['test.txt', testTxt]]));
    const repoPath = yield (_fsPromise || _load_fsPromise()).default.realpath(tempDir);
    yield (0, (_process || _load_process()).runCommand)('hg', ['init'], { cwd: repoPath }).toPromise();
    yield (_fsPromise || _load_fsPromise()).default.writeFile((_nuclideUri || _load_nuclideUri()).default.join(repoPath, '.hg', 'hgrc'), '[ui]\nusername = Test <test@mail.com>\n');
    yield (0, (_process || _load_process()).runCommand)('hg', ['commit', '-A', '-m', 'first commit'], {
      cwd: repoPath
    }).toPromise();
    yield (_fsPromise || _load_fsPromise()).default.writeFile((_nuclideUri || _load_nuclideUri()).default.join(repoPath, 'test.txt'), testTxt + '\nthis line added on second commit\n');
    yield (0, (_process || _load_process()).runCommand)('hg', ['commit', '-A', '-m', 'second commit'], {
      cwd: repoPath
    }).toPromise();
    return repoPath;
  });

  return function generateHgRepo1Fixture() {
    return _ref2.apply(this, arguments);
  };
})();

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


let generateHgRepo2Fixture = exports.generateHgRepo2Fixture = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* () {
    const testTxt = 'this is a test file\nline 2\n\n  indented line\n';
    const tempDir = yield (0, (_testHelpers || _load_testHelpers()).generateFixture)('hg_repo_2', new Map([['.watchmanconfig', '{}\n'], ['test.txt', testTxt]]));
    const repoPath = yield (_fsPromise || _load_fsPromise()).default.realpath(tempDir);
    yield (0, (_process || _load_process()).runCommand)('hg', ['init'], { cwd: repoPath }).toPromise();
    yield (_fsPromise || _load_fsPromise()).default.writeFile((_nuclideUri || _load_nuclideUri()).default.join(repoPath, '.hg', 'hgrc'), '[paths]\ndefault = .\n[ui]\nusername = Test <test@mail.com>\n');
    yield (0, (_process || _load_process()).runCommand)('hg', ['commit', '-A', '-m', 'first commit'], {
      cwd: repoPath
    }).toPromise();
    yield (_fsPromise || _load_fsPromise()).default.writeFile((_nuclideUri || _load_nuclideUri()).default.join(repoPath, 'test.txt'), testTxt + '\nthis line added on second commit\n');
    yield (0, (_process || _load_process()).runCommand)('hg', ['commit', '-A', '-m', 'second commit'], {
      cwd: repoPath
    }).toPromise();
    yield (_fsPromise || _load_fsPromise()).default.writeFile((_nuclideUri || _load_nuclideUri()).default.join(repoPath, '.arcconfig'), '{\n  "arc.feature.start.default": "master"\n}\n');
    yield (0, (_process || _load_process()).runCommand)('hg', ['commit', '-A', '-m', 'add .arcconfig to set base'], {
      cwd: repoPath
    }).toPromise();
    yield (0, (_process || _load_process()).runCommand)('hg', ['bookmark', '--rev', '.~2', 'master', '--config', 'remotenames.disallowedbookmarks='], { cwd: repoPath }).toPromise();
    return repoPath;
  });

  return function generateHgRepo2Fixture() {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Like `copyMercurialFixture` but looks in the entire fixture directory for
 * `BUCK-rename` and `TARGETS-rename` and inserts a .buckversion if applicable.
 *
 * @param fixtureName The name of the subdirectory of the `fixtures/` directory.
 * @returns the path to the temporary directory that this function creates.
 */


let copyBuildFixture = exports.copyBuildFixture = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (fixtureName, source) {
    const projectDir = yield copyFixture(fixtureName, source);

    yield Promise.all([copyBuckVersion(projectDir), renameBuckFiles(projectDir)]);

    return projectDir;
  });

  return function copyBuildFixture(_x3, _x4) {
    return _ref4.apply(this, arguments);
  };
})();

let copyBuckVersion = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (projectDir) {
    const versionFile = '.buckversion';
    const buckVersionDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(versionFile, __dirname);
    if (buckVersionDir != null) {
      yield (_fsPromise || _load_fsPromise()).default.copy((_nuclideUri || _load_nuclideUri()).default.join(buckVersionDir, versionFile), (_nuclideUri || _load_nuclideUri()).default.join(projectDir, versionFile));
    }
  });

  return function copyBuckVersion(_x5) {
    return _ref5.apply(this, arguments);
  };
})();

let renameBuckFiles = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (projectDir) {
    const renames = yield (_fsPromise || _load_fsPromise()).default.glob('**/{BUCK,TARGETS}-rename', {
      cwd: projectDir
    });
    yield Promise.all(renames.map(function (name) {
      const prevName = (_nuclideUri || _load_nuclideUri()).default.join(projectDir, name);
      const newName = prevName.replace(/-rename$/, '');
      return (_fsPromise || _load_fsPromise()).default.rename(prevName, newName);
    }));
  });

  return function renameBuckFiles(_x6) {
    return _ref6.apply(this, arguments);
  };
})();

var _fsExtra;

function _load_fsExtra() {
  return _fsExtra = _interopRequireDefault(require('fs-extra'));
}

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('nuclide-commons/test-helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }