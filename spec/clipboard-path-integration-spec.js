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
  dispatchKeyboardEvent,
  setLocalProject,
} from '../pkg/commons-atom/testHelpers';
import {copyMercurialFixture} from '../pkg/nuclide-test-helpers';
import nuclideUri from '../pkg/commons-node/nuclideUri';

describe('Clipboard path integration test', () => {
  it('correctly copies local paths', () => {
    waitsForPromise({timeout: 240000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate nuclide packages.
      await activateAllPackages();
      // Copy mercurial project to temp directory.
      const repoPath = await copyMercurialFixture('hg_repo_1', __dirname);
      // Add this directory as an atom project.
      setLocalProject(nuclideUri.dirname(repoPath));
      // Open a file in the project.
      await atom.workspace.open(nuclideUri.join(repoPath, 'test.txt'));

      // Absolute path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, shift: true});
      const expectedPath = nuclideUri.join(repoPath, 'test.txt');
      expect(atom.clipboard.read()).toBe(expectedPath);

      // Project-relative path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, alt: true, shift: true});
      expect(atom.clipboard.read())
      .toBe(nuclideUri.join(nuclideUri.basename(repoPath), 'test.txt'));

      // Repository-relative path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, alt: true});
      expect(atom.clipboard.read())
      .toBe(nuclideUri.join(nuclideUri.basename(repoPath), 'test.txt'));

      deactivateAllPackages();
    });
  });
});
