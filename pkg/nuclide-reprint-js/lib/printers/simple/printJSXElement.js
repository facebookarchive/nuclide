

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printJSXElement(print, node) {
  var wrap = function wrap(x) {
    return wrapExpression(print, node, x);
  };
  return wrap([markers.openScope, markers.scopeIndent, print(node.openingElement), markers.scopeBreak, node.children.map(function (child) {
    return [print(child), markers.scopeBreak];
  }), markers.scopeDedent, markers.closeScope, print(node.closingElement)]);
}

module.exports = printJSXElement;