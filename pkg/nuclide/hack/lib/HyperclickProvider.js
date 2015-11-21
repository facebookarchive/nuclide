'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {findDefinition} from './hack';
import {goToLocation} from 'nuclide-atom-helpers';
import {trackTiming} from 'nuclide-analytics';

import {HACK_GRAMMARS_SET} from 'nuclide-hack-common/lib/constants';

class HyperclickProvider {

  @trackTiming('hack.get-definition')
  async getSuggestionForWord(
    textEditor: atom$TextEditor,
    text: string,
    range: atom$Range,
  ): Promise<?HyperclickSuggestion> {
    if (!HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    const {start: position} = range;

    // Create the actual-call promise synchronously for next calls to consume.
    const location = await findDefinition(textEditor, position.row, position.column);
    if (location) {
      // Optionally use the range returned from the definition match, if any.
      return {
        range: location.range || range,
        callback: () => goToLocation(location.file, location.line, location.column),
      };
    } else {
      return null;
    }
  }
}

module.exports = HyperclickProvider;
