Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getDiagnosticRange = getDiagnosticRange;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomRange2;

function _commonsAtomRange() {
  return _commonsAtomRange2 = require('../../commons-atom/range');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function tokenizedLineForRow(editor, line) /* atom$TokenizedLine */{
  var tokenBuffer = editor.hasOwnProperty('displayBuffer') ? editor.displayBuffer.tokenizedBuffer : editor.tokenizedBuffer;
  return tokenBuffer.tokenizedLineForRow(line);
}

// Finds the range of the module name from a pyflakes F4XX message.
// Assumes that the module name exists.
// Ported from https://github.com/AtomLinter/linter-flake8
function getModuleNameRange(message, line, editor) {
  var symbol = /'([^']+)'/.exec(message)[1];
  var foundImport = false;
  var lineNumber = line;
  do {
    // eslint-disable-line no-constant-condition
    var offset = 0;
    var tokenizedLine = tokenizedLineForRow(editor, lineNumber);
    if (!tokenizedLine) {
      break;
    }
    for (var i = 0; i < tokenizedLine.tokens.length; i++) {
      var token = tokenizedLine.tokens[i];
      if (foundImport && token.value === symbol) {
        return new (_atom2 || _atom()).Range([lineNumber, offset], [lineNumber, offset + token.value.length]);
      }
      if (token.value === 'import' && token.scopes.indexOf('keyword.control.import.python') >= 0) {
        foundImport = true;
      }
      offset += token.value.length;
    }
    lineNumber += 1;
  } while (true);

  (0, (_assert2 || _assert()).default)(false, 'getModuleNameRange - should not reach this line');
}

// Computes an appropriate underline range using the diagnostic type information.
// Range variants include underlining the entire line, entire trimmed line,
// or a word or whitespace range within the line.

function getDiagnosticRange(diagnostic, editor) {
  var buffer = editor.getBuffer();

  // The diagnostic message's line index may be out of bounds if buffer contents
  // have changed. To prevent an exception, we just use the last line of the buffer if
  // unsafeLine is out of bounds.
  var code = diagnostic.code;
  var unsafeLine = diagnostic.line;
  var column = diagnostic.column;
  var message = diagnostic.message;

  var lastRow = buffer.getLastRow();
  var line = unsafeLine <= lastRow ? unsafeLine : lastRow;

  var lineLength = buffer.lineLengthForRow(line);
  var trimmedRange = (0, (_commonsAtomRange2 || _commonsAtomRange()).trimRange)(editor, buffer.rangeForRow(line, false));
  var trimmedStartCol = trimmedRange.start.column;
  var trimmedEndCol = trimmedRange.end.column;

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
      return new (_atom2 || _atom()).Range([line, 0], [line, trimmedStartCol]);
    // pep8 - whitespace
    case 'E2':
      // '#' comment spacing
      if (code.startsWith('E26')) {
        return new (_atom2 || _atom()).Range([line, column - 1], [line, trimmedEndCol]);
      }
      var numericCode = parseInt(code.slice(1), 10);
      // Missing whitespace - underline the closest symbol
      if (numericCode >= 225 && numericCode <= 231 || numericCode === 275) {
        return new (_atom2 || _atom()).Range([line, column - 1], [line, column]);
      }
      // Extra whitespace - underline the offending whitespace
      var whitespace = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, new (_atom2 || _atom()).Point(line, column), /\s+/g);
      if (whitespace) {
        return whitespace.range;
      }
      break;
    // pep8 - blank line
    // pep8 - line length
    case 'E3':
    case 'E5':
      return new (_atom2 || _atom()).Range([line, 0], [line, lineLength]);
    // pep8 - whitespace warning
    case 'W2':
      // trailing whitespace
      if (code === 'W291') {
        return new (_atom2 || _atom()).Range([line, trimmedEndCol], [line, lineLength]);
      }
      break;
    // pyflakes - import related messages
    case 'F4':
      return getModuleNameRange(message, line, editor);
    // pyflakes - variable/name related messages
    case 'F8':
      // Highlight word for reference errors, default to highlighting line for
      // definition and other errors.
      if (!code.startsWith('F82')) {
        break;
      }
      var word = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, new (_atom2 || _atom()).Point(line, column));
      if (word) {
        return word.range;
      }
      break;
    default:
      break;
  }

  return new (_atom2 || _atom()).Range([line, trimmedStartCol], [line, trimmedEndCol]);
}