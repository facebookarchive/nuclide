

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');
var printArrayOfStatements = require('../common/printArrayOfStatements');
var printComments = require('../common/printComments');

function printClassBody(print, node) {
  // Can't put extra new lines in here like BlockStatement since it may be
  // used in a ClassExpression.
  return flatten(['{',
  // We want to override the extra space within the first node of a class
  // body, so we do one hard break and then throw in a no break. The empty
  // string is necessary to reset the run of markers.
  markers.hardBreak, markers.indent, '', markers.noBreak, printComments(node.innerComments), printArrayOfStatements(print, node.body), markers.dedent, markers.hardBreak, '}']);
}

module.exports = printClassBody;