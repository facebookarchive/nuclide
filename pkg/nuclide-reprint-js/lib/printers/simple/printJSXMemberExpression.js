

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printJSXMemberExpression(print, node) {
  // JSXMemberExpressions can only contain identifiers so we do not allow any
  // sort of breaking between accesses unlike in a standard member expression.
  return flatten([print(node.object), markers.noBreak, '.', markers.noBreak, print(node.property)]);
}

module.exports = printJSXMemberExpression;