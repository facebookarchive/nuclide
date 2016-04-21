'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {activatePaneItem} from '../lib/workspace';

describe('activatePaneItem', () => {
  let pane1: atom$Pane = (null: any);
  let pane2: atom$Pane = (null: any);

  let editor1: atom$TextEditor = (null: any);
  let editor2: atom$TextEditor = (null: any);
  let editor3: atom$TextEditor = (null: any);


  beforeEach(() => {
    waitsForPromise(async () => {
      pane1 = atom.workspace.getActivePane();
      editor1 = await atom.workspace.open();
      editor2 = await atom.workspace.open();

      pane2 = pane1.splitRight();
      editor3 = await atom.workspace.open();

      // Just so we have a known starting state for the tests
      activatePaneItem(editor1);
      expectPaneAndItemToBeActive(pane1, editor1);
    });
  });

  it('should activate the pane for the editor', () => {
    activatePaneItem(editor3);
    expectPaneAndItemToBeActive(pane2, editor3);
  });

  it('should activate a different editor in the current pane', () => {
    activatePaneItem(editor2);
    expectPaneAndItemToBeActive(pane1, editor2);
  });
});

function expectPaneAndItemToBeActive(pane: atom$Pane, item: Object): void {
  expect(pane.isActive()).toBeTruthy();
  expect(atom.workspace.paneForItem(item)).toBe(pane);
  expect(pane.getActiveItem()).toBe(item);
}
