

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printIdentifier(print, node) {
  return flatten([node.name, node.typeAnnotation ? print(node.typeAnnotation) : markers.empty]);
}

module.exports = printIdentifier;