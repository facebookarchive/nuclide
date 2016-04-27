

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printIntersectionTypeAnnotation(print, node) {
  return flatten([markers.openScope, markers.scopeIndent, node.types.map(function (t, i, arr) {
    return [i === 0 ? markers.scopeBreak : markers.scopeSpaceBreak, print(t), i < arr.length - 1 ? [markers.space, '&'] : markers.empty];
  }), markers.scopeDedent, markers.closeScope]);
}

module.exports = printIntersectionTypeAnnotation;