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

import invariant from 'assert';
import path from 'path';

import {
  extractTarGzFixture,
  fileTreeHasFinishedLoading,
  getVisibleEntryFromFileTree,
  pollFor,
} from '../../pkg/nuclide-integration-test-helpers';

export function runTest(context: TestContext): void {
  it('opens large directories in the file tree', () => {
    waitsForPromise({timeout: 60000}, async () => {
      const projectPath = await extractTarGzFixture('large_tree');

      // Add this directory as an atom project.
      await context.setProject(projectPath);

      await fileTreeHasFinishedLoading();

      await testADir('dir_100_files', 'file001.txt', 500); // 500ms for 100 files
      await testADir('dir_1000_files', 'file0001.txt', 1500); // 1.5 sec for 1000 files
      await testADir('dir_10000_files', 'file00001.txt', 5000); // 5 sec for 10000 files

      const filePath = context.getProjectRelativePath(path.join('dir_1000_files', 'file0001.txt'));
      const editor = await atom.workspace.open(filePath);
      invariant(editor);

      editor.insertText('Bla-bla');
      expect(editor.isModified()).toBe(true);

      const teElement = atom.views.getView(editor);
      atom.commands.dispatch(teElement, 'core:save');

      pollFor(() => !editor.isModified(), 'Failed to save fast enough', 500);

      editor.insertText('Another bla');
      expect(editor.isModified()).toBe(true);
      pollFor(() => !editor.isModified(), 'Failed to save fast enough', 500);
    });
  });
}

async function testADir(dirname: string, filename: string, time: number): Promise<void> {
  await pollFor(() => getVisibleEntryFromFileTree(dirname) != null, null, 100); // Let it render
  const dir = getVisibleEntryFromFileTree(dirname);
  invariant(dir);

  dir.click(); // Opend the 100 files directory
  await pollFor(
    () => getVisibleEntryFromFileTree(filename) != null,
    `The directory ${dirname} did not load in ${time}ms`,
    time,
  );

  dir.click(); // Close it
  pollFor(() => getVisibleEntryFromFileTree(filename) == null);
}
