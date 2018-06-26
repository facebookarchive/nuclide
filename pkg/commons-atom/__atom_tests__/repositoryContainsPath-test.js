'use strict';

var _atom = require('atom');

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _MockHgService;

function _load_MockHgService() {
  return _MockHgService = _interopRequireDefault(require('../../nuclide-hg-rpc/__mocks__/MockHgService'));
}

var _nuclideHgRepositoryClient;

function _load_nuclideHgRepositoryClient() {
  return _nuclideHgRepositoryClient = require('../../nuclide-hg-repository-client');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
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

describe('repositoryContainsPath', () => {
  let tempFolder = null;
  let repoRoot = null;

  beforeEach(async () => {
    // Create a temporary Hg repository.
    await (async () => {
      tempFolder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('hg-git-bridge', new Map([['repoRoot/file.txt', 'hello world']]));
      repoRoot = (_nuclideUri || _load_nuclideUri()).default.join(tempFolder, 'repoRoot');
    })();
  });

  it('is accurate for GitRepository.', async () => {
    await (async () => {
      // Create a temporary Git repository.
      await (0, (_process || _load_process()).runCommand)('git', ['init'], { cwd: repoRoot }).toPromise();

      const gitRepository = new _atom.GitRepository(repoRoot);
      // For some reason, the path returned in tests from
      // GitRepository.getWorkingDirectory is prepended with '/private',
      // which makes the Directory::contains method inaccurate in
      // `repositoryContainsPath`. We mock out the method here to get the
      // expected behavior.
      jest.spyOn(gitRepository, 'getWorkingDirectory').mockImplementation(() => {
        return repoRoot;
      });

      expect((0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryContainsPath)(gitRepository, repoRoot)).toBe(true);
      const subdir = (_nuclideUri || _load_nuclideUri()).default.join(repoRoot, 'subdir');
      expect((0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryContainsPath)(gitRepository, subdir)).toBe(true);
      const parentDir = (_nuclideUri || _load_nuclideUri()).default.resolve(tempFolder, '..');
      expect((0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryContainsPath)(gitRepository, parentDir)).toBe(false);
    })();
  });

  it('is accurate for HgRepositoryClient.', async () => {
    await (async () => {
      // Create temporary Hg repository.
      await (0, (_process || _load_process()).runCommand)('hg', ['init'], { cwd: repoRoot }).toPromise();

      const mockService = new (_MockHgService || _load_MockHgService()).default();
      const mockHgService = mockService;
      const hgRepositoryClient = new (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient(
      /* repoPath */
      (_nuclideUri || _load_nuclideUri()).default.join(repoRoot, '.hg'),
      /* hgService */
      mockHgService,
      /* options */
      {
        originURL: 'testURL',
        workingDirectoryPath: repoRoot,
        projectDirectoryPath: repoRoot
      });

      const hgRepository = hgRepositoryClient;

      expect((0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryContainsPath)(hgRepository, repoRoot)).toBe(true);
      const subdir = (_nuclideUri || _load_nuclideUri()).default.join(repoRoot, 'subdir');
      expect((0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryContainsPath)(hgRepository, subdir)).toBe(true);
      const parentDir = (_nuclideUri || _load_nuclideUri()).default.resolve(tempFolder, '..');
      expect((0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryContainsPath)(hgRepository, parentDir)).toBe(false);
    })();
  });
});