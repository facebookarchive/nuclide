"use strict";

var _atom = require("atom");

function _nuclideVcsBase() {
  const data = require("../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
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

function _MockHgService() {
  const data = _interopRequireDefault(require("../../nuclide-hg-rpc/__mocks__/MockHgService"));

  _MockHgService = function () {
    return data;
  };

  return data;
}

function _nuclideHgRepositoryClient() {
  const data = require("../../nuclide-hg-repository-client");

  _nuclideHgRepositoryClient = function () {
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
 * @emails oncall+nuclide
 */
describe('repositoryContainsPath', () => {
  let tempFolder = null;
  let repoRoot = null;
  beforeEach(async () => {
    tempFolder = await (0, _testHelpers().generateFixture)('hg-git-bridge', new Map([['repoRoot/file.txt', 'hello world']]));
    repoRoot = _nuclideUri().default.join(tempFolder, 'repoRoot');
  });
  it('is accurate for GitRepository.', async () => {
    await (async () => {
      // Create a temporary Git repository.
      await (0, _process().runCommand)('git', ['init'], {
        cwd: repoRoot
      }).toPromise();
      const gitRepository = new _atom.GitRepository(repoRoot); // For some reason, the path returned in tests from
      // GitRepository.getWorkingDirectory is prepended with '/private',
      // which makes the Directory::contains method inaccurate in
      // `repositoryContainsPath`. We mock out the method here to get the
      // expected behavior.

      jest.spyOn(gitRepository, 'getWorkingDirectory').mockImplementation(() => {
        return repoRoot;
      });
      expect((0, _nuclideVcsBase().repositoryContainsPath)(gitRepository, repoRoot)).toBe(true);

      const subdir = _nuclideUri().default.join(repoRoot, 'subdir');

      expect((0, _nuclideVcsBase().repositoryContainsPath)(gitRepository, subdir)).toBe(true);

      const parentDir = _nuclideUri().default.resolve(tempFolder, '..');

      expect((0, _nuclideVcsBase().repositoryContainsPath)(gitRepository, parentDir)).toBe(false);
    })();
  });
  it('is accurate for HgRepositoryClient.', async () => {
    // Create temporary Hg repository.
    await (0, _process().runCommand)('hg', ['init'], {
      cwd: repoRoot
    }).toPromise();
    const mockService = new (_MockHgService().default)();
    const mockHgService = mockService;
    const hgRepositoryClient = new (_nuclideHgRepositoryClient().HgRepositoryClient)(
    /* repoPath */
    _nuclideUri().default.join(repoRoot, '.hg'),
    /* hgService */
    mockHgService,
    /* options */
    {
      originURL: 'testURL',
      workingDirectoryPath: repoRoot,
      projectDirectoryPath: repoRoot
    });
    const hgRepository = hgRepositoryClient;
    expect((0, _nuclideVcsBase().repositoryContainsPath)(hgRepository, repoRoot)).toBe(true);

    const subdir = _nuclideUri().default.join(repoRoot, 'subdir');

    expect((0, _nuclideVcsBase().repositoryContainsPath)(hgRepository, subdir)).toBe(true);

    const parentDir = _nuclideUri().default.resolve(tempFolder, '..');

    expect((0, _nuclideVcsBase().repositoryContainsPath)(hgRepository, parentDir)).toBe(false);
  });
});