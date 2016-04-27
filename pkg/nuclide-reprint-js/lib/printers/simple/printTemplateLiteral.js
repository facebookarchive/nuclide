

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printTemplateLiteral(print, node) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };
  var quasis = node.quasis;
  var expressions = node.expressions;

  return wrap(['`', quasis.map(function (q, i) {
    return [i > 0 ? ['${', markers.openScope, markers.scopeIndent, markers.scopeBreak, print(expressions[i - 1]), markers.scopeBreak, markers.scopeDedent, markers.closeScope, '}'] : markers.empty, print(q)];
  }), '`']);
}

module.exports = printTemplateLiteral;