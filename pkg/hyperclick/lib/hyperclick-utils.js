Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultWordRegExpForEditor = defaultWordRegExpForEditor;

/**
 * Returns the text and range for the word that contains the given position.
 */

exports.getWordTextAndRange = getWordTextAndRange;

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

function defaultWordRegExpForEditor(textEditor) {
  var lastCursor = textEditor.getLastCursor();
  if (!lastCursor) {
    return null;
  }
  return lastCursor.wordRegExp();
}

function getWordTextAndRange(textEditor, position, wordRegExp) {
  var textAndRange = null;

  wordRegExp = wordRegExp || defaultWordRegExpForEditor(textEditor);

  if (wordRegExp) {
    var buffer = textEditor.getBuffer();
    buffer.scanInRange(wordRegExp, buffer.rangeForRow(position.row), function (data) {
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
    textAndRange = { text: '', range: new (_atom2 || _atom()).Range(position, position) };
  }

  return textAndRange;
}