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
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
  dispatchKeyboardEvent,
  setLocalProject,
} from '../pkg/nuclide/integration-test-helpers';
import path from 'path';

describe('Diff view simple integration test', () => {
  it('tests diff view', () => {
    let textEditor: atom$TextEditor = (null : any);
    let uncommitedFileChangeCount: ?string = (null : any);
    let diffViewElement: ?HTMLElement = (null : any);

    waitsForPromise({timeout: 60000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate atom packages.
      await activateAllPackages();
      // Copy mercurial project to temporary directory.
      const repoPath = await copyMercurialFixture('hg_repo_1', __dirname);
      // Add this directory as a new project in atom.
      setLocalProject(repoPath);
      // Open the test.txt file in the repo.
      textEditor = await atom.workspace.open(path.join(repoPath, 'test.txt'));

      // Initially we have no changed files so the diff view tool-bar counter should be empty.
      uncommitedFileChangeCount = document.querySelector('.diff-view-count').innerText;
      expect(uncommitedFileChangeCount).toEqual('');

      // Change the active file and see that the diff view counter is at 1.
      textEditor.insertText('change');
    });

    waitsFor('Text to be inserted', 10000, () => {
      return textEditor.getText().startsWith('change');
    });

    runs(() => {
      // Save the change.
      dispatchKeyboardEvent('s', document.activeElement, {cmd: true});
    });

    waitsFor('uncommited file changes tool-bar counter to update', 10000, () => {
      uncommitedFileChangeCount = document.querySelector('.diff-view-count').innerText;
      return uncommitedFileChangeCount;
    });

    runs(() => {
      expect(uncommitedFileChangeCount).toEqual('1');

      // Open diff view
      const buttonElement = document.querySelector('.icon-git-branch');
      buttonElement.click();
    });

    waitsFor('diff view to load', 10000, () => {
      diffViewElement = atom.workspace.getActivePaneItem();
      return diffViewElement != null && diffViewElement.tagName === 'NUCLIDE-DIFF-VIEW';
    });

    runs(() => {
      deactivateAllPackages();
    });
  });
});
