

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var printArrayOfStatements = require('../common/printArrayOfStatements');
var printComments = require('../common/printComments');

function printProgram(print, node) {
  return flatten([printComments(node.innerComments), printArrayOfStatements(print, node.body)]);
}

module.exports = printProgram;