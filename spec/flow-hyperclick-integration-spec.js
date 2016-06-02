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
  busySignal,
  copyFixture,
  deactivateAllPackages,
  dispatchKeyboardEvent,
  waitsForFilePosition,
  jasmineIntegrationTestSetup,
  setLocalProject,
} from '../pkg/nuclide-integration-test-helpers';
import path from 'path';

describe('Flow Hyperclick', () => {
  it('tests flow hyperclick example', () => {
    let textEditor: atom$TextEditor = (null : any);
    let flowProjectPath: string = (null : any);

    waitsForPromise({timeout: 240000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate nuclide packages.
      await activateAllPackages();
      // Copy flow project to a temporary location.
      flowProjectPath = await copyFixture('flow_project_1');

      // Add this directory as an atom project.
      setLocalProject(flowProjectPath);
      // Open a file in the flow project we copied, and get reference to the editor's HTML.
      textEditor = await atom.workspace.open(path.join(flowProjectPath, 'main.js'));
    });

    waitsFor('spinner to start', 10000, () => {
      return busySignal.isBusy();
    });

    waitsFor('spinner to stop', 30000, () => {
      return !busySignal.isBusy();
    });

    runs(() => {
      textEditor.setCursorBufferPosition([14, 13]);
      // shortcut key for hyperclick:confirm-cursor
      dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
    });

    waitsForFilePosition('Foo.js', 11, 2);

    waitsForPromise(async () => {
      deactivateAllPackages();
    });
  });
});
