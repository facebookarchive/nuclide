function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFlatten2;

function _utilsFlatten() {
  return _utilsFlatten2 = _interopRequireDefault(require('../../utils/flatten'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

function printArrayOfStatements(print, nodes) {
  return (0, (_utilsFlatten2 || _utilsFlatten()).default)(nodes.map(function (node, i, arr) {
    var parts = [];
    /**
     * Basic description of algorithm:
     *
     *   - If it is the first node, no extra new line
     *   - If it has a leading comment prefix it with extra new line
     *   - If it is a for/while/if/etc prefix it with extra new line
     *   - If previous node is a for/while/if/etc prefix it with extra new line
     */
    if (i > 0) {
      if (hasAttachedLeadingComments(node) || shouldSurroundWithBreaks(node) || shouldSurroundWithBreaks(arr[i - 1])) {
        parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, '', (_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak, (_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak]);
      }
    }

    parts = parts.concat(print(node));

    if (i < arr.length) {
      parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.hardBreak]);
    }

    return parts;
  }));
}

function hasAttachedLeadingComments(node) {
  if (!node.leadingComments || node.leadingComments.length === 0) {
    return false;
  }
  var last = node.leadingComments[node.leadingComments.length - 1];
  return node.loc.start.line - last.loc.end.line <= 1;
}

function shouldSurroundWithBreaks(node) {
  return(
    // Literal statements like: 'use strict';
    node.type === 'ExpressionStatement' && node.expression && node.expression.type === 'Literal' ||

    // Immediately Invoked Function Expression (IIFE).
    node.type === 'ExpressionStatement' && node.expression && node.expression.type === 'CallExpression' && node.expression.callee && node.expression.callee.type === 'FunctionExpression' || node.type === 'BlockStatement' || node.type === 'ClassDeclaration' || node.type === 'DoWhileStatement' || node.type === 'ForInStatement' || node.type === 'ForOfStatement' || node.type === 'ForStatement' || node.type === 'FunctionDeclaration' || node.type === 'IfStatement' || node.type === 'LabeledStatement' || node.type === 'MethodDefinition' || node.type === 'SwitchStatement' || node.type === 'TryStatement' || node.type === 'WhileStatement' || node.type === 'WithStatement'
  );
}

module.exports = printArrayOfStatements;