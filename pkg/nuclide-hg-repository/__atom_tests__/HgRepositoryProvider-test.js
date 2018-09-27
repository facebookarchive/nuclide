"use strict";

var _atom = require("atom");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _HgRepositoryProvider() {
  const data = _interopRequireDefault(require("../lib/HgRepositoryProvider"));

  _HgRepositoryProvider = function () {
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

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
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
describe('HgRepositoryProvider', () => {
  const provider = new (_HgRepositoryProvider().default)();
  it('shares underlying repository for multiple directories in the same repo', async () => {
    const tempDir = await (0, _testHelpers().generateFixture)('hg_repo_provider_test', new Map([['folder/foo', 'foo']]));
    const repoPath = await _fsPromise().default.realpath(tempDir);
    await (0, _process().runCommand)('hg', ['init'], {
      cwd: repoPath
    }).toPromise();

    const folderPath = _nuclideUri().default.join(repoPath, 'folder');

    const baseDirectory = new _atom.Directory(repoPath);
    const folderDirectory = new _atom.Directory(folderPath);
    const baseRepo = provider.repositoryForDirectorySync(baseDirectory);
    const folderRepo = provider.repositoryForDirectorySync(folderDirectory);

    if (!(baseRepo != null && folderRepo != null)) {
      throw new Error("Invariant violation: \"baseRepo != null && folderRepo != null\"");
    }

    expect(baseRepo.getProjectDirectory()).not.toBe(folderRepo.getProjectDirectory()); // compare private members to guarantee they have the same underlying HgRepositoryClient
    // arbitrarily chose _emitter

    expect(baseRepo.getRootRepoClient()).toBe(folderRepo.getRootRepoClient());
    let folderRepoDestroyed = false;
    let folderRepoRootDestroyed = false;
    folderRepo.onDidDestroy(() => {
      folderRepoDestroyed = true;
    });
    folderRepo.getRootRepoClient().onDidDestroy(() => {
      folderRepoRootDestroyed = true;
    });
    folderRepo.destroy();
    expect(folderRepoDestroyed).toBe(true);
    expect(folderRepoRootDestroyed).toBe(false);
    const folderRepo2 = provider.repositoryForDirectorySync(folderDirectory);

    if (!(folderRepo2 != null)) {
      throw new Error("Invariant violation: \"folderRepo2 != null\"");
    }

    expect(baseRepo.getRootRepoClient()).toBe(folderRepo2.getRootRepoClient());
    folderRepo2.destroy();
    baseRepo.destroy(); // refCount should hit 0 and remove the original underlying HgRepositoryClient
    // thus triggering the onDidDestroy for the underlying repo

    expect(folderRepoRootDestroyed).toBe(true);
    const baseRepo2 = provider.repositoryForDirectorySync(baseDirectory);

    if (!(baseRepo2 != null)) {
      throw new Error("Invariant violation: \"baseRepo2 != null\"");
    }

    expect(baseRepo.getRootRepoClient()).not.toBe(baseRepo2.getRootRepoClient());
    expect(baseRepo.getProjectDirectory()).toBe(baseRepo2.getProjectDirectory());
    baseRepo2.destroy();
    await _fsPromise().default.rimraf(repoPath);
  });
});