'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  activateAllPackages,
  copyMercurialFixture,
  deactivateAllPackages,
} from '../pkg/nuclide/integration-test-helpers';
import path from 'path';
import invariant from 'assert';

describe('Mercurial Repository Integration Tests', () => {
  beforeEach(() => {
    waitsForPromise({timeout: 240000}, async () => {
      await activateAllPackages();
    });
  });

  it('adds opens and removes project without errors', () => {
    waitsForPromise(async () => {
      spyOn(console, 'error');
      // Copy mercurial project to temporary directory.
      const repoPath = await copyMercurialFixture('hg_repo_1');
      // Add this directory as a new project in atom.
      atom.project.setPaths([repoPath]);
      // Open a file within this project.
      await atom.workspace.open(path.join(repoPath, 'test.txt'));
      // Verify mercurialness.
      const respositories = atom.project.getRepositories();
      expect(respositories.length).toBe(1);
      const repository = respositories[0];
      invariant(repository);
      expect(repository.getPath().endsWith('/.hg')).toBe(true);
      // Remove project
      atom.project.removePath(repoPath);
      expect(console.error).not.toHaveBeenCalled(); // eslint-disable-line no-console
    });
  });

  afterEach(() => {
    deactivateAllPackages();
  });
});
