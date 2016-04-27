

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printClassDeclaration(print, node) {
  var parts = flatten(['class', markers.noBreak, markers.space, print(node.id), node.typeParameters ? [markers.noBreak, print(node.typeParameters)] : markers.empty, markers.noBreak, markers.space]);

  if (node.superClass) {
    var superClass = node.superClass;
    parts = flatten([parts, 'extends', markers.noBreak, markers.space, print(superClass), node.superTypeParameters ? [markers.noBreak, print(node.superTypeParameters)] : markers.empty, markers.noBreak, markers.space]);
  }

  return flatten([parts, print(node.body), markers.hardBreak]);
}

module.exports = printClassDeclaration;