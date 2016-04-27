

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../../constants/markers');
var printArrayOfStatements = require('../common/printArrayOfStatements');
var printComments = require('../common/printComments');
var wrapStatement = require('../../wrappers/simple/wrapStatement');

function printBlockStatement(print, node) {
  var wrap = function wrap(x) {
    return wrapStatement(print, node, x);
  };
  return wrap(['{', markers.openScope, markers.scopeIndent, markers.scopeBreak, printComments(node.innerComments), printArrayOfStatements(print, node.body), markers.scopeBreak, markers.scopeDedent, markers.closeScope, '}']);
}

module.exports = printBlockStatement;