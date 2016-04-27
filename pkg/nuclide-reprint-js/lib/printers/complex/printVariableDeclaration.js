

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printVariableDeclaration(print, node, context) {
  var last = context.path.last();

  var parts = [node.kind, markers.space, flatten(node.declarations.map(function (declNode, i) {
    if (i === 0) {
      return print(declNode);
    } else {
      return [',', markers.space, print(declNode)];
    }
  }))];

  // For these node types we shouldn't break or add a semicolon.
  var nonBreakingParents = new Set(['ForInStatement', 'ForOfStatement', 'ForStatement']);

  if (!last || nonBreakingParents.has(last.type)) {
    return flatten(parts);
  } else {
    return flatten([parts, markers.noBreak, ';', markers.hardBreak]);
  }
}

module.exports = printVariableDeclaration;