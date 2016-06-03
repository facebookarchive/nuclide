function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

var match = (_jscodeshift2 || _jscodeshift()).default.match;

/**
 * This traverses a node to find the first identifier in nested expressions.
 */
function getRootIdentifierInExpression(_x) {
  var _again = true;

  _function: while (_again) {
    var node = _x;
    _again = false;

    if (!node) {
      return null;
    }
    if (match(node, { type: 'ExpressionStatement' })) {
      _x = node.expression;
      _again = true;
      continue _function;
    }
    if (match(node, { type: 'CallExpression' })) {
      _x = node.callee;
      _again = true;
      continue _function;
    }
    if (match(node, { type: 'MemberExpression' })) {
      _x = node.object;
      _again = true;
      continue _function;
    }
    if (match(node, { type: 'Identifier' })) {
      return node;
    }
    return null;
  }
}

module.exports = getRootIdentifierInExpression;