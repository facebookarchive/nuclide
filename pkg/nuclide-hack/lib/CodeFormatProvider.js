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
import {getFileVersionOfEditor} from '../../nuclide-open-files';

export default class CodeFormatProvider {

  @trackTiming('hack.formatCode')
  async formatCode(editor: atom$TextEditor, range: atom$Range): Promise<string> {
    const fileVersion = await getFileVersionOfEditor(editor);
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (hackLanguage == null || fileVersion == null) {
      return editor.getTextInBufferRange(range);
    }

    return await hackLanguage.formatSource(
      fileVersion,
      range);
  }
}
