

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printAssignmentPattern(print, node) {
  return flatten([print(node.left), markers.noBreak, markers.space, '=', markers.noBreak, markers.space, print(node.right)]);
}

module.exports = printAssignmentPattern;