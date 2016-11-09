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

exports.getEvaluationExpression = getEvaluationExpression;

var _range;

function _load_range() {
  return _range = require('../../commons-node/range');
}

var _HackHelpers;

function _load_HackHelpers() {
  return _HackHelpers = require('./HackHelpers');
}

function getEvaluationExpression(filePath, buffer, position) {
  // TODO: Replace RegExp with AST-based, more accurate approach.
  const extractedIdentifier = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, (_HackHelpers || _load_HackHelpers()).HACK_WORD_REGEX);
  if (extractedIdentifier == null) {
    return null;
  }
  const range = extractedIdentifier.range,
        wordMatch = extractedIdentifier.wordMatch;

  var _wordMatch = _slicedToArray(wordMatch, 1);

  const expression = _wordMatch[0];

  if (expression == null) {
    return null;
  }
  return {
    expression: expression,
    range: range
  };
}