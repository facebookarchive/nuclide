

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var printCommaSeparatedNodes = require('../common/printCommaSeparatedNodes');

function printTupleTypeAnnotation(print, node) {
  return flatten(['[', printCommaSeparatedNodes(print, node.types), ']']);
}

module.exports = printTupleTypeAnnotation;