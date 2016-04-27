

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var wrapStatement = require('../../wrappers/simple/wrapStatement');

function printIfStatement(print, node) {
  var wrap = function wrap(x) {
    return wrapStatement(print, node, x);
  };

  var parts = [markers.hardBreak, 'if (', markers.openScope, markers.scopeIndent, markers.scopeBreak, print(node.test), markers.scopeBreak, markers.scopeDedent, markers.closeScope, ') ', print(node.consequent)];

  if (node.alternate) {

    parts = parts.concat([markers.noBreak, ' else ', markers.noBreak, print(node.alternate)]);
  }

  return wrap(parts);
}

module.exports = printIfStatement;