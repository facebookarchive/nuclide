function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constantsMarkers = require('../../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

var _wrappersSimpleWrapExpression = require('../../wrappers/simple/wrapExpression');

var _wrappersSimpleWrapExpression2 = _interopRequireDefault(_wrappersSimpleWrapExpression);

function printLogicalExpression(print, node, context) {
  var path = context.path;
  var needsScope = true;
  for (var i = path.size - 1; i >= 0; i--) {
    var curr = path.get(i);
    /**
     * Traverse the path until we see the first logical expression. If it has
     * the same kind of operator we do not need to open a new scope. If it has
     * a different kind of operator we force it into a new scope.
     */
    if (curr.type === 'LogicalExpression') {
      needsScope = curr.operator !== node.operator;
      break;
    }
  }

  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapExpression2.default)(print, node, x);
  };
  return wrap([needsScope ? [_constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, _constantsMarkers2.default.scopeBreak] : _constantsMarkers2.default.empty, print(node.left), _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, node.operator, _constantsMarkers2.default.scopeSpaceBreak, print(node.right), needsScope ? [_constantsMarkers2.default.scopeBreak, _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope] : _constantsMarkers2.default.empty]);
}

module.exports = printLogicalExpression;