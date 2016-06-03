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
  copyFixture,
  dispatchKeyboardEvent,
  waitsForFilePosition,
} from '../pkg/nuclide-integration-test-helpers';
import {describeRemotableTest} from './utils/remotable-tests';

describeRemotableTest('Ctags Hyperclick', context => {
  it('tests ctags hyperclick example', () => {
    let textEditor: atom$TextEditor;
    waitsForPromise({timeout: 60000}, async () => {
      // Create a temporary directory and some test files.
      const testDir = await copyFixture('ctags_project');
      await context.setProject(testDir);
      textEditor = await atom.workspace.open(context.getProjectRelativePath('a.txt'));
    });

    runs(() => {
      textEditor.setCursorBufferPosition([0, 5]);
      // shortcut key for hyperclick:confirm-cursor
      dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
    });

    waitsForFilePosition('a.txt', 0, 0);

    // 'b' has multiple options.
    runs(() => {
      textEditor.setCursorBufferPosition([3, 5]);
      dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
    });

    let results;
    waitsFor(() => {
      results = atom.views.getView(atom.workspace)
        .querySelectorAll('.hyperclick-result-item');
      return results.length > 0;
    });

    runs(() => {
      expect(results.length).toBe(2);
      expect(results[0].innerText).toBe('b (a.txt)');
      expect(results[1].innerText).toBe('function test::b (b.txt)');
    });
  });
});
