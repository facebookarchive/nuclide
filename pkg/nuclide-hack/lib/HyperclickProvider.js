'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickSuggestion} from '../../hyperclick-interfaces';

import {Range} from 'atom';
import {goToLocation} from '../../nuclide-atom-helpers';
import {trackTiming} from '../../nuclide-analytics';
import {getHackLanguageForUri} from './HackLanguage';
import {HACK_GRAMMARS_SET} from '../../nuclide-hack-common';
import invariant from 'assert';

export class HyperclickProvider {

  @trackTiming('hack.get-definition')
  async getSuggestionForWord(
    editor: atom$TextEditor,
    text: string,
    range: atom$Range,
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

    const line = range.start.row;
    const column = range.start.column;
    const contents = editor.getText();
    const buffer = editor.getBuffer();
    const lineText = buffer.lineForRow(line);
    const definitions = await hackLanguage.getDefinition(
      filePath, contents, line + 1, column + 1, lineText
    );

    if (definitions.length === 0) {
      return null;
    }

    // Optionally use the range returned from the definition matches, if any.
    // When the word regex isn't good enough for matching ranges (e.g. in case of XHP),
    // the only non-null returned results would be for the xhp range.
    // Hence, considered the most accurate range for the definition result(s).
    let newRange = range;
    const locationResult = definitions.filter(
      definition => definition.searchStartColumn != null && definition.searchEndColumn != null)[0];
    if (locationResult != null) {
      invariant(locationResult.searchStartColumn != null && locationResult.searchEndColumn != null);
      newRange = new Range(
        [line, locationResult.searchStartColumn],
        [line, locationResult.searchEndColumn]);
    }

    const callbacks = definitions.map(location => {
      return {
        title: `${location.name} : ${location.scope}`,
        callback() {
          goToLocation(location.path, location.line, location.column);
        },
      };
    });
    return {
      range: newRange,
      callback: callbacks.length === 1 ? callbacks[0].callback : callbacks,
    };
  }
}
