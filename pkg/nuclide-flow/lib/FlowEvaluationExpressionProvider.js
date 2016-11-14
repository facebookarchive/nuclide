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
exports.FlowEvaluationExpressionProvider = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _range;

function _load_range() {
  return _range = require('../../commons-atom/range');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

let FlowEvaluationExpressionProvider = exports.FlowEvaluationExpressionProvider = class FlowEvaluationExpressionProvider {

  getEvaluationExpression(editor, position) {
    // TODO: Replace RegExp with AST-based, more accurate approach.
    const extractedIdentifier = (0, (_range || _load_range()).wordAtPosition)(editor, position, (_constants || _load_constants()).JAVASCRIPT_IDENTIFIER_REGEX);
    if (extractedIdentifier == null) {
      return Promise.resolve(null);
    }
    const range = extractedIdentifier.range,
          wordMatch = extractedIdentifier.wordMatch;

    var _wordMatch = _slicedToArray(wordMatch, 1);

    const expression = _wordMatch[0];

    if (expression == null) {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      expression: expression,
      range: range
    });
  }
};