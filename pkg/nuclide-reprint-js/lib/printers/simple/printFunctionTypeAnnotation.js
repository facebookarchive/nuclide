

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');
var printCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');

function printFunctionTypeAnnotation(print, node) {
  // TODO: node.rest
  return flatten(['(', printCommaSeparatedNodes(print, node.params), ') =>', markers.noBreak, markers.space, print(node.returnType)]);
}

module.exports = printFunctionTypeAnnotation;