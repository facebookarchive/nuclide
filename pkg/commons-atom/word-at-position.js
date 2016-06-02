Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = wordAtPosition;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function wordAtPosition(editor, position, wordRegex) {
  if (!wordRegex) {
    wordRegex = editor.getLastCursor().wordRegExp();
  }
  var buffer = editor.getBuffer();
  var row = position.row;
  var column = position.column;

  var rowRange = buffer.rangeForRow(row);
  var matchData = undefined;
  // Extract the expression from the row text.
  buffer.scanInRange(wordRegex, rowRange, function (data) {
    var range = data.range;

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
      range: matchData.range
    };
  } else {
    return null;
  }
}

module.exports = exports.default;