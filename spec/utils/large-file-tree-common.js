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
import nuclideUri from '../../pkg/commons-node/nuclideUri';
import {generateFixture} from '../../pkg/nuclide-test-helpers';
import {
  fileTreeHasFinishedLoading,
  getVisibleEntryFromFileTree,
} from './file-tree-common';
import pollFor from './pollFor';

export function runTest(context: TestContext): void {
  // eslint-disable-next-line jasmine/no-disabled-tests
  xit('opens large directories in the file tree', () => {
    waitsForPromise({timeout: 60000}, async () => {
      const files = new Map();
      // Add an empty `.watchmanconfig` so we don't get "resolve_projpath" errors.
      files.set('.watchmanconfig');
      // Generate 3 dirs, with 100, 1000, 10000 files each.
      [100, 1000, 10000].forEach(amt => {
        for (let i = 0; i < amt; i++) {
          files.set(`dir_${amt}_files/file_${amt}_${i}.txt`, 'some text');
        }
      });

      const projectPath = await generateFixture('large_tree', files);

      // Add this directory as an atom project.
      await context.setProject(projectPath);

      await fileTreeHasFinishedLoading();

      await testADir('dir_100_files', 'file_100_0.txt', 1000); // 1s for 100 files
      await testADir('dir_1000_files', 'file_1000_0.txt', 5000); // 5 sec for 1000 files
      await testADir('dir_10000_files', 'file_10000_0.txt', 15000); // 15 sec for 10000 files

      const filePath = context.getProjectRelativePath(
        nuclideUri.join('dir_1000_files', 'file_1000_0.txt'),
      );
      const editor = await atom.workspace.open(filePath);
      invariant(editor);

      editor.insertText('Bla-bla');
      expect(editor.isModified()).toBe(true);

      const teElement = atom.views.getView(editor);
      atom.commands.dispatch(teElement, 'core:save');

      await pollFor(() => !editor.isModified(), 'Failed to save fast enough 1', 500);

      editor.insertText('Another bla');
      expect(editor.isModified()).toBe(true);
      atom.commands.dispatch(teElement, 'core:save');

      await pollFor(() => !editor.isModified(), 'Failed to save fast enough 2', 500);
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
