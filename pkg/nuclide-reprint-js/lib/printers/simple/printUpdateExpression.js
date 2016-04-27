

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printUpdateExpression(print, node) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };
  if (node.prefix) {
    return wrap([node.operator, markers.noBreak, print(node.argument)]);
  } else {
    return wrap([print(node.argument), markers.noBreak, node.operator]);
  }
}

module.exports = printUpdateExpression;