'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from '../pkg/nuclide-hg-repository-client';
import {
  activateAllPackages,
  copyMercurialFixture,
  deactivateAllPackages,
  jasmineIntegrationTestSetup,
} from '../pkg/nuclide-integration-test-helpers';
import {repositoryForPath} from '../pkg/nuclide-hg-git-bridge';
import {
  fetchFileContentAtRevision,
  fetchFilesChangedAtRevision,
} from '../pkg/nuclide-hg-repository-base/lib/hg-revision-state-helpers';
import {fsPromise} from '../pkg/nuclide-commons';
import path from 'path';
import invariant from 'assert';

describe('Mercurial Repository Integration Tests', () => {
  beforeEach(() => {
    waitsForPromise({timeout: 240000}, async () => {
      jasmineIntegrationTestSetup();
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

  it('can commit changes', () => {
    waitsForPromise(async () => {
      const repoPath = await copyMercurialFixture('hg_repo_1');
      const filePath = path.join(repoPath, 'test.txt');
      atom.project.setPaths([repoPath]);
      const hgRepository = ((repositoryForPath(repoPath): any): HgRepositoryClient);
      invariant(hgRepository != null);
      await fsPromise.writeFile(filePath, 'new text');
      await hgRepository.commit('commit msg');
      const changes = await fetchFilesChangedAtRevision('.', repoPath);
      invariant(changes != null);
      expect(changes.all.length).toEqual(1);
      expect(changes.modified.length).toEqual(1);
      expect(changes.modified[0]).toEqual(filePath);
      const content = await fetchFileContentAtRevision(filePath, '.', repoPath);
      expect(content).toEqual('new text');
    });
  });

  it('can amend changes', () => {
    waitsForPromise(async () => {
      const repoPath = await copyMercurialFixture('hg_repo_1');
      const filePath = path.join(repoPath, 'test.txt');
      atom.project.setPaths([repoPath]);
      const hgRepository = ((repositoryForPath(repoPath): any): HgRepositoryClient);
      invariant(hgRepository != null);
      await fsPromise.writeFile(filePath, 'new text 1');
      await hgRepository.commit('commit msg 1');
      await fsPromise.writeFile(filePath, 'new text 2');
      await hgRepository.commit('commit msg 2');
      await fsPromise.writeFile(filePath, 'new text 3');
      await hgRepository.amend('commit msg 3');
      const changes = await fetchFilesChangedAtRevision('.', repoPath);
      invariant(changes != null);
      expect(changes.all.length).toEqual(1);
      expect(changes.modified.length).toEqual(1);
      expect(changes.modified[0]).toEqual(filePath);
      const content3 = await fetchFileContentAtRevision(filePath, '.', repoPath);
      expect(content3).toEqual('new text 3');
      const content1 = await fetchFileContentAtRevision(filePath, '.^', repoPath);
      expect(content1).toEqual('new text 1');
    });
  });

  afterEach(() => {
    deactivateAllPackages();
  });
});
