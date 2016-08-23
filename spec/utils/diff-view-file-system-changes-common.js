'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TestContext} from './remotable-tests';

import {generateHgRepo2Fixture} from '../../pkg/nuclide-test-helpers';
import fs from 'fs';
import invariant from 'assert';
import nuclideUri from '../../pkg/commons-node/nuclideUri';

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

export function runTest(context: TestContext) {
  const TEST_FILE_NAME = 'test.txt';
  let diffViewElement: ?HTMLElement;
  let textEditor: ?atom$TextEditor;
  let localFilePath: string = (null: any);
  let repoPath: string = (null: any);

  function getDiffEditorContents(): string {
    invariant(diffViewElement != null);
    const textEditorElements = diffViewElement.querySelectorAll('atom-text-editor');
    const rightEditorElement = ((textEditorElements[1]: any): atom$TextEditorElement);
    const rightEditor = rightEditorElement.getModel();
    return rightEditor.getText();
  }

  function openDiffViewForTestFile() {
    waitsForPromise({timeout: 30000}, async () => {
      repoPath = await generateHgRepo2Fixture();
      localFilePath = nuclideUri.join(repoPath, TEST_FILE_NAME);
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
  }

  it('reloads the diff view when the active file changes', () => {
    const SAMPLE_TEXT = 'Integration test sample text';
    openDiffViewForTestFile();

    // Change the file on the file system
    runs(() => {
      setResourceTextSync(
        localFilePath,
        SAMPLE_TEXT,
      );
    });

    // Ensure that the change on the file system is reflected in the Diff View's TextEditor
    waitsFor('editor to reload on file change', () => {
      return getDiffEditorContents() === SAMPLE_TEXT;
    });

    /**
     * TODO(most): re-enable the test below when it's less flaky
     */

    // Delete the file on the file system
    // runs(() => {
    //   fs.unlinkSync(nuclideUri.join(repoPath, TEST_FILE_NAME));
    // });

    // Ensure that the new Diff View editor that is created when the file on the system
    // is deleted is blank
    // waitsFor('diff view to create a new text editor on file deletion', () => {
    //   return getDiffEditorContents() === '';
    // });
  });
}
