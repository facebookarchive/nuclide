

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var STOP_OR_RESUME_WRAPPING_REGEX = /\u001B\[\?7[hl]/g;
var ERASE_PREVIOUS_LINE_REGEX = /\u001B\[1A\u001B\[2K/g;

/**
 * An implementation of ProcessOutputHandler that parses and applies the behavior
 * of ANSI escape characters that Buck uses.
 * According to https://github.com/facebook/buck/blob/master/src/com/facebook/buck/util/Ansi.java,
 * Buck uses the following non-style escape charaters:
 *   Resume wrapping: ESC[?7h
 *   Stop wrapping: ESC[?7l
 *   Cursor to previous line: ESC[1A
 *   Erase line: ESC[2K
 */
function handleBuckAnsiOutput(textBuffer, text) {
  // The chunk of new text may span several lines, each of which may contain
  // ANSI escape characters.
  var lines = text.split('\n');
  for (var lineNum = 0; lineNum < lines.length; lineNum++) {
    var line = lines[lineNum];

    // Simply strip the 'resume wrapping' and 'stop wrapping' escape characters.
    var newText = line.replace(STOP_OR_RESUME_WRAPPING_REGEX, '');

    // In Buck, the 'cursor to previous line' and 'erase line' escape characters
    // occur in pairs.
    var erasePreviousLineMatches = newText.match(ERASE_PREVIOUS_LINE_REGEX);
    if (erasePreviousLineMatches) {
      var numberOfLinesToRemove = erasePreviousLineMatches.length;
      // This represents 'moving the cursor to previous line':
      var endRemove = textBuffer.getLastRow() - 1;
      // TextBuffer::deleteRows is inclusive:
      var startRemove = endRemove - numberOfLinesToRemove + 1;
      textBuffer.deleteRows(startRemove, endRemove);

      // Remove these escape sequences.
      newText = newText.replace(ERASE_PREVIOUS_LINE_REGEX, '');
    }

    // There seem to be some invisible characters (not newlines) at the end of
    // lines that result in a newline. Remove these.
    newText = newText.trim();
    // Append the processed text to a new line.
    // `{undo: 'skip'}` disables the TextEditor's "undo system".
    textBuffer.append(newText, { undo: 'skip' });
    if (lineNum !== lines.length - 1) {
      // Don't append a newline to the last line. (Since we split by \n, the
      // last segment should not end in a newline.)
      // `{undo: 'skip'}` disables the TextEditor's "undo system".
      textBuffer.append('\n', { undo: 'skip' });
    }
  }
}

module.exports = handleBuckAnsiOutput;