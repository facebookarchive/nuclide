'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type LibClangProcess from './LibClangProcess';
import type {HyperclickSuggestion} from 'hyperclick-interfaces';

import invariant from 'assert';

const {goToLocation} = require('nuclide-atom-helpers');
const findWholeRangeOfSymbol = require('./findWholeRangeOfSymbol');

const GRAMMARS = new Set([
  'source.c',
  'source.cpp',
  'source.objc',
  'source.objcpp',
]);

let libClangProcessSingleton;
function getLibClangProcess(): LibClangProcess {
  if (!libClangProcessSingleton) {
    libClangProcessSingleton = require('./main-shared').getSharedLibClangProcess();
  }
  invariant(libClangProcessSingleton);
  return libClangProcessSingleton;
}

module.exports = {
  // It is important that this has a lower priority than the handler from
  // fb-diffs-and-tasks.
  priority: 10,
  providerName: 'nuclide-clang-atom',
  async getSuggestionForWord(
    textEditor: TextEditor,
    text: string,
    range: atom$Range,
  ): Promise<?HyperclickSuggestion> {
    if (!GRAMMARS.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    const {start: position} = range;

    const result = await getLibClangProcess().getDeclaration(textEditor, position.row, position.column);
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
