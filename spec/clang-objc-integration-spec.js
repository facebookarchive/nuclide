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
  copyFixture,
  deactivateAllPackages,
  dispatchKeyboardEvent,
  jasmineIntegrationTestSetup,
  waitsForFile,
} from '../pkg/nuclide/integration-test-helpers';

import invariant from 'assert';
import {Point} from 'atom';
import path from 'path';

/**
 * This is a full integration test for (local) Objective-C support in Nuclide.
 * After loading a test Buck project, this tests:
 *
 * 1. autocompletion support
 * 2. diagnostics for errors
 * 3. go-to-definition with Hyperclick
 */
describe('Clang Integration Test (objc)', () => {
  it('handles basic IDE commands', () => {
    let objcPath;
    let textEditor: atom$TextEditor;
    let textEditorView: HTMLElement;
    let busySignal: HTMLElement;
    waitsForPromise({timeout: 60000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate atom packages.
      await activateAllPackages();

      objcPath = await copyFixture('objc_project_1');
      textEditor = await atom.workspace.open(path.join(objcPath, 'Hello.m'));
      textEditorView = atom.views.getView(textEditor);

      busySignal = atom.views.getView(atom.workspace)
        .querySelector('.nuclide-busy-signal-status-bar');
    });

    waitsForFile('Hello.m');

    waitsFor('compilation to begin', 10000, () => {
      return busySignal.classList.contains('nuclide-busy-signal-status-bar-busy');
    });

    waitsFor('compilation to finish', 30000, () => {
      return busySignal.classList.contains('nuclide-busy-signal-status-bar-idle');
    });

    runs(() => {
      // Trigger autocompletion.
      textEditor.setCursorBufferPosition([17, 1]);
      textEditor.insertText('N');
      textEditor.insertText('S');
      textEditor.insertText('O');
    });

    let autocompleteMenuView: HTMLElement;
    waitsFor('autocomplete suggestions to render', 10000, () => {
      autocompleteMenuView = textEditorView.querySelector('.autocomplete-plus');
      if (autocompleteMenuView != null) {
        return autocompleteMenuView.querySelector('.right-label');
      }
      return null;
    });

    runs(() => {
      // The first result should be NSObject, with an annotated type.
      expect(autocompleteMenuView.querySelector('.right-label').innerText).toBe('ObjCInterface');
      expect(autocompleteMenuView.querySelector('.word').innerText).toBe('NSObject');

      // Confirm autocomplete.
      dispatchKeyboardEvent('enter', document.activeElement);
      expect(textEditorView.querySelector('.autocomplete-plus')).not.toExist();
      const lineText = textEditor.lineTextForBufferRow(textEditor.getCursorBufferPosition().row);
      expect(lineText).toBe('{NSObject');

      // This is a clear syntax error, so we should get an error on save.
      textEditor.save();
    });

    waitsFor('error to show up in diagnostics', 10000, () => {
      // $FlowFixMe
      const errors = atom.views.getView(atom.workspace)
        .querySelector('.nuclide-diagnostics-status-bar-error');
      if (errors instanceof HTMLElement) {
        return errors.innerText.trim() === '1';
      }
    });

    runs(() => {
      // Trigger Hyperclick on NSLog(...)
      textEditor.setCursorBufferPosition([11, 5]);
      dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
    });

    waitsForFile('FoundationStub.h');

    runs(() => {
      // Definition of NSLog
      const editor = atom.workspace.getActiveTextEditor();
      invariant(editor);
      expect(editor.getCursorBufferPosition()).toEqual(new Point(45, 12));

      // Deactivate nuclide packages.
      deactivateAllPackages();
    });
  });
});
