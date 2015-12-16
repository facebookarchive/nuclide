'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';

export function isTextEditor(item: ?any): boolean {
  if (item == null) {
    return false;
  } else if (typeof atom.workspace.buildTextEditor === 'function') {
    // If buildTextEditor is present, then accessing the TextEditor constructor will trigger a
    // deprecation warning. Atom recommends testing for the existence of the public method of
    // TextEditor that you are using as a proxy for whether the object is a TextEditor:
    // https://github.com/atom/atom/commit/4d2d4c3. This is a fairly weak heuristic, so we test
    // for a larger set of methods that are more likely unique to TextEditor as a better heuristic:
    return typeof item.screenPositionForBufferPosition === 'function' &&
      typeof item.scanInBufferRange === 'function' &&
      typeof item.scopeDescriptorForBufferPosition === 'function';
  } else {
    const {TextEditor} = require('atom');
    return item instanceof TextEditor;
  }
}

export function createTextEditor(textEditorParams: atom$TextEditorParams): TextEditor {
  // Note that atom.workspace.buildTextEditor was introduced after the release of Atom 1.0.19.
  // As of this change, calling the constructor of TextEditor directly is deprecated. Therefore,
  // we must choose the appropriate code path based on which API is available.
  if (atom.workspace.buildTextEditor) {
    return atom.workspace.buildTextEditor(textEditorParams);
  } else {
    const {TextEditor} = require('atom');
    return new TextEditor(textEditorParams);
  }
}

/**
 * Returns a text editor that has the given path open, or null if none exists. If there are multiple
 * text editors for this path, one is chosen arbitrarily.
 */
export function editorForPath(path: NuclideUri): ?atom$TextEditor {
  // This isn't ideal but realistically iterating through even a few hundred editors shouldn't be a
  // real problem. And if you have more than a few hundred you probably have bigger problems.
  for (const editor of atom.workspace.getTextEditors()) {
    if (editor.getPath() === path) {
      return editor;
    }
  }

  return null;
}
