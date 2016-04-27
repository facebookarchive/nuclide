

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printMemberExpression(print, node, context) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };

  if (node.computed) {
    return wrap([print(node.object), '[', markers.openScope, markers.scopeIndent, markers.scopeBreak, print(node.property), markers.scopeBreak, markers.scopeDedent, markers.closeScope, ']']);
  } else {
    return wrap([print(node.object), '.', print(node.property)]);
  }
}

module.exports = printMemberExpression;