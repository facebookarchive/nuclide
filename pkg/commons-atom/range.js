Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.wordAtPosition = wordAtPosition;
exports.trimRange = trimRange;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

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

/**
 * Gets the trimmed range from a given range, i.e. moves the start and end points
 * to the first and last non-whitespace characters (or specified regex)
 * within the range respectively.
 *
 * @param editor       the editor containing the range
 * @param rangeToTrim  the range to trim
 * @param stopRegex    stop trimming when the first match is found for this regex,
 *   defaults to first non-whitespace character
 * @return atom$Range  the trimmed range
 */

function trimRange(editor, rangeToTrim) {
  var stopRegex = arguments.length <= 2 || arguments[2] === undefined ? /\S/ : arguments[2];

  var buffer = editor.getBuffer();
  var start = rangeToTrim.start;
  var end = rangeToTrim.end;

  buffer.scanInRange(stopRegex, rangeToTrim, function (_ref) {
    var range = _ref.range;
    var stop = _ref.stop;

    start = range.start;
    stop();
  });
  buffer.backwardsScanInRange(stopRegex, rangeToTrim, function (_ref2) {
    var range = _ref2.range;
    var stop = _ref2.stop;

    end = range.end;
    stop();
  });
  return new (_atom2 || _atom()).Range(start, end);
}