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
  deactivateAllPackages,
  jasmineIntegrationTestSetup,
} from '../pkg/nuclide-integration-test-helpers';
import {
  addRemoteProject,
  startNuclideServer,
  stopNuclideServer,
} from '../pkg/nuclide-integration-test-helpers';
import {copyMercurialFixture} from '../pkg/nuclide-integration-test-helpers';
import invariant from 'assert';

describe('remote connection for testing', () => {
  it('starts server and adds remote project', () => {
    waitsForPromise({timeout: 240000}, async () => {
      expect(atom.project.getDirectories().length).toBe(1);
      expect(atom.project.getRepositories().length).toBe(1);

      jasmineIntegrationTestSetup();

      expect(atom.project.getDirectories().length).toBe(0);
      expect(atom.project.getRepositories().length).toBe(0);

      await activateAllPackages();

      expect(atom.project.getDirectories().length).toBe(0);
      expect(atom.project.getRepositories().length).toBe(0);

      const pathToProject = await copyMercurialFixture('hg_repo_1');

      startNuclideServer();
      const connection = await addRemoteProject(pathToProject);
      invariant(connection != null);

      expect(atom.project.getDirectories().length).toBe(1);
      expect(atom.project.getRepositories().length).toBe(1);

      await stopNuclideServer(connection);

      deactivateAllPackages();
    });
  });
});
