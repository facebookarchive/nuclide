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
  dispatchKeyboardEvent,
  setLocalProject,
} from '../pkg/nuclide/integration-test-helpers';

import path from 'path';

describe('Clipboard path integration test', () => {
  it('correctly copies local paths', () => {
    waitsForPromise({timeout: 240000}, async () => {
      // We will use the DOM because we are sending events.
      jasmine.attachToDOM(atom.views.getView(atom.workspace));
      // Activate nuclide packages.
      await activateAllPackages();
      // Copy mercurial project to temp directory.
      const repoPath = await copyMercurialFixture('hg_repo_1');
      // Add this directory as an atom project.
      setLocalProject(path.dirname(repoPath));
      // Open a file in the project.
      await atom.workspace.open(path.join(repoPath, 'test.txt'));

      // Absolute path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, shift: true});
      const expectedPath = path.join(repoPath, 'test.txt');
      expect(atom.clipboard.read()).toBe(expectedPath);

      // Project-relative path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, alt: true, shift: true});
      expect(atom.clipboard.read()).toBe(path.join(path.basename(repoPath), 'test.txt'));

      // Repository-relative path.
      dispatchKeyboardEvent('x', document.activeElement, {ctrl: true, alt: true});
      expect(atom.clipboard.read()).toBe(path.join(path.basename(repoPath), 'test.txt'));

      deactivateAllPackages();
    });
  });
});
