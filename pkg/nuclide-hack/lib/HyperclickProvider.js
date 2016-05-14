'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickSuggestion} from '../../hyperclick/lib/types';

import {goToLocation} from '../../commons-atom/go-to-location';
import {trackTiming} from '../../nuclide-analytics';
import {getHackLanguageForUri} from './HackLanguage';
import {HACK_GRAMMARS_SET} from '../../nuclide-hack-common';

export class HyperclickProvider {

  @trackTiming('hack.get-definition')
  async getSuggestion(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?HyperclickSuggestion> {
    if (!HACK_GRAMMARS_SET.has(editor.getGrammar().scopeName)) {
      return null;
    }
    const filePath = editor.getPath();
    if (filePath == null) {
      return null;
    }
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (hackLanguage == null) {
      return null;
    }

    const line = position.row;
    const column = position.column;
    const contents = editor.getText();

    const definition = await hackLanguage.getIdeDefinition(
      filePath, contents, line + 1, column + 1);
    return definition == null ? null : {
      range: definition.queryRange,
      callback() {
        goToLocation(definition.path, definition.line - 1, definition.column - 1);
      },
    };
  }
}
