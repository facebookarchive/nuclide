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
  addRemoteProject,
  copyMercurialFixture,
  deactivateAllPackages,
  dispatchKeyboardEvent,
  jasmineIntegrationTestSetup,
  startNuclideServer,
  stopNuclideServer,
} from '../pkg/nuclide-integration-test-helpers';

import {join} from '../pkg/nuclide-remote-uri';

import invariant from 'assert';

describe('Remote clipboard path integration test', () => {
  it('correctly copies remote paths', () => {
    waitsForPromise({timeout: 240000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate nuclide packages.
      await activateAllPackages();
      // Copy mercurial project to temp directory.
      const repoPath = await copyMercurialFixture('hg_repo_1');
      // Start the Nuclide server and add a remote project.
      await startNuclideServer();
      const connection = await addRemoteProject(repoPath);
      invariant(connection != null, 'connection was not established');
      // Open a remote file in the project.
      const remoteFileUri = join(connection.getUriForInitialWorkingDirectory(), 'test.txt');
      await atom.workspace.open(remoteFileUri);

      // Absolute path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, shift: true});
      const expectedPath = connection.getPathOfUri(remoteFileUri);
      expect(atom.clipboard.read()).toBe(expectedPath);

      // Project-relative path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, alt: true, shift: true});
      expect(atom.clipboard.read()).toBe('test.txt');

      // Repository-relative path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, alt: true});
      expect(atom.clipboard.read()).toBe('test.txt');

      stopNuclideServer(connection);
      deactivateAllPackages();
    });
  });
});
