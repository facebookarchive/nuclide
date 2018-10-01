"use strict";

var _fs = _interopRequireDefault(require("fs"));

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

function _PathSetFactory() {
  const data = require("../lib/process/PathSetFactory");

  _PathSetFactory = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
const {
  getFilesFromGit,
  getFilesFromHg
} = _PathSetFactory().__test__;

jest.setTimeout(20000);
describe('PathSetFactory', () => {
  const TRACKED_FILE_BASE = 'tracked.js';
  const UNTRACKED_FILE_BASE = 'untracked.js';
  const IGNORED_FILE_BASE = 'ignored.js';
  let testDir;
  let trackedFile;
  let untrackedFile;
  let ignoredFile;
  beforeEach(async () => {
    const tempDir = await (0, _testHelpers().generateFixture)('fuzzy-file-search-rpc');
    testDir = _fs.default.realpathSync(tempDir);
    trackedFile = _nuclideUri().default.join(testDir, TRACKED_FILE_BASE);
    untrackedFile = _nuclideUri().default.join(testDir, UNTRACKED_FILE_BASE);
    ignoredFile = _nuclideUri().default.join(testDir, IGNORED_FILE_BASE);
  });
  describe('getFilesFromGit()', () => {
    const setUpGitRepo = async () => {
      // Add a tracked file, ignored file, and untracked file.
      await (0, _process().runCommand)('git', ['init'], {
        cwd: testDir
      }).toPromise();

      if (!testDir) {
        throw new Error("Invariant violation: \"testDir\"");
      }

      if (!trackedFile) {
        throw new Error("Invariant violation: \"trackedFile\"");
      }

      if (!ignoredFile) {
        throw new Error("Invariant violation: \"ignoredFile\"");
      }

      if (!untrackedFile) {
        throw new Error("Invariant violation: \"untrackedFile\"");
      }

      _fs.default.writeFileSync(trackedFile, '');

      _fs.default.writeFileSync(_nuclideUri().default.join(testDir, '.gitignore'), `.gitignore\n${IGNORED_FILE_BASE}`);

      _fs.default.writeFileSync(ignoredFile, '');

      await (0, _process().runCommand)('git', ['add', '*'], {
        cwd: testDir
      }).toPromise();

      _fs.default.writeFileSync(untrackedFile, '');
    };

    it('returns tracked and untracked files, but not ignored files.', async () => {
      await setUpGitRepo();
      const expectedOutput = [TRACKED_FILE_BASE, UNTRACKED_FILE_BASE];

      if (!testDir) {
        throw new Error("Invariant violation: \"testDir\"");
      }

      const fetchedFiles = await getFilesFromGit(testDir);
      expect(fetchedFiles).toEqual(expectedOutput);
    });
  });
  describe('getFilesFromHg()', () => {
    const setUpHgRepo = async () => {
      // Add a tracked file, ignored file, and untracked file.
      await (0, _process().runCommand)('hg', ['init'], {
        cwd: testDir
      }).toPromise();

      if (!testDir) {
        throw new Error("Invariant violation: \"testDir\"");
      }

      if (!trackedFile) {
        throw new Error("Invariant violation: \"trackedFile\"");
      }

      if (!ignoredFile) {
        throw new Error("Invariant violation: \"ignoredFile\"");
      }

      if (!untrackedFile) {
        throw new Error("Invariant violation: \"untrackedFile\"");
      }

      _fs.default.writeFileSync(trackedFile, '');

      _fs.default.writeFileSync(_nuclideUri().default.join(testDir, '.hgignore'), `.hgignore\n${IGNORED_FILE_BASE}`);

      _fs.default.writeFileSync(ignoredFile, '');

      await (0, _process().runCommand)('hg', ['addremove'], {
        cwd: testDir
      }).toPromise();

      _fs.default.writeFileSync(untrackedFile, '');
    };

    it('returns tracked and untracked files, but not ignored files.', async () => {
      await setUpHgRepo();
      const expectedOutput = [TRACKED_FILE_BASE, UNTRACKED_FILE_BASE];

      if (!testDir) {
        throw new Error("Invariant violation: \"testDir\"");
      }

      const fetchedFiles = await getFilesFromHg(testDir);
      expect(fetchedFiles).toEqual(expectedOutput);
    });
  });
});