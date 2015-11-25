'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgService as HgServiceType} from 'nuclide-hg-repository-base/lib/HgService.js';

import {Directory, GitRepository} from 'atom';
import fs from 'fs';
import repositoryContainsPath from '../lib/repositoryContainsPath';
import {asyncExecute} from 'nuclide-commons';
import {MockHgService} from 'nuclide-hg-repository-base';
import {HgRepositoryClient} from 'nuclide-hg-repository-client';
import path from 'path';

const temp = require('temp').track();

describe('repositoryContainsPath', () => {
  let tempFolder: string = (null: any);
  let repoRoot: string = (null: any);

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

      const gitRepository = new GitRepository(repoRoot);
      // For some reason, the path returned in tests from
      // GitRepository.getWorkingDirectory is prepended with '/private',
      // which makes the Directory::contains method inaccurate in
      // `repositoryContainsPath`. We mock out the method here to get the
      // expected behavior.
      spyOn(gitRepository, 'getWorkingDirectory').andCallFake(() => {
        return repoRoot;
      });

      expect(repositoryContainsPath(gitRepository, repoRoot)).toBe(true);
      const subdir = path.join(repoRoot, 'subdir');
      expect(repositoryContainsPath(gitRepository, subdir)).toBe(true);
      const parentDir = path.resolve(tempFolder, '..');
      expect(repositoryContainsPath(gitRepository, parentDir)).toBe(false);
    });
  });

  it('is accurate for HgRepositoryClient.', () => {
    waitsForPromise(async () => {
      // Create temporary Hg repository.
      await asyncExecute('hg', ['init'], {cwd: repoRoot});

      const mockService = new MockHgService();
      const mockHgService: HgServiceType = (mockService: any);
      const hgRepositoryClient = new HgRepositoryClient(
        /* repoPath */ path.join(repoRoot, '.hg'),
        /* hgService */ mockHgService,
        /* options */  {
          originURL: 'testURL',
          workingDirectory: new Directory(repoRoot),
          projectRootDirectory: new Directory(repoRoot),
        }
      );

      const hgRepository: atom$Repository = (hgRepositoryClient: any);

      expect(repositoryContainsPath(hgRepository, repoRoot)).toBe(true);
      const subdir = path.join(repoRoot, 'subdir');
      expect(repositoryContainsPath(hgRepository, subdir)).toBe(true);
      const parentDir = path.resolve(tempFolder, '..');
      expect(repositoryContainsPath(hgRepository, parentDir)).toBe(false);
    });
  });
});
