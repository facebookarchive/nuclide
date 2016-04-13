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
import {getHackLanguageForUri} from './HackLanguage';
import {getIdentifierAtPosition} from './utils';

export default class CodeHighlightProvider {
  highlight(editor: atom$TextEditor, position: atom$Point): Promise<Array<atom$Range>> {
    return codeHighlightFromEditor(editor, position);
  }
}

async function codeHighlightFromEditor(
  editor: atom$TextEditor,
  position: atom$Point,
): Promise<Array<atom$Range>> {
  const filePath = editor.getPath();
  const hackLanguage = await getHackLanguageForUri(filePath);
  if (!hackLanguage) {
    return [];
  }
  invariant(filePath != null);

  const id = getIdentifierAtPosition(editor, position);
  if (id == null || !id.startsWith('$')) {
    return [];
  }

  return hackLanguage.highlightSource(
    filePath,
    editor.getText(),
    position.row + 1,
    position.column,
  );
}
