'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEvaluationExpression = getEvaluationExpression;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const HACK_BLACKLISTED_EXPRESSIONS = new Set(['final', 'class', 'public', 'async', 'function', 'Awaitable', 'void', 'string', 'int', 'mixed', 'self', 'null']);

function getEvaluationExpression(editor, position) {
  const exactExpression = (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).getDefaultEvaluationExpression)(editor, position);
  const lineContent = editor.lineTextForBufferRow(position.row);
  if (exactExpression == null || isBlackListedExpression(exactExpression.expression) ||
  // Shouldn't evaluate function expressions.
  lineContent[exactExpression.range.end.column] === '(') {
    return null;
  }
  return exactExpression;
}

function isBlackListedExpression(expression) {
  return HACK_BLACKLISTED_EXPRESSIONS.has(expression);
}