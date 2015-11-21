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
    const locations = await findDefinition(textEditor, position.row, position.column);
    if (locations == null) {
      return null;
    }
    // Optionally use the range returned from the definition matches, if any.
    // When the word regex isn't good enough for matching ranges (e.g. in case of XHP),
    // the only non-null returned results would be for the xhp range.
    // Hence, considered the most accurate range for the definition result(s).
    const newRange = locations
      .map(location => location.range)
      .filter(locationRange => locationRange != null)
      [0];
    const callbacks = locations.map(location => {
      return {
        title: `${location.name} : ${location.scope}`,
        callback() {
          goToLocation(location.path, location.line, location.column);
        },
      };
    });
    return {
      range: newRange || range,
      callback: callbacks.length === 1 ? callbacks[0].callback : callbacks,
    };
  }
}

module.exports = HyperclickProvider;
