'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Range} from 'atom';

export function defaultWordRegExpForEditor(
  textEditor: atom$TextEditor,
): ?RegExp {
  const lastCursor = textEditor.getLastCursor();
  if (!lastCursor) {
    return null;
  }
  return lastCursor.wordRegExp();
}

/**
 * Returns the text and range for the word that contains the given position.
 */

type WordTextAndRange = {text: string, range: Range};

export function getWordTextAndRange(
  textEditor: TextEditor,
  position: atom$Point,
  wordRegExp_?: ?RegExp,
): WordTextAndRange {
  let wordRegExp = wordRegExp_;
  let textAndRange: ?WordTextAndRange = null;

  wordRegExp = wordRegExp || defaultWordRegExpForEditor(textEditor);

  if (wordRegExp) {
    const buffer = textEditor.getBuffer();
    buffer.scanInRange(wordRegExp, buffer.rangeForRow(position.row), data => {
      if (data.range.containsPoint(position)) {
        textAndRange = {
          text: data.matchText,
          range: data.range,
        };
        data.stop();
      } else if (data.range.end.column > position.column) {
        // Stop the scan if the scanner has passed our position.
        data.stop();
      }
    });
  }

  if (!textAndRange) {
    textAndRange = {text: '', range: new Range(position, position)};
  }

  return textAndRange;
}
