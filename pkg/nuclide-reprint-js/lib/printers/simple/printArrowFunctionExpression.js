

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

function printArrowFunctionExpression(print, node) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };
  return wrap(['(', printCommaSeparatedNodes(print, node.params), ') =>', markers.noBreak, markers.space, print(node.body), markers.noBreak]);
}

module.exports = printArrowFunctionExpression;