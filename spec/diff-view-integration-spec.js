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
import invariant from 'assert';
import {ReactDOM} from 'react-for-atom';
import {getFileTreePathFromTargetEvent} from '../pkg/nuclide/diff-view/lib/utils';

import type DiffViewComponent from '../pkg/nuclide/diff-view/lib/DiffViewComponent';

describe('Diff view integration test', () => {

  let repoPath: string = (null: any);

  beforeEach(() => {
    waitsForPromise({timeout: 60000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate atom packages.
      await activateAllPackages();
      // Copy mercurial project to temporary directory.
      repoPath = await copyMercurialFixture('hg_repo_2', __dirname);
      // Add this directory as a new project in atom.
      setLocalProject(repoPath);
      // Open the test.txt file in the repo.
      await atom.workspace.open(path.join(repoPath, 'test.txt'));
    });
  });

  afterEach(() => {
    deactivateAllPackages();
  });

  it('tests diff files count', () => {
    const textEditor = atom.workspace.getActiveTextEditor();
    invariant(textEditor, 'no active text editor!');
    let uncommitedFileChangeCount: ?string = (null : any);

    waitsForPromise({timeout: 30000}, async () => {
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
    });
  });

  function getDiffViewComponent(): DiffViewComponent {
    const diffViewPackage = atom.packages.getActivePackage('nuclide-diff-view');
    invariant(diffViewPackage, 'nuclide-diff-view is not active!');
    const activeDiffView = (diffViewPackage.mainModule: any).__testDiffView;
    invariant(activeDiffView, 'no active diff view!');
    return activeDiffView.component;
  }

  it('tests opening the diff view in browse mode', () => {
    // Open diff view with the `test.txt` file.
    const textEditor = atom.workspace.getActiveTextEditor();
    invariant(textEditor, 'no active text editor!');
    atom.commands.dispatch(atom.views.getView(textEditor), 'nuclide-diff-view:open');

    let diffViewElement: ?HTMLElement = (null : any);
    waitsFor('diff view to load', 10000, () => {
      diffViewElement = atom.workspace.getActivePaneItem();
      return diffViewElement != null && diffViewElement.tagName === 'NUCLIDE-DIFF-VIEW';
    });

    let revisionsTimelineElement: HTMLElement = (null: any);
    let treeElement: HTMLElement = (null: any);

    runs(() => {
      invariant(diffViewElement);
      const diffViewComponent = getDiffViewComponent();
      const diffViewContainer = ReactDOM.findDOMNode(diffViewComponent);
      expect(diffViewContainer.parentNode).toBe(diffViewElement);
      const textEditorElements = diffViewElement.querySelectorAll('atom-text-editor');
      expect(textEditorElements.length).toBe(2);
      treeElement = diffViewElement.querySelector('.nuclide-diff-view-tree');
      expect(treeElement).not.toBeNull();
      revisionsTimelineElement = diffViewElement.querySelector('.diff-timeline');
      expect(revisionsTimelineElement).not.toBeNull();
    });

    let revisionLabels = [];

    waitsFor('revisions to load', 5000, () => {
      revisionLabels = revisionsTimelineElement.querySelectorAll('.revision-label');
      return revisionLabels.length > 0;
    });

    runs(() => {
      expect(revisionLabels.length).toBe(3);
    });

    let diffFiles = [];
    waitsFor('file diff history to load', 5000, () => {
      diffFiles = treeElement.querySelectorAll('.file-change');
      return diffFiles.length > 0;
    });

    runs(() => {
      const treeRoots = treeElement.querySelectorAll('.root');
      expect(treeRoots.length).toBe(1);
      const rootPath = getFileTreePathFromTargetEvent(({currentTarget: treeRoots[0]}: any));
      expect(rootPath).toBe(repoPath);
      expect(diffFiles.length).toBe(1);
      const filePath = getFileTreePathFromTargetEvent(({currentTarget: diffFiles[0]}: any));
      expect(filePath.startsWith(repoPath)).toBeTruthy();
    });
  });
});
