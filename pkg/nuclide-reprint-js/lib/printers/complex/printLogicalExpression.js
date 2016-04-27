

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

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
    return wrapExpression(print, node, x);
  };
  return wrap([needsScope ? [markers.openScope, markers.scopeIndent, markers.scopeBreak] : markers.empty, print(node.left), markers.noBreak, markers.space, node.operator, markers.scopeSpaceBreak, print(node.right), needsScope ? [markers.scopeBreak, markers.scopeDedent, markers.closeScope] : markers.empty]);
}

module.exports = printLogicalExpression;