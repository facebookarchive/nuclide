'use babel';
/* flow */
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * The DiffViewEditor manages the lifecycle of the two editors used in the diff view,
 * and controls its rendering of highlights and offsets.
 */
module.exports = class DiffViewEditor {

  constructor(editorElement: TextEditorElement) {
    this._editorElement = editorElement;
    this._editor = editorElement.getModel();
  }

  setFileContents(filePath: string, contents: string): void {
    this._editor.setText(contents);
    var grammar = atom.grammars.selectGrammar(filePath, contents);
    this._editor.setGrammar(grammar);
  }

  setReadOnly(): void {
    // Unfotunately, there is no other clean way to make an editor read only.
    // Got this from Atom's code to make an editor read-only.
    // Filed an issue: https://github.com/atom/atom/issues/6880
    this._editorElement.removeAttribute('tabindex');
    this._editor.getDecorations({class: 'cursor-line', type: 'line'})[0].destroy();
  }
};
