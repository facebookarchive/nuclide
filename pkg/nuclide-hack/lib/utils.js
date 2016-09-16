'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {wordAtPosition} from '../../commons-atom/range';

const HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

export function getIdentifierAndRange(
  editor: atom$TextEditor,
  position: atom$Point,
): ?{id: string, range: atom$Range} {
  const matchData = wordAtPosition(editor, position, HACK_WORD_REGEX);
  return (matchData == null || matchData.wordMatch.length === 0) ? null
      : {id: matchData.wordMatch[0], range: matchData.range};
}

export function getIdentifierAtPosition(editor: atom$TextEditor, position: atom$Point): ?string {
  const result = getIdentifierAndRange(editor, position);
  return result == null ? null : result.id;
}
