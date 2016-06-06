'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DiffViewComponent from '../pkg/nuclide-diff-view/lib/DiffViewComponent';
import type {RemoteConnection} from '../pkg/nuclide-remote-connection';

import {
  addRemoteProject,
  activateAllPackages,
  copyMercurialFixture,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
  setLocalProject,
  startNuclideServer,
  stopNuclideServer,
} from '../pkg/nuclide-integration-test-helpers';
import fs from 'fs';
import invariant from 'assert';
import {ReactDOM} from 'react-for-atom';
import uiTreePath from '../pkg/commons-atom/ui-tree-path';
import {NON_MERCURIAL_REPO_DISPLAY_NAME} from '../pkg/nuclide-diff-view/lib/constants';
import temp from 'temp';
import {join} from '../pkg/nuclide-remote-uri';

temp.track();

describe('Diff View Browse Mode Integration Test', () => {

  let localRepoPath: string = (null: any);
  let nonRepoPath: string = (null: any);
  let remoteRepoLocalPath: string = (null: any);
  let remoteRepoPath: string = (null: any);
  let connection: ?RemoteConnection = (null : any);

  beforeEach(() => {
    waitsForPromise({timeout: 60000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate atom packages.
      await activateAllPackages();
      // Copy local mercurial project to temporary directory.
      localRepoPath = await copyMercurialFixture('hg_repo_2');
      fs.writeFileSync(join(localRepoPath, 'test.txt'), 'dirty changes', 'utf8');

      // Non-Mercurial project.
      nonRepoPath = temp.mkdirSync('non_repo');
      fs.writeFileSync(join(nonRepoPath, 'no_repo_file.txt'), 'ignored_contents', 'utf8');
      // Add those two local directories as a new project in atom.
      setLocalProject([localRepoPath, nonRepoPath]);

      // Start the Nuclide server and add a remote mercurial repository project.
      remoteRepoLocalPath = await copyMercurialFixture('hg_repo_2');
      fs.writeFileSync(join(remoteRepoLocalPath, 'untracked.txt'), 'untracked', 'utf8');
      await startNuclideServer();
      connection = await addRemoteProject(remoteRepoLocalPath);
      invariant(connection != null, 'connection was not established');
      // Open a remote file in the flow project we copied, and get reference to the editor's HTML.
      remoteRepoPath = connection.getUriForInitialWorkingDirectory();
      // Open the test.txt file in the repo.
      await atom.workspace.open(join(remoteRepoPath, 'test.txt'));
    });
  });

  afterEach(() => {
    // Clean up -- kill nuclide server and deactivate packages.
    waitsForPromise(async () => {
      deactivateAllPackages();
      if (connection != null) {
        await stopNuclideServer(connection);
      }
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
      revisionsTimelineElement = diffViewElement.querySelector('.nuclide-diff-timeline');
      expect(revisionsTimelineElement).not.toBeNull();
    });

    let revisionLabels = [];

    waitsFor('remote: revisions to load', 5000, () => {
      revisionLabels = revisionsTimelineElement.querySelectorAll('.revision-label');
      return revisionLabels.length > 0;
    });

    runs(() => {
      // Should be the number of revisions + 1 to account for the permanent "Uncommitted" node.
      expect(revisionLabels.length).toBe(4);
      // Click on the commit below head to include the HEAD commit changes.
      revisionLabels[2].click();
    });

    let diffFiles = [];
    waitsFor('remote: file changes to load', 5000, () => {
      diffFiles = treeElement.querySelectorAll('.file-change');
      return diffFiles.length > 2;
    });

    runs(() => {
      expect(diffFiles.length).toBe(3);
      expect(uiTreePath(({currentTarget: diffFiles[0]}: any))).toBe(
        join(localRepoPath, 'test.txt'),
      );
      expect(uiTreePath(({currentTarget: diffFiles[1]}: any))).toBe(
        join(remoteRepoPath, '.arcconfig'),
      );
      expect(uiTreePath(({currentTarget: diffFiles[2]}: any))).toBe(
        join(remoteRepoPath, 'untracked.txt'),
      );
      const treeRoots = treeElement.querySelectorAll('.root');
      expect(treeRoots.length).toBe(4);
      expect(uiTreePath(({currentTarget: treeRoots[0]}: any))).toBe(localRepoPath);
      expect(uiTreePath(({currentTarget: treeRoots[1]}: any))).toBe(nonRepoPath);
      expect(uiTreePath(({currentTarget: treeRoots[2]}: any))).toBe(
        NON_MERCURIAL_REPO_DISPLAY_NAME,
      );
      expect(uiTreePath(({currentTarget: treeRoots[3]}: any))).toBe(remoteRepoPath);
    });
  });
});
