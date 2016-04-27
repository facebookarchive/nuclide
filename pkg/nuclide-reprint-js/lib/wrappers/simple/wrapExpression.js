

var flatten = require('../../utils/flatten');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var unwrapMarkers = require('../../utils/unwrapMarkers');

/**
 * Adds parenthesis and the appropriate markers to a set of lines. It also moves
 * any leading and trailing markers outside of the parenthesis.
 */
function wrapExpression(print, node, lines) {
  lines = flatten(lines);
  if (node.parenthesizedExpression) {
    lines = unwrapMarkers(['(', markers.openScope, markers.scopeIndent, markers.scopeBreak], lines, [markers.scopeBreak, markers.scopeDedent, markers.closeScope, ')']);
  }
  return lines;
}

module.exports = wrapExpression;