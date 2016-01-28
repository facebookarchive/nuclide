'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnection} from '../../pkg/nuclide/remote-connection';

import invariant from 'assert';

import {
  activateAllPackages,
  addRemoteProject,
  deactivateAllPackages,
  dispatchKeyboardEvent,
  jasmineIntegrationTestSetup,
  setLocalProject,
  startNuclideServer,
  stopNuclideServer,
  waitsForFile,
} from '../../pkg/nuclide/integration-test-helpers';

import {fsPromise} from '../../pkg/nuclide/commons';
import {join} from '../../pkg/nuclide/remote-uri';
import {tempdir} from '../../pkg/nuclide/test-helpers';

export function runTest(remote: boolean) {
  let connection: ?RemoteConnection;
  let testDir: string = (null: any);
  const TEST_FILES = ['test.cpp', 'test.h', 'testInternal.h', 'test-inl.h'].sort();
  const BAD_FILE = 'bad.txt'; // should not switch to this

  waitsForPromise({timeout: 60000}, async () => {
    jasmineIntegrationTestSetup();
    // Activate nuclide packages.
    await activateAllPackages();

    // Create a temporary directory and some test files.
    testDir = await fsPromise.realpath(await tempdir.mkdir('related-files'));
    await Promise.all(TEST_FILES.concat([BAD_FILE]).map(
      file => fsPromise.writeFile(join(testDir, file), ''),
    ));

    if (remote) {
      await startNuclideServer();
      connection = await addRemoteProject(testDir);
      invariant(connection != null, 'connection was not established');
      testDir = connection.getUriForInitialWorkingDirectory();
    } else {
      setLocalProject(testDir);
    }
    const file = join(testDir, TEST_FILES[0]);
    await atom.workspace.open(file);
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

  runs(() => {
    if (connection != null) {
      stopNuclideServer(connection);
    }
    deactivateAllPackages();
  });
}
