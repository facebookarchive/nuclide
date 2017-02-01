'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowEvaluationExpressionProvider = undefined;

var _range;

function _load_range() {
  return _range = require('../../commons-atom/range');
}

var _nuclideFlowCommon;

function _load_nuclideFlowCommon() {
  return _nuclideFlowCommon = require('../../nuclide-flow-common');
}

class FlowEvaluationExpressionProvider {
  getEvaluationExpression(editor, position) {
    // TODO: Replace RegExp with AST-based, more accurate approach.
    const extractedIdentifier = (0, (_range || _load_range()).wordAtPosition)(editor, position, (_nuclideFlowCommon || _load_nuclideFlowCommon()).JAVASCRIPT_IDENTIFIER_REGEX);
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
exports.FlowEvaluationExpressionProvider = FlowEvaluationExpressionProvider; /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */