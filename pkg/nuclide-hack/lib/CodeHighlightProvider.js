'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getHackLanguageForUri} from './HackLanguage';
import {getFileVersionOfEditor} from '../../nuclide-open-files';
import {Range} from 'atom';

export default class CodeHighlightProvider {
  async highlight(editor: atom$TextEditor, position: atom$Point): Promise<Array<atom$Range>> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (hackLanguage == null || fileVersion == null) {
      return [];
    }

    return (await hackLanguage.highlight(
      fileVersion,
      position)).map(range => new Range(range.start, range.end));
  }
}
