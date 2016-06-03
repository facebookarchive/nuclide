'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TestContext} from './utils/remotable-tests';

import {
  copyMercurialFixture,
} from '../pkg/nuclide-integration-test-helpers';
import {describeRemotableTest} from './utils/remotable-tests';

import fs from 'fs';
import invariant from 'assert';
import path from 'path';

const FILE_ENCODING = {encoding: 'utf-8'};

function setResourceTextSync(
  filePath: string,
  text: string,
): void {
  fs.writeFileSync(
    filePath,
    text,
    FILE_ENCODING,
  );
}

describeRemotableTest('Diff View Reloads Filesystem Contents', (context: TestContext) => {

  const TEST_FILE_NAME = 'test.txt';
  let repoPath: string = (null: any);

  it('reloads the diff view when changes to the active file occur on the file system', () => {
    let diffViewElement: ?HTMLElement;
    let textEditor: ?atom$TextEditor;

    const SAMPLE_TEXT = 'Integration test sample text';

    waitsForPromise(async () => {
      repoPath = await copyMercurialFixture('hg_repo_2');
      invariant(repoPath != null);
      await context.setProject(repoPath);
      textEditor = await atom.workspace.open(context.getProjectRelativePath(TEST_FILE_NAME));
    });

    // Open diff view
    runs(() => {
      invariant(textEditor, 'No active text editor!');
      atom.commands.dispatch(atom.views.getView(textEditor), 'nuclide-diff-view:open');
    });

    waitsFor('diff view to load', 10000, () => {
      diffViewElement = atom.workspace.getActivePaneItem();
      return diffViewElement != null && diffViewElement.tagName === 'NUCLIDE-DIFF-VIEW';
    });

    // Change the file on the file system
    runs(() => {
      setResourceTextSync(
        path.join(repoPath, TEST_FILE_NAME),
        SAMPLE_TEXT,
      );
    });

    // Ensure that the change on the file system is reflected in the Diff View's TextEditor
    waitsFor('editor to reload on file change', () => {
      invariant(diffViewElement != null);
      const textEditorElements = diffViewElement.querySelectorAll('atom-text-editor');
      expect(textEditorElements.length).toBe(2);

      const rightEditorElement = ((textEditorElements[1]: any): atom$TextEditorElement);
      const rightEditor = rightEditorElement.getModel();

      return rightEditor.getText() === SAMPLE_TEXT;
    });

    // Delete the file on the file system
    runs(() => {
      fs.unlinkSync(path.join(repoPath, TEST_FILE_NAME));
    });

    // Ensure that the new Diff View editor that is created when the file on the system is deleted is blank
    waitsFor('diff view to create a new text editor on file deletion', () => {
      invariant(diffViewElement != null);
      const textEditorElements = diffViewElement.querySelectorAll('atom-text-editor');
      expect(textEditorElements.length).toBe(2);

      const rightEditorElement = ((textEditorElements[1]: any): atom$TextEditorElement);
      const rightEditor = rightEditorElement.getModel();

      return rightEditor.getText() === '';
    });
  });
});
