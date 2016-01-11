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
import {
  activateAllPackages,
  deactivateAllPackages,
  dispatchKeyboardEvent,
} from '../../pkg/nuclide/integration-test-helpers';

export function testMovePaneDirection(
  direction: 'up' | 'down' | 'left' | 'right',
): void {
  it(`checks move pane direction -- ${direction}`, () => {
    waitsForPromise({timeout: 60000}, async () => {
      jasmine.attachToDOM(atom.views.getView(atom.workspace));
      // Activate all packages.
      await activateAllPackages();
      // Set config.
      atom.config.set('core.destroyEmptyPanes', true);
      // Open two tabs.
      await atom.workspace.open('file1.txt');
      await atom.workspace.open('file2.txt');

      const editor = atom.workspace.getActiveTextEditor();
      invariant(editor);
      const activeTitle = editor.getTitle();
      expect(atom.workspace.getPanes().length).toBe(1);
      const activeEditor = atom.workspace.getActiveTextEditor();
      invariant(activeEditor);

      // Simulate keyboard commands.
      const editorView = atom.views.getView(activeEditor);
      dispatchKeyboardEvent('k', editorView, {cmd: true});
      dispatchKeyboardEvent(direction, editorView);

      expect(atom.workspace.getPanes().length).toBe(2);
      expect(editor.getTitle()).toBe(activeTitle);
      expect(atom.workspace.getTextEditors().length).toBe(2);
      deactivateAllPackages();
    });
  });
}
