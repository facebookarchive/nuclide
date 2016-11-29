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

var _range;

function _load_range() {
  return _range = require('../../commons-atom/range');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

class FlowEvaluationExpressionProvider {

  getEvaluationExpression(editor, position) {
    // TODO: Replace RegExp with AST-based, more accurate approach.
    const extractedIdentifier = (0, (_range || _load_range()).wordAtPosition)(editor, position, (_constants || _load_constants()).JAVASCRIPT_IDENTIFIER_REGEX);
    if (extractedIdentifier == null) {
      return Promise.resolve(null);
    }
    const {
      range,
      wordMatch
    } = extractedIdentifier;
    const [expression] = wordMatch;
    if (expression == null) {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      expression,
      range
    });
  }
}
exports.FlowEvaluationExpressionProvider = FlowEvaluationExpressionProvider;