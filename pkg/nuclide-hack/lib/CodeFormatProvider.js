'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {trackTiming} from '../../nuclide-analytics';
import {getHackLanguageForUri} from './HackLanguage';

class CodeFormatProvider {

  @trackTiming('hack.formatCode')
  formatCode(editor: atom$TextEditor, range: atom$Range): Promise<string> {
    return formatSourceFromEditor(editor, range);
  }

}

async function formatSourceFromEditor(editor: atom$TextEditor, range: atom$Range): Promise<string> {
  const buffer = editor.getBuffer();
  const filePath = editor.getPath();
  const hackLanguage = await getHackLanguageForUri(filePath);
  if (!hackLanguage || !filePath) {
    return buffer.getTextInRange(range);
  }

  const startPosition = buffer.characterIndexForPosition(range.start);
  const endPosition = buffer.characterIndexForPosition(range.end);
  return await hackLanguage.formatSource(buffer.getText(), startPosition + 1, endPosition + 1);
}

module.exports = CodeFormatProvider;
