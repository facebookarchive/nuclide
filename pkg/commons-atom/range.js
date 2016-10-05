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

var _commonsNodeRange2;

function _commonsNodeRange() {
  return _commonsNodeRange2 = require('../commons-node/range');
}

function wordAtPosition(editor, position, wordRegex_) {
  var wordRegex = wordRegex_;
  if (!wordRegex) {
    wordRegex = editor.getLastCursor().wordRegExp();
  }
  var buffer = editor.getBuffer();
  return (0, (_commonsNodeRange2 || _commonsNodeRange()).wordAtPositionFromBuffer)(buffer, position, wordRegex);
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