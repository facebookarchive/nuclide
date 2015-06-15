'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Directory, GitRepository} = require('atom');
var fs = require('fs');
var repositoryContainsPath = require('../lib/repositoryContainsPath');
var {asyncExecute} = require('nuclide-commons');
var {MockHgService} = require('nuclide-hg-repository-base');
var {HgRepositoryClient} = require('nuclide-hg-repository-client');
var path = require('path');
var temp = require('temp').track();

describe('repositoryContainsPath', () => {
  var tempFolder;
  var repoRoot;

  beforeEach(() => {
    // Create a temporary Hg repository.
    tempFolder = temp.mkdirSync();
    repoRoot = path.join(tempFolder, 'repoRoot');
    fs.mkdirSync(repoRoot);
  });

  it('is accurate for GitRepository.', () => {
    waitsForPromise(async () => {
      // Create a temporary Git repository.
      await asyncExecute('git', ['init'], {cwd: repoRoot});

      var gitRepository = new GitRepository(repoRoot);
      // For some reason, the path returned in tests from
      // GitRepository.getWorkingDirectory is prepended with '/private',
      // which makes the Directory::contains method inaccurate in
      // `repositoryContainsPath`. We mock out the method here to get the
      // expected behavior.
      spyOn(gitRepository, 'getWorkingDirectory').andCallFake(() => {
        return repoRoot;
      });

      expect(repositoryContainsPath(gitRepository, repoRoot)).toBe(true);
      var subdir = path.join(repoRoot, 'subdir');
      expect(repositoryContainsPath(gitRepository, subdir)).toBe(true);
      var parentDir = path.resolve(tempFolder, '..');
      expect(repositoryContainsPath(gitRepository, parentDir)).toBe(false);
    });
  });

  it('is accurate for HgRepositoryClient.', () => {
    waitsForPromise(async () => {
      // Create temporary Hg repository.
      await asyncExecute('hg', ['init'], {cwd: repoRoot});

      var hgRepository = new HgRepositoryClient(
        /* repoPath */ path.join(repoRoot, '.hg'),
        /* hgService */ new MockHgService(),
        /* options */  {
          originURL: 'testURL',
          workingDirectory: new Directory(repoRoot),
          projectRootDirectory: new Directory(repoRoot),
        }
      );

      expect(repositoryContainsPath(hgRepository, repoRoot)).toBe(true);
      var subdir = path.join(repoRoot, 'subdir');
      expect(repositoryContainsPath(hgRepository, subdir)).toBe(true);
      var parentDir = path.resolve(tempFolder, '..');
      expect(repositoryContainsPath(hgRepository, parentDir)).toBe(false);
    });
  });
});
