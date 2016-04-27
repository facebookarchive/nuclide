

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printUnaryExpression(print, node) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };

  var hasSpace = node.operator === 'typeof' || node.operator === 'void' || node.operator === 'delete';

  var parts = [node.operator];
  if (hasSpace) {
    parts.push(markers.noBreak);
    parts.push(markers.space);
  }

  return wrap([parts, print(node.argument)]);
}

module.exports = printUnaryExpression;