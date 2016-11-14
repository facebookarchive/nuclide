'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.parseFlake8Output = parseFlake8Output;


// Codes that should be displayed as errors. A general guideline is that
// style-related codes should be classified as warnings, while codes that
// indicate likeliness to error upon interpretation should be classified as errors.
const ERROR_CODES = new Set([
/* pyflakes */
'F821', // undefined name
'F822', // undefined name in __all__
'F823', // referenced before assignment
'F831', // duplicate argument in function definition
/* pep8 */
'E101', // indentation contains mixed spaces and tabs
'E112', // expected an indented block
'E113', // unexpected indentation
'E123', // closing bracket does not match indentation of opening bracket’s line
'E124', // closing bracket does not match visual indentation
'E129', // visually indented line with same indent as next logical line
'E133', // closing bracket is missing indentation
'E901', // SyntaxError or IndentationError
'E902']);

function classifyCode(code) {
  return ERROR_CODES.has(code) ? 'Error' : 'Warning';
}

function parseFlake8Output(src, output) {
  const regex = /(\d+):(\d+):\s([A-Z]\d{2,3})\s+(.*)/g;
  const results = [];

  for (;;) {
    const match = regex.exec(output);
    if (match == null) {
      break;
    }

    var _match = _slicedToArray(match, 5);

    const line = _match[1],
          column = _match[2],
          code = _match[3],
          message = _match[4];

    results.push({
      file: src,
      line: parseInt(line, 10) - 1 || 0,
      column: parseInt(column, 10) || 0,
      code: code,
      type: classifyCode(code),
      message: message
    });
  }

  return results;
}