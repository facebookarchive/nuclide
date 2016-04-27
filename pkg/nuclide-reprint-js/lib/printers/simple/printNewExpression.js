

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var printCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printNewExpression(print, node) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };
  return wrap(['new', markers.noBreak, markers.space, print(node.callee), markers.noBreak, '(', printCommaSeparatedNodes(print, node.arguments), ')']);
}

module.exports = printNewExpression;