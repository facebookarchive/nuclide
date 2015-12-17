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

import invariant from 'assert';
import {goToLocation} from '../../atom-helpers';
import {GRAMMAR_SET} from './constants';
import {getDeclaration} from './libclang';
import findWholeRangeOfSymbol from './findWholeRangeOfSymbol';

const IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;

module.exports = {
  // It is important that this has a lower priority than the handler from
  // fb-diffs-and-tasks.
  priority: 10,
  providerName: 'nuclide-clang-atom',
  wordRegExp: IDENTIFIER_REGEXP,
  async getSuggestionForWord(
    textEditor: TextEditor,
    text: string,
    range: atom$Range,
  ): Promise<?HyperclickSuggestion> {
    if (text === '') {
      return null;
    }
    if (!GRAMMAR_SET.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    const {start: position} = range;

    const result = await getDeclaration(textEditor, position.row, position.column);
    if (result) {
      const wholeRange = findWholeRangeOfSymbol(textEditor, text, range, result.spelling, result.extent);
      return {
        range: wholeRange,
        callback: () => goToLocation(result.file, result.line, result.column),
      };
    } else {
      return null;
    }
  },
};
