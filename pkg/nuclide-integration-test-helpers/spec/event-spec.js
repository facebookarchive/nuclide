'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {dispatchKeyboardEvent} from '../lib/event';

describe('event utilities', () => {
  it('sends copy and paste', () => {
    waitsForPromise(async () => {
      const editor = await atom.workspace.open('file.txt');
      jasmine.attachToDOM(atom.views.getView(atom.workspace));
      editor.insertText('text');
      const events = [];
      atom.keymaps.onDidMatchBinding(event => events.push(event));

      // Copy line.
      dispatchKeyboardEvent('c', document.activeElement, {cmd: true});
      // Paste copied line.
      dispatchKeyboardEvent('v', document.activeElement, {cmd: true});

      expect(events.length).toBe(2);
      expect(events[0].keystrokes).toBe('cmd-c');
      expect(events[1].keystrokes).toBe('cmd-v');
      expect(editor.getText()).toBe('texttext');
    });
  });

  it('sends escape', () => {
    waitsForPromise(async () => {
      await atom.workspace.open('file.txt');
      jasmine.attachToDOM(atom.views.getView(atom.workspace));
      const events = [];
      atom.keymaps.onDidMatchBinding(event => events.push(event));

      // Hit escape key.
      dispatchKeyboardEvent('escape', document.activeElement);

      expect(events.length).toBe(1);
      expect(events[0].keystrokes).toBe('escape');
    });
  });
});
