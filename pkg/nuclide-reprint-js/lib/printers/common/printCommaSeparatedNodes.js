

var flatten = require('../../utils/flatten');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');

function printCommaSeparatedNodes(print, nodes) {
  if (nodes.length === 0) {
    return [];
  }
  return flatten([markers.openScope, markers.scopeIndent, flatten(nodes.map(function (node, i, arr) {
    return flatten([i > 0 ? [markers.space] : [], markers.scopeBreak, print(node), i === arr.length - 1 ? [markers.scopeComma] : ',', '']);
  })), markers.scopeBreak, markers.scopeDedent, markers.closeScope]);
}

module.exports = printCommaSeparatedNodes;