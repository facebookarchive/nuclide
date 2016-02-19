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

import featureConfig from '../../feature-config';
import invariant from 'assert';
import {getServiceByNuclideUri} from '../../remote-connection';

type NuclideClangConfig = {
  enableDefaultFlags: boolean,
  defaultFlags: Array<string>,
};

function getDefaultFlags(): ?Array<string> {
  const config: NuclideClangConfig = (featureConfig.get('nuclide-clang-atom'): any);
  if (!config.enableDefaultFlags) {
    return null;
  }
  return config.defaultFlags;
}

module.exports = {

  async getDiagnostics(editor: atom$TextEditor): Promise<?ClangCompileResult> {
    const src = editor.getPath();
    const contents = editor.getText();

    const defaultFlags = getDefaultFlags();
    const service = getServiceByNuclideUri('ClangService', src);
    invariant(service);

    return service
        .compile(src, contents, defaultFlags)
        .toPromise();
  },

  async getCompletions(editor: atom$TextEditor, prefix: string): Promise<?ClangCompletionsResult> {
    const src = editor.getPath();
    const cursor = editor.getLastCursor();

    const line = cursor.getBufferRow();
    const column = cursor.getBufferColumn();
    const tokenStartColumn = column - prefix.length;

    const defaultFlags = getDefaultFlags();
    const service = getServiceByNuclideUri('ClangService', src);
    invariant(service);

    return service
      .getCompletions(
        src,
        editor.getText(),
        line,
        column,
        tokenStartColumn,
        prefix,
        defaultFlags,
      );
  },

  /**
   * If a location can be found for the declaration, it will be available via
   * the 'location' field on the returned object.
   */
  async getDeclaration(
    editor: atom$TextEditor,
    line: number,
    column: number,
  ): Promise<?ClangDeclarationResult> {
    const src = editor.getPath();
    const defaultFlags = getDefaultFlags();

    const service = getServiceByNuclideUri('ClangService', src);
    invariant(service);

    return service
        .getDeclaration(src, editor.getText(), line, column, defaultFlags);
  },

  formatCode(editor: atom$TextEditor, range: atom$Range): Promise<{
    newCursor: number,
    formatted: string,
  }> {
    const fileUri = editor.getPath();
    const buffer = editor.getBuffer();
    const cursor = buffer.characterIndexForPosition(editor.getLastCursor().getBufferPosition());
    const startIndex = buffer.characterIndexForPosition(range.start);
    const endIndex = buffer.characterIndexForPosition(range.end);

    const service = getServiceByNuclideUri('ClangService', fileUri);
    invariant(service);

    return service
        .formatCode(fileUri, editor.getText(), cursor, startIndex, endIndex - startIndex);
  },

  reset(editor: atom$TextEditor) {
    const src = editor.getPath();
    if (src != null) {
      const service = getServiceByNuclideUri('ClangService', src);
      invariant(service);
      return service.reset(src);
    }
  },

};
