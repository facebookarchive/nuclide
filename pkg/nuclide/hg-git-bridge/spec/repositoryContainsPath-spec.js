'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {GitRepository} = require('atom');
var fs = require('fs');
var repositoryContainsPath = require('../lib/repositoryContainsPath');
var {asyncExecute} = require('nuclide-commons');
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
      // TODO (t7348849) Move HgRepositoryClient to hg-repository-base so it
      // can be required here for the test. Then write this test, which will
      // look like the test for Git above.
    });
  });
});
