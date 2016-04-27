

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printObjectExpression(print, node) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };
  return wrap(['{', markers.openScope, markers.scopeIndent, markers.scopeBreak, node.properties.map(function (propNode, i, arr) {
    return [print(propNode), i === arr.length - 1 ? markers.scopeComma : ',', i === arr.length - 1 ? markers.scopeBreak : markers.scopeSpaceBreak];
  }), markers.scopeDedent, markers.closeScope, '}']);
}

module.exports = printObjectExpression;