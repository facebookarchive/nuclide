"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.copyFixture = copyFixture;
exports.generateHgRepo1Fixture = generateHgRepo1Fixture;
exports.generateHgRepo2Fixture = generateHgRepo2Fixture;
exports.generateHgRepo3Fixture = generateHgRepo3Fixture;
exports.overwriteFileWithTestContent = overwriteFileWithTestContent;
exports.generateHgRepo4Fixture = generateHgRepo4Fixture;
exports.copyBuildFixture = copyBuildFixture;

function _fsExtra() {
  const data = _interopRequireDefault(require("fs-extra"));

  _fsExtra = function () {
    return data;
  };

  return data;
}

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// eslint-disable-next-line nuclide-internal/no-unresolved
const testFileContent = 'this is the base file\nline 2\n\n  indented line\n';
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

async function copyFixture(fixtureName, startDir) {
  const fixturePath = _nuclideUri().default.join('fixtures', fixtureName);

  const fixtureRoot = await _fsPromise().default.findNearestFile(fixturePath, startDir);

  if (!(fixtureRoot != null)) {
    throw new Error('Could not find source fixture.');
  }

  const sourceDir = _nuclideUri().default.join(fixtureRoot, fixturePath);

  _temp().default.track();

  const tempDir = await _fsPromise().default.tempdir(fixtureName);
  const realTempDir = await _fsPromise().default.realpath(tempDir); // Recursively copy the contents of the fixture to the temp directory.

  await new Promise((resolve, reject) => {
    _fsExtra().default.copy(sourceDir, realTempDir, err => {
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


async function generateHgRepo1Fixture() {
  const testTxt = 'this is a test file\nline 2\n\n  indented line\n';
  const tempDir = await (0, _testHelpers().generateFixture)('hg_repo_1', new Map([['.watchmanconfig', '{}\n'], ['test.txt', testTxt]]));
  const repoPath = await _fsPromise().default.realpath(tempDir);
  await (0, _process().runCommand)('hg', ['init'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, '.hg', 'hgrc'), '[ui]\nusername = Test <test@mail.com>\n');
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'first commit'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, 'test.txt'), testTxt + '\nthis line added on second commit\n');
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'second commit'], {
    cwd: repoPath
  }).toPromise();
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


async function generateHgRepo2Fixture() {
  const testTxt = 'this is a test file\nline 2\n\n  indented line\n';
  const tempDir = await (0, _testHelpers().generateFixture)('hg_repo_2', new Map([['.watchmanconfig', '{}\n'], ['test.txt', testTxt]]));
  const repoPath = await _fsPromise().default.realpath(tempDir);
  await (0, _process().runCommand)('hg', ['init'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, '.hg', 'hgrc'), '[paths]\ndefault = .\n[ui]\nusername = Test <test@mail.com>\n');
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'first commit'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, 'test.txt'), testTxt + '\nthis line added on second commit\n');
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'second commit'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, '.arcconfig'), '{\n  "arc.feature.start.default": "master"\n}\n');
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'add .arcconfig to set base'], {
    cwd: repoPath
  }).toPromise();
  await (0, _process().runCommand)('hg', ['bookmark', '--rev', '.~2', 'master', '--config', 'remotenames.disallowedbookmarks='], {
    cwd: repoPath
  }).toPromise();
  return repoPath;
}
/**
 * Generates an hg repository with the following structure:
 *
 *   o second commit [secondCommit]
 *  /
 * |
 * |
 * | o first commit [firstCommit]
 * |/
 * |
 * |
 * o base commit
 *
 * @returns the path to the temporary directory that this function creates.
 */


async function generateHgRepo3Fixture(fileName = 'temp.txt') {
  const testTxt = 'this is the base file\nline 2\n\n  indented line\n';
  const tempDir = await (0, _testHelpers().generateFixture)('hg_repo_3', new Map([['.watchmanconfig', '{}\n'], [fileName, testTxt]]));
  const repoPath = await _fsPromise().default.realpath(tempDir);
  await (0, _process().runCommand)('hg', ['init'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, '.hg', 'hgrc'), '[paths]\ndefault = .\n[ui]\nusername = Test <test@mail.com>\n');
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, fileName), testTxt);
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'base commit'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, fileName), testTxt + '\nthis line added on first commit\n');
  await (0, _process().runCommand)('hg', ['bookmark', 'firstCommit'], {
    cwd: repoPath
  }).toPromise();
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'first commit'], {
    cwd: repoPath
  }).toPromise();
  await (0, _process().runCommand)('hg', ['prev'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, fileName), testTxt + '\nthis line added on second commit\n');
  await (0, _process().runCommand)('hg', ['bookmark', 'secondCommit'], {
    cwd: repoPath
  }).toPromise();
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'second commit'], {
    cwd: repoPath
  }).toPromise();
  return repoPath;
}

async function overwriteFileWithTestContent(fileName, repoPath, fileContent = testFileContent) {
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, fileName), fileContent);
}
/**
 * Generates an hg repository with the following structure:
 *
 * @ other commit
 * |
 * |  o commit 4   <- you are here
 * |  |
 * |  o commit 3
 * |  |
 * |  o commit 2
 * |  |
 * |  o commit 1
 * | /
 * |/
 * o base commit
 *
 * @returns the path to the temporary directory that this function creates.
 */


async function generateHgRepo4Fixture() {
  const testTxt = 'this is a test file\n';
  const tempDir = await (0, _testHelpers().generateFixture)('hg_repo_4', new Map([['.watchmanconfig', '{}\n'], ['test.txt', testTxt], ['test_1.txt', ''], ['test_2.txt', ''], ['test_3.txt', ''], ['test_4.txt', '']]));
  const repoPath = await _fsPromise().default.realpath(tempDir);
  await (0, _process().runCommand)('hg', ['init'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, '.hg', 'hgrc'), '[paths]\ndefault = .\n[ui]\nusername = Test <test@mail.com>\n\n' + '[extensions]\nhistedit =\nfbhistedit =\n');
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'base commit'], {
    cwd: repoPath
  }).toPromise(); // make the base a public commit so that smartlog shows all children

  await (0, _process().runCommand)('hg', ['phase', '-p'], {
    cwd: repoPath
  }).toPromise();
  await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, 'test.txt'), testTxt + '\n\nmore added here');
  await (0, _process().runCommand)('hg', ['commit', '-A', '-m', 'other commit'], {
    cwd: repoPath
  }).toPromise();
  await (0, _process().runCommand)('hg', ['update', '.^'], {
    cwd: repoPath
  }).toPromise();

  for (let i = 1; i < 5; i++) {
    // eslint-disable-next-line no-await-in-loop
    await _fsPromise().default.writeFile(_nuclideUri().default.join(repoPath, `test_${i}.txt`), `this is test file ${i}`); // eslint-disable-next-line no-await-in-loop

    await (0, _process().runCommand)('hg', ['commit', '-A', '-m', `commit ${i}`], {
      cwd: repoPath
    }).toPromise();
  }

  return repoPath;
}
/**
 * Like `copyMercurialFixture` but looks in the entire fixture directory for
 * `BUCK-rename` and `TARGETS-rename` and inserts a .buckversion if applicable.
 *
 * @param fixtureName The name of the subdirectory of the `fixtures/` directory.
 * @returns the path to the temporary directory that this function creates.
 */


async function copyBuildFixture(fixtureName, source) {
  const projectDir = await copyFixture(fixtureName, source);
  await Promise.all([copyBuckVersion(projectDir), renameBuckFiles(projectDir)]);
  return projectDir;
}

async function copyBuckVersion(projectDir) {
  const versionFile = '.buckversion';
  const buckVersionDir = await _fsPromise().default.findNearestFile(versionFile, __dirname);

  if (buckVersionDir != null) {
    await _fsPromise().default.copy(_nuclideUri().default.join(buckVersionDir, versionFile), _nuclideUri().default.join(projectDir, versionFile));
  }
}

async function renameBuckFiles(projectDir) {
  const renames = await _fsPromise().default.glob('**/{BUCK,TARGETS}-rename', {
    cwd: projectDir
  });
  await Promise.all(renames.map(name => {
    const prevName = _nuclideUri().default.join(projectDir, name);

    const newName = prevName.replace(/-rename$/, '');
    return _fsPromise().default.mv(prevName, newName);
  }));
}