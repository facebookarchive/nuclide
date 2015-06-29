'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function extractWordAtPosition(
    editor: atom$TextEditor,
    position: atom$Point,
    wordRegex: ?RegExp): ?{word: string; range: Range} {
  if (!wordRegex) {
    wordRegex = editor.getLastCursor().wordRegExp();
  }
  var buffer = editor.getBuffer();
  var {row, column} = position;
  var rowRange = buffer.rangeForRow(row);
  var matchData;
  // Extract the expression from the row text.
  buffer.scanInRange(wordRegex, rowRange, (data) => {
    var {range} = data;
    if (range.containsPoint(position)) {
      matchData = data;
    }
    // Stop the scan if the scanner has passed our position.
    if (range.end.column > column) {
      data.stop();
    }
  });
  if (matchData) {
    return {
      wordMatch: matchData.match,
      range: matchData.range,
    };
  } else {
    return null;
  }
}

module.exports = extractWordAtPosition;
