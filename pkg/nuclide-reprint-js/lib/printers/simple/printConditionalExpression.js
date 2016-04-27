

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printConditionalExpression(print, node) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };
  return wrap([markers.openScope, markers.scopeIndent, print(node.test), markers.scopeSpaceBreak, '?', markers.noBreak, markers.space, print(node.consequent), markers.scopeSpaceBreak, ':', markers.noBreak, markers.space, print(node.alternate), markers.scopeDedent, markers.closeScope]);
}

module.exports = printConditionalExpression;