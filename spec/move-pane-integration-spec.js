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
import {__testUseOnly_activatePackage as activatePackage} from '..';
import {activateAllPackages, deactivateAllPackages} from '../pkg/nuclide/integration-test-helpers';

describe('Move Pane Integration Tests', () => {
  let movePanePromise: Promise<atom$Package> = (null : any);

  beforeEach(() => {
    waitsForPromise({timeout: 240000}, async () => {
      // Activate all packages.
      await activateAllPackages();
      // Load move pane package -- it won't be activated until one of its commands is used.
      movePanePromise = activatePackage('nuclide-move-pane');
      // Set config.
      atom.config.set('core.destroyEmptyPanes', true);
      // Open two tabs.
      await atom.workspace.open('file1.txt');
      await atom.workspace.open('file2.txt');

      jasmine.attachToDOM(atom.views.getView(atom.workspace));
    });
  });

  afterEach(() => {
    deactivateAllPackages();
  });

  describe('Checks that each direction creates new panes', () => {
    testMovePaneDirection('up', movePanePromise);
    testMovePaneDirection('down', movePanePromise);
    testMovePaneDirection('left', movePanePromise);
    testMovePaneDirection('right', movePanePromise);
  });
});

function testMovePaneDirection(
  direction: 'up' | 'down' | 'left' | 'right',
  movePanePromise: Promise<atom$Package>,
): void {
  it(`checks move pane direction -- ${direction}`, () => {
    waitsForPromise(async () => {
      const editor = atom.workspace.getActiveTextEditor();
      invariant(editor);
      const activeTitle = editor.getTitle();
      expect(atom.workspace.getPanes().length).toBe(1);
      const activeEditor = atom.workspace.getActiveTextEditor();
      invariant(activeEditor);
      const commandResult = atom.commands.dispatch(
        atom.views.getView(activeEditor),
        `nuclide-move-pane:move-tab-to-new-pane-${direction}`,
      );
      await movePanePromise;
      expect(commandResult).toBe(true);

      expect(atom.workspace.getPanes().length).toBe(2);
      expect(editor.getTitle()).toBe(activeTitle);
      expect(atom.workspace.getTextEditors().length).toBe(2);
    });
  });
}
