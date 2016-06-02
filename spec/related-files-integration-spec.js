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

import fsPromise from '../pkg/commons-node/fsPromise';
import {join} from '../pkg/nuclide-remote-uri';
import {tempdir} from '../pkg/nuclide-test-helpers';

describeRemotableTest('Related Files Integration Test', context => {
  const TEST_FILES = ['test.cpp', 'test.h', 'testInternal.h', 'test-inl.h'].sort();
  const BAD_FILE = 'bad.txt'; // should not switch to this

  it('is able to switch between related files', () => {
    waitsForPromise({timeout: 60000}, async () => {

      // Create a temporary directory and some test files.
      const testDir = await fsPromise.realpath(await tempdir.mkdir('related-files'));
      await Promise.all(TEST_FILES.concat([BAD_FILE]).map(
        file => fsPromise.writeFile(join(testDir, file), ''),
      ));

      await context.setProject(testDir);
      await atom.workspace.open(context.getProjectRelativePath(TEST_FILES[0]));
    });

    // Should go over the list in reverse order alphabetically.
    for (let i = 0; i < TEST_FILES.length; i++) {
      runs(() => {
        const textEditor = atom.workspace.getActiveTextEditor();
        invariant(textEditor);
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
        const textEditorView = atom.views.getView(textEditor);
        // No keyboard shortcut for this.
        atom.commands.dispatch(
          textEditorView,
          'nuclide-related-files:jump-to-previous-related-file',
        );
      });
      waitsForFile(TEST_FILES[(i + 1) % TEST_FILES.length]);
    }

    // Add one dummy expect just so we can verify that the test completed.
    expect(true).toBe(true);
  });
});
