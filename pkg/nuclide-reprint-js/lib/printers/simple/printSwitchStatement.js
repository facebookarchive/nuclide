

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapStatement = require('../../wrappers/simple/wrapStatement');

function printSwitchStatement(print, node) {
  var wrap = function wrap(x) {
    return wrapStatement(print, node, x);
  };
  return wrap([markers.hardBreak, 'switch (', markers.openScope, markers.scopeIndent, markers.scopeBreak, print(node.discriminant), markers.scopeBreak, markers.scopeDedent, markers.closeScope, ') {', markers.hardBreak, markers.indent, node.cases.map(function (caseNode) {
    return print(caseNode);
  }), markers.noBreak, // Squash the last breaks.
  '', markers.dedent, markers.hardBreak, '}']);
}

module.exports = printSwitchStatement;