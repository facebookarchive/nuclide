'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import path from 'path';

import {
  activateAllPackages,
  copyFixture,
  deactivateAllPackages,
  startFlowServer,
  stopFlowServer,
  dispatchKeyboardEvent,
  waitsForFile,
} from '../pkg/nuclide/integration-test-helpers';

xdescribe('Flow Autocomplete', () => {
  it('tests simple autocomplete example', () => {
    let textEditor: atom$TextEditor = (null : any);
    let flowProjectPath: string = (null : any);

    waitsForPromise({timeout: 240000}, async () => {
      // Attach to DOM so we can select elements/send events/etc.
      jasmine.attachToDOM(atom.views.getView(atom.workspace));
      // Unmock timer functions.
      jasmine.useRealClock();
      // Activate nuclide packages.
      await activateAllPackages();
      // Copy flow project to a temporary location.
      flowProjectPath = await copyFixture('flow_project_1');
      // Start the flow server so we can query for autocomplete results later.
      await startFlowServer(flowProjectPath);
      // Open a file in the flow project we copied, and get reference to the editor's HTML.
      textEditor = await atom.workspace.open(path.join(flowProjectPath, 'main.js'));

      textEditor.setCursorBufferPosition([14, 13]);

      // shortcut key for hyperclick:confirm-cursor
      dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
    });

    waitsForFile('Foo.js');

    runs(() => {
      const editor = atom.workspace.getActiveTextEditor();
      invariant(editor != null);
      const pos = editor.getCursorBufferPosition();
      expect(pos.row).toBe(11);
      expect(pos.column).toBeGreaterThan(1);
      expect(pos.column).toBeLessThan(6);
    });

    waitsForPromise(async () => {
      await stopFlowServer(flowProjectPath);
      deactivateAllPackages();
    });
  });
});
