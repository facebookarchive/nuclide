'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultWordRegExpForEditor = defaultWordRegExpForEditor;
exports.getWordTextAndRange = getWordTextAndRange;

var _atom = require('atom');

function defaultWordRegExpForEditor(textEditor) {
  const lastCursor = textEditor.getLastCursor();
  if (!lastCursor) {
    return null;
  }
  return lastCursor.wordRegExp();
}

/**
 * Returns the text and range for the word that contains the given position.
 */

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function getWordTextAndRange(textEditor, position, wordRegExp_) {
  let wordRegExp = wordRegExp_;
  let textAndRange = null;

  wordRegExp = wordRegExp || defaultWordRegExpForEditor(textEditor);

  if (wordRegExp) {
    const buffer = textEditor.getBuffer();
    buffer.scanInRange(wordRegExp, buffer.rangeForRow(position.row), data => {
      if (data.range.containsPoint(position)) {
        textAndRange = {
          text: data.matchText,
          range: data.range
        };
        data.stop();
      } else if (data.range.end.column > position.column) {
        // Stop the scan if the scanner has passed our position.
        data.stop();
      }
    });
  }

  if (!textAndRange) {
    textAndRange = { text: '', range: new _atom.Range(position, position) };
  }

  return textAndRange;
}