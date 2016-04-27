

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printExportDefaultDeclaration(print, node) {
  return flatten(['export', markers.space, 'default', markers.noBreak, markers.space, print(node.declaration), markers.noBreak, ';', markers.hardBreak]);
}

module.exports = printExportDefaultDeclaration;