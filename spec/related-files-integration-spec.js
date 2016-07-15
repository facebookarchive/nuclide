'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {describeRemotableTest} from './utils/remotable-tests';
import invariant from 'assert';
import {
  dispatchKeyboardEvent,
  waitsForFile,
} from '../pkg/nuclide-integration-test-helpers';

import {fixtures} from '../pkg/nuclide-test-helpers';
import nuclideUri from '../pkg/nuclide-remote-uri';

describeRemotableTest('Related Files Integration Test', context => {
  // Normally these would be .cpp / .h files, but avoid spinning up C++ processes for speed.
  const TEST_FILES = ['test-inl.def', 'test.abc', 'test.def', 'testInternal.def'];
  const BAD_FILES = ['test.abc~', 'bad.txt', '.watchmanconfig'];  // should not switch to these

  it('is able to switch between related files', () => {
    waitsForPromise({timeout: 60000}, async () => {

      // Create a temporary directory and some test files.
      const testDir = await fixtures.generateFixture(
        'related-files',
        new Map(TEST_FILES.concat(BAD_FILES).map(f => [f]))
      );

      await context.setProject(testDir);
      await atom.workspace.open(context.getProjectRelativePath(TEST_FILES[0]));
    });

    // Should go over the list in reverse order alphabetically.
    for (let i = 0; i < TEST_FILES.length; i++) {
      runs(() => {
        const textEditor = atom.workspace.getActiveTextEditor();
        invariant(textEditor);
        const path = textEditor.getPath();
        invariant(path != null);
        expect(nuclideUri.basename(path)).toBe(
          TEST_FILES[(TEST_FILES.length - i) % TEST_FILES.length]
        );
        const textEditorView = atom.views.getView(textEditor);
        dispatchKeyboardEvent('n', textEditorView, {cmd: true, alt: true});
      });
      waitsForFile(TEST_FILES[TEST_FILES.length - i - 1]);
    }

    // Reverse direction.
    for (let i = 0; i < TEST_FILES.length; i++) {
      runs(() => {
        const textEditor = atom.workspace.getActiveTextEditor();
        invariant(textEditor);
        const path = textEditor.getPath();
        invariant(path != null);
        expect(nuclideUri.basename(path)).toBe(TEST_FILES[i]);
        const textEditorView = atom.views.getView(textEditor);
        // No keyboard shortcut for this.
        atom.commands.dispatch(
          textEditorView,
          'nuclide-related-files:jump-to-previous-related-file',
        );
      });
      waitsForFile(TEST_FILES[(i + 1) % TEST_FILES.length]);
    }
  });
});
