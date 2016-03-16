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
} from '../../pkg/nuclide-integration-test-helpers';
import {
  addRemoteProject,
  startNuclideServer,
  stopNuclideServer,
} from '../../pkg/nuclide-integration-test-helpers';
import {copyMercurialFixture} from '../../pkg/nuclide-integration-test-helpers';
import invariant from 'assert';

describe('remote connection for testing', () => {
  it('starts server and adds remote project', () => {
    waitsForPromise({timeout: 240000}, async () => {
      await activateAllPackages();
      const pathToProject = await copyMercurialFixture('hg_repo_1');
      startNuclideServer();
      const connection = await addRemoteProject(pathToProject);
      invariant(connection != null);
      expect(atom.project.getDirectories().length).toBe(2);
      expect(atom.project.getRepositories().length).toBe(2);
      stopNuclideServer(connection);
      deactivateAllPackages();
    });
  });
});
