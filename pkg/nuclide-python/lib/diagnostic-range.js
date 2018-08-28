"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDiagnosticRange = getDiagnosticRange;

var _atom = require("atom");

function _range() {
  const data = require("../../../modules/nuclide-commons-atom/range");

  _range = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-python'); // Computes an appropriate underline range using the diagnostic type information.
// Range variants include underlining the entire line, entire trimmed line,
// or a word or whitespace range within the line.

function getDiagnosticRange(diagnostic, editor) {
  const buffer = editor.getBuffer(); // The diagnostic message's line index may be out of bounds if buffer contents
  // have changed. To prevent an exception, we just use the last line of the buffer if
  // unsafeLine is out of bounds.

  const {
    code,
    line: unsafeLine,
    column,
    message
  } = diagnostic;
  const lastRow = buffer.getLastRow();
  const line = unsafeLine <= lastRow ? unsafeLine : lastRow;
  const lineLength = buffer.lineLengthForRow(line);
  const trimmedRange = (0, _range().trimRange)(editor, buffer.rangeForRow(line, false));
  const trimmedStartCol = trimmedRange.start.column;
  const trimmedEndCol = trimmedRange.end.column;

  try {
    switch (code.slice(0, 2)) {
      // pep8 - indentation
      case 'E1':
      case 'E9':
      case 'W1':
        // For E901 SyntaxError and E902 IOError, we should underline the whole line.
        // FOr E901 IndentationError, proceed to only underline the leading whitespace.
        if (code === 'E902' || message.startsWith('SyntaxError')) {
          break;
        }

        return new _atom.Range([line, 0], [line, trimmedStartCol]);
      // pep8 - whitespace

      case 'E2':
        // '#' comment spacing
        if (code.startsWith('E26')) {
          return new _atom.Range([line, column], [line, trimmedEndCol]);
        }

        const numericCode = parseInt(code.slice(1), 10); // Missing whitespace - underline the closest symbol

        if (numericCode >= 225 && numericCode <= 231 || numericCode === 275) {
          return new _atom.Range([line, column], [line, column + 1]);
        } // Extra whitespace - underline the offending whitespace


        const whitespace = (0, _range().wordAtPosition)(editor, new _atom.Point(line, column), /\s+/g);

        if (whitespace) {
          return whitespace.range;
        }

        break;
      // pep8 - blank line
      // pep8 - line length

      case 'E3':
      case 'E5':
        return new _atom.Range([line, 0], [line, lineLength]);
      // pep8 - whitespace warning

      case 'W2':
        // trailing whitespace
        if (code === 'W291') {
          return new _atom.Range([line, trimmedEndCol], [line, lineLength]);
        }

        break;
      // pyflakes - import related messages

      case 'F4':
        if (code === 'F405') {
          // <XXX> may be undefined, or defined from import *
          const word = (0, _range().wordAtPosition)(editor, new _atom.Point(line, column));

          if (word) {
            return word.range;
          }
        }

        break;
      // pyflakes - variable/name related messages

      case 'F8':
        // Highlight word for reference errors, default to highlighting line for
        // definition and other errors.
        if (!code.startsWith('F82')) {
          break;
        }

        const word = (0, _range().wordAtPosition)(editor, new _atom.Point(line, column));

        if (word) {
          return word.range;
        }

        break;

      default:
        break;
    }
  } catch (e) {
    const diagnosticAsString = `${diagnostic.file}:${unsafeLine}:${column} - ${code}: ${message}`;
    logger.error(`Failed to find flake8 diagnostic range: ${diagnosticAsString}`, e);
  }

  return new _atom.Range([line, trimmedStartCol], [line, trimmedEndCol]);
}