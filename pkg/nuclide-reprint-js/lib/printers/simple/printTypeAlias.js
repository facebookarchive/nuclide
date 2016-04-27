

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printTypeAlias(print, node) {
  return flatten(['type', markers.noBreak, markers.space, print(node.id), node.typeParameters ? print(node.typeParameters) : markers.empty, markers.noBreak, markers.space, '=', markers.space, print(node.right), markers.noBreak, ';', markers.hardBreak]);
}

module.exports = printTypeAlias;