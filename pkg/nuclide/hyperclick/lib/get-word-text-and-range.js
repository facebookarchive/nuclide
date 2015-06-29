'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Range} = require('atom');

/**
 * Returns the text and range for the word that contains the given position.
 */
function getWordTextAndRange(
    textEditor: TextEditor,
    position: atom$Point,
    wordRegExp?: ?RegExp): {text: string; range: Range} {
  if (!wordRegExp) {
    wordRegExp = textEditor.getLastCursor().wordRegExp();
  }

  var textAndRange = {text: '', range: new Range(position, position)};
  var buffer = textEditor.getBuffer();
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

  return textAndRange;
}

module.exports = getWordTextAndRange;
