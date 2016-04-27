

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printObjectPattern(print, node) {
  return flatten(['{', markers.openScope, markers.scopeIndent, markers.scopeBreak, node.properties.map(function (propNode, i, arr) {
    return [print(propNode), i === arr.length - 1 ? markers.scopeComma : ',', i === arr.length - 1 ? markers.scopeBreak : markers.scopeSpaceBreak];
  }), markers.scopeDedent, markers.closeScope, '}']);
}

module.exports = printObjectPattern;