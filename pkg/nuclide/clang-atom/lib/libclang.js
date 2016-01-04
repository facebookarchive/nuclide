'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  ClangCompileResult,
  ClangCompletionsResult,
  ClangDeclarationResult,
} from '../../clang';

import {getServiceByNuclideUri} from '../../remote-connection';

module.exports = {

  getDiagnostics(editor: atom$TextEditor): Promise<?ClangCompileResult> {
    const src = editor.getPath();
    const contents = editor.getText();

    return getServiceByNuclideUri('ClangService', src)
        .compile(src, contents)
        .toPromise();
  },

  getCompletions(editor: atom$TextEditor, prefix: string): Promise<?ClangCompletionsResult> {
    const src = editor.getPath();
    const cursor = editor.getLastCursor();

    const line = cursor.getBufferRow();
    const column = cursor.getBufferColumn();
    const tokenStartColumn = column - prefix.length;

    return getServiceByNuclideUri('ClangService', src)
        .getCompletions(src, editor.getText(), line, column, tokenStartColumn, prefix);
  },

  /**
   * If a location can be found for the declaration, it will be available via
   * the 'location' field on the returned object.
   */
  getDeclaration(
    editor: atom$TextEditor,
    line: number,
    column: number,
  ): Promise<?ClangDeclarationResult> {
    const src = editor.getPath();
    return getServiceByNuclideUri('ClangService', src)
        .getDeclaration(src, editor.getText(), line, column);
  },

  reset(editor: atom$TextEditor) {
    const src = editor.getPath();
    if (src != null) {
      return getServiceByNuclideUri('ClangService', src)
        .reset(src);
    }
  },

};
