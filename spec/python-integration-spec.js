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
  waitsForFilePosition,
} from '../pkg/nuclide-integration-test-helpers';

import path from 'path';

describe('Python Integration Test', () => {
  let pyProjPath;
  let textEditor: atom$TextEditor = (null : any);
  let textEditorView: HTMLElement = (null : any);

  beforeEach(() => {
    waitsForPromise({timeout: 60000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate atom packages.
      await activateAllPackages();

      pyProjPath = await copyFixture('python_project_1');
      textEditor = await atom.workspace.open(path.join(pyProjPath, 'Foo.py'));
      textEditorView = atom.views.getView(textEditor);
    });

    waitsForFile('Foo.py');
  });

  afterEach(() => {
    // Deactivate nuclide packages.
    deactivateAllPackages();
  });


  it('gives autocomplete suggestions', () => {
    runs(() => {
      // Trigger autocompletion.
      textEditor.setCursorBufferPosition([13, 1]);
      textEditor.insertText('os.pa');
      textEditor.insertText('t');
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
      // The first suggestion should be 'path' as in 'os.path'.
      // $FlowIgnore -- innerText is nonstandard.
      expect(autocompleteMenuView.querySelector('.word').innerText).toBe('path');
    });
  });

  it('supports hyperclicking to goto definitions', () => {
    runs(() => {
      textEditor.setCursorBufferPosition([6, 8]);
      // shortcut key for hyperclick:confirm-cursor
      dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
    });

    waitsForFilePosition('os.py', 0, 0);
  });

});
