/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';

import {
  activateAllPackages,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
} from './utils/integration-test-helpers';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {DIFF_EDITOR_MARKER_CLASS} from '../pkg/nuclide-diff-view/lib/constants';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME}
  from '../pkg/nuclide-diff-view/lib/new-ui/SplitDiffView';
import {generateHgRepo2Fixture} from '../pkg/nuclide-test-helpers';
import {setLocalProject} from '../pkg/commons-atom/testHelpers';
import nuclideUri from '../pkg/commons-node/nuclideUri';
import fs from 'fs';
import {waitsForRepositoryReady} from './utils/diff-view-utils';

describe('Diff View Commit Integration Test', () => {
  let repoPath: string = (null: any);
  let filePath: string = (null: any);

  beforeEach(() => {
    waitsForPromise({timeout: 60000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate atom packages.
      await activateAllPackages();
      // Copy mercurial project to temporary directory.
      repoPath = await generateHgRepo2Fixture();
      // This is an existing file to be changed & committed.
      filePath = nuclideUri.join(repoPath, 'test.txt');
      // Add this directory as a new project in atom.
      setLocalProject(repoPath);
    });
  });

  afterEach(() => {
    deactivateAllPackages();
  });

  it('tests commit view have the changed files & commit/amend works', () => {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-diff-view:open');

    let revisionsTimelineElement: ?HTMLElement = (null: any);
    let treeElement: ?HTMLElement = (null: any);
    waitsFor('revision timeline to load', 10000, () => {
      treeElement = document.querySelector('.nuclide-diff-view-tree');
      revisionsTimelineElement = document.querySelector('.nuclide-diff-timeline');
      return treeElement != null && revisionsTimelineElement != null;
    });

    waitsForPromise(
      {label: 'repository ready'},
      () => waitsForRepositoryReady(filePath),
    );

    let revisionLabels = [];

    waitsFor('revisions to load', () => {
      invariant(revisionsTimelineElement != null);
      revisionLabels = revisionsTimelineElement.querySelectorAll('.revision-title');
      return revisionLabels.length > 0;
    });

    let commitButton: HTMLElement = (null: any);
    let amendButton: HTMLElement = (null: any);

    function updateUncommittedButtons(): void {
      invariant(revisionsTimelineElement != null);
      const uncommittedButtons = revisionsTimelineElement
        .querySelectorAll('.nuclide-diff-rev-side-button');
      commitButton = uncommittedButtons[0];
      amendButton = uncommittedButtons[1];
    }

    function getUncommittedChangesText(): string {
      invariant(revisionsTimelineElement != null);
      const uncommittedNode = revisionsTimelineElement
        .querySelector('.revision-label .revision-title');
      invariant(uncommittedNode != null);
      return uncommittedNode.textContent;
    }

    runs(() => {
      expect(revisionLabels.length).toBe(3);

      expect(getUncommittedChangesText()).toBe('No Uncommitted Changes');
      updateUncommittedButtons();
      expect(commitButton).not.toBeNull();
      expect(amendButton).not.toBeNull();
      expect((commitButton: any).disabled).toBe(true);

      invariant(treeElement != null);
      diffFiles = treeElement.querySelectorAll('.file-change');
      expect(diffFiles.length).toBe(0);
      fs.appendFileSync(filePath, '\nnew_line_1\nnew_line_2');
    });

    let diffFiles = [];

    waitsFor('repo diff status to update', 20000, () => {
      invariant(treeElement != null);
      diffFiles = treeElement.querySelectorAll('.nuclide-file-changes-list-item');
      return diffFiles.length > 0;
    });

    runs(() => {
      // Verify the diff tree reflects the repo status.
      expect(diffFiles.length).toBe(1);
      const dataPathElement = diffFiles[0];
      expect(dataPathElement).not.toBeNull();
      expect(dataPathElement.getAttribute('data-path')).toBe(filePath);

      // Verify the revision timeline reflects the repo status.
      expect(getUncommittedChangesText()).toBe('1 Uncommitted Change');

      expect((commitButton: any).disabled).toBe(false);

      // Click to open the diff view with `test.txt`.
      diffFiles[0].click();
    });

    waitsFor('hg diff to load', 10000, () => {
      const diffViewPackage: any = atom.packages.getActivePackage('nuclide-diff-view');
      return diffViewPackage.mainModule._getAppState()
        .getValue().fileDiff.oldEditorState.text.length > 0;
    });

    let editorElements = [];

    runs(() => {
      editorElements = (document.querySelectorAll(`.${DIFF_EDITOR_MARKER_CLASS}`): any);
      const oldEditor: atom$TextEditor = editorElements[0].getModel();
      const newEditor: atom$TextEditor = editorElements[1].getModel();
      // Verify the trailing block decoration shows in place.
      const offsetDecorations = oldEditor.getDecorations({type: 'block'});
      expect(offsetDecorations.length).toBe(1);
      const [trailingOffsetDecoration] = offsetDecorations;
      const {item, position} = trailingOffsetDecoration.getProperties();
      expect(position).toBe('after');
      expect(item.firstChild.style.minHeight).toBe(`${2 * oldEditor.getLineHeightInPixels()}px`);
      expect(trailingOffsetDecoration.getMarker().getStartBufferPosition().isEqual([6, 0]))
        .toBeTruthy();

      // Verify the added highlight markers.
      const addLinesDecorations = newEditor.getDecorations({class: 'diff-view-insert'});
      expect(addLinesDecorations.length).toBe(2);
      expect(addLinesDecorations[0].getMarker().getBufferRange()
        .isEqual([[7, 0], [8, 0]])).toBeTruthy();
      expect(addLinesDecorations[1].getMarker().getBufferRange()
        .isEqual([[8, 0], [8, 10]])).toBeTruthy();

      // Click the commit button to go to commit mode.
      commitButton.click();
    });

    waitsFor('commit mode to open', () => {
      return (
        document.querySelector('.commit-form-wrapper') != null ||
        document.querySelector('.message-editor-wrapper') != null
      );
    });

    let commitModeContainer: ?HTMLElement = (null: any);
    runs(() => {
      revisionsTimelineElement = document.querySelector('.nuclide-diff-timeline');
      expect(revisionsTimelineElement).toBeNull();
      commitModeContainer = document.querySelector('.nuclide-diff-mode');
    });

    let modeButtons = [];
    waitsFor('load commit message', () => {
      invariant(commitModeContainer != null);
      modeButtons = commitModeContainer.querySelectorAll('.btn');
      return modeButtons.length === 2 && modeButtons[1].textContent === 'Commit';
    });

    let commitMessage = 'Commit title from nuclide.';
    const testPlan = 'This is the test plan';
    let amendCheckbox: HTMLInputElement = (null: any);

    runs(() => {
      invariant(commitModeContainer != null);
      amendCheckbox = (commitModeContainer.querySelector('input[type=checkbox]'): any);
      expect(amendCheckbox.checked).toBe(false);
      const commitEditorElement = commitModeContainer.querySelectorAll('atom-text-editor');
      const commitEditor = ((commitEditorElement[0]: any): atom$TextEditorElement).getModel();
      commitEditor.setText(commitMessage);
      const testPlanEditor = ((commitEditorElement[2]: any): atom$TextEditorElement).getModel();
      testPlanEditor.setText(testPlan);

      const doCommitButton = modeButtons[1];
      // Now, commit.
      doCommitButton.click();
    });

    waitsFor('back to browse mode after a successful commit', () => {
      revisionsTimelineElement = document.querySelector('.nuclide-diff-timeline');
      return revisionsTimelineElement != null;
    });

    waitsFor('new commit to load in the revisions timeline', 20000, () => {
      invariant(revisionsTimelineElement != null);
      revisionLabels = revisionsTimelineElement.querySelectorAll('.revision-title');
      return revisionLabels.length === 4;
    });

    waitsFor('hg status to update', () => {
      return getUncommittedChangesText() === 'No Uncommitted Changes';
    });

    runs(() => {
      expect(revisionLabels[1].textContent).toBe(commitMessage.split('\n')[0]);
      updateUncommittedButtons();
      expect((commitButton: any).disabled).toBe(true);
      // Now, let's amend to change the commit message.
      amendButton.click();
    });

    waitsFor('amend mode to open', () => {
      return (
        document.querySelector('.commit-form-wrapper') != null ||
        document.querySelector('.message-editor-wrapper') != null
      );
    });

    runs(() => {
      revisionsTimelineElement = document.querySelector('.nuclide-diff-timeline');
      expect(revisionsTimelineElement).toBeNull();
      commitModeContainer = document.querySelector('.nuclide-diff-mode');
    });

    waitsFor('load amend message', () => {
      invariant(commitModeContainer != null);
      modeButtons = commitModeContainer.querySelectorAll('.btn');
      return modeButtons.length === 2 && modeButtons[1].textContent === 'Amend';
    });

    runs(() => {
      invariant(commitModeContainer != null);
      amendCheckbox = (commitModeContainer.querySelector('input[type=checkbox]'): any);
      expect(amendCheckbox.checked).toBe(true);

      const commitEditorElement = commitModeContainer.querySelectorAll('atom-text-editor');
      const commitEditor = ((commitEditorElement[0]: any): atom$TextEditorElement).getModel();
      expect(commitEditor.getText()).toBe(commitMessage);
      const testPlanEditor = ((commitEditorElement[2]: any): atom$TextEditorElement).getModel();
      expect(testPlanEditor.getText()).toBe(testPlan);
      commitMessage = `Amended:${commitMessage}`;
      commitEditor.setText(commitMessage);

      const doAmendButton = modeButtons[1];
      // Now, amend.
      doAmendButton.click();
    });

    waitsFor('back to browse mode after a successful amend', () => {
      revisionsTimelineElement = document.querySelector('.nuclide-diff-timeline');
      return revisionsTimelineElement != null;
    });

    waitsFor('amended commit to show in the revisions timeline', 20000, () => {
      invariant(revisionsTimelineElement != null);
      revisionLabels = revisionsTimelineElement.querySelectorAll('.revision-title');
      return revisionLabels.length === 4 &&
        revisionLabels[1].textContent === commitMessage.split('\n')[0];
    });

    runs(() => {
      // Cleanup.
      editorElements.forEach(editorElement => {
        editorElement.getModel().destroy();
      });
      // TODO(most): figure our why closing the editors doesn't clean up these.
      Array.from(document.querySelectorAll(`.${NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME}`))
        .forEach(loadingElement => (loadingElement: any).parentNode.removeChild(loadingElement));
    });
  });
});
