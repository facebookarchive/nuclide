

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

function printFunctionDeclaration(print, node) {
  return flatten([node.async ? ['async', markers.space, markers.noBreak] : markers.empty, 'function', node.generator ? '*' : markers.empty, markers.noBreak, markers.space, print(node.id), node.typeParameters ? [markers.noBreak, print(node.typeParameters)] : markers.empty, '(', printCommaSeparatedNodes(print, node.params), ')', node.returnType ? print(node.returnType) : markers.empty, markers.space, print(node.body), markers.hardBreak]);
}

module.exports = printFunctionDeclaration;