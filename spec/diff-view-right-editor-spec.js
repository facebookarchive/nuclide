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
} from './utils/integration-test-helpers';
import {generateHgRepo2Fixture} from '../pkg/nuclide-test-helpers';
import {setLocalProject} from '../pkg/commons-atom/testHelpers';
import invariant from 'assert';
import fs from 'fs';
import nuclideUri from '../pkg/commons-node/nuclideUri';
import {ReactDOM} from 'react-for-atom';

function getResourceTextSync(filePath: string): string {
  return fs.readFileSync(
    filePath,
    {encoding: 'utf-8'},
  );
}

describe('Diff View Right Editor Save and Edit Test', () => {

  const TEST_FILE_NAME = 'test.txt';
  let repoPath: string = (null: any);

  beforeEach(() => {
    waitsForPromise({timeout: 30000}, async () => {
      // Configure some jasmine specific things for integration testing.
      jasmineIntegrationTestSetup();
      // Activate nuclide packages.
      await activateAllPackages();
      // Copy mercurial project to temporary directory.
      repoPath = await generateHgRepo2Fixture();
      // Add this directory as a new project in atom.
      setLocalProject(repoPath);
      // Open the test.txt file in the repo.
      await atom.workspace.open(nuclideUri.join(repoPath, TEST_FILE_NAME));
    });
  });

  afterEach(() => {
    // Deactivate nuclide packages.
    deactivateAllPackages();
  });

  it('edits and saves a file within the diff view\'s right editor', () => {
    const textEditor = atom.workspace.getActiveTextEditor();
    invariant(textEditor, 'no active text editor!');
    // Open diff view
    atom.commands.dispatch(atom.views.getView(textEditor), 'nuclide-diff-view:open');

    let diffViewElement: ?HTMLElement = (null: any);

    waitsFor('diff view to load', 10000, () => {
      diffViewElement = atom.workspace.getActivePaneItem();
      return diffViewElement != null && diffViewElement.tagName === 'NUCLIDE-DIFF-VIEW';
    });

    runs(() => {
      const diffViewPackage = atom.packages.getActivePackage('nuclide-diff-view');
      invariant(diffViewPackage, 'The "nuclide-diff-view" package is not active!');
      // Get active diff view
      const diffViewComponent = (diffViewPackage.mainModule: any).__getDiffViewComponent();
      invariant(diffViewComponent, 'No active diff view!');

      const diffViewContainer = ReactDOM.findDOMNode(diffViewComponent);
      expect(diffViewContainer.parentNode).toBe(diffViewElement);
      invariant(diffViewElement != null);
      // Ensure both panels TextEditors are showing in diff view
      const textEditorElements = diffViewElement.querySelectorAll('atom-text-editor');
      expect(textEditorElements.length).toBe(2);

      // Get right TextEditor from diff view
      // Downcast to `HTMLElement` to child `TextEditorElement` class
      const rightEditorElement = ((textEditorElements[1]: any): atom$TextEditorElement);
      const rightEditor = rightEditorElement.getModel();

      // Test that inserting text does not affect the file until the TextEditor saves
      rightEditor.insertText('Integration test sample text');

      const TEST_FILE_PATH = nuclideUri.join(repoPath, TEST_FILE_NAME);
      expect(getResourceTextSync(TEST_FILE_PATH)).not.toEqual(rightEditor.getText());
      rightEditor.saveAs(TEST_FILE_PATH);
      expect(getResourceTextSync(TEST_FILE_PATH)).toEqual(rightEditor.getText());


      // Test that deleting text does not affect the file until the TextEditor saves
      rightEditor.selectAll();
      rightEditor.delete();

      expect(getResourceTextSync(TEST_FILE_PATH)).not.toEqual(rightEditor.getBuffer());
      rightEditor.saveAs(TEST_FILE_PATH);
      expect(getResourceTextSync(TEST_FILE_PATH)).toEqual(rightEditor.getText());
    });
  });
});
