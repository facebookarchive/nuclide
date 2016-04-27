

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printExportSpecifier(print, node) {
  // I'm pretty sure it's safe to assume they are both Identifiers, but let's
  // be safe just in case.
  if (node.exported && node.exported.type === 'Identifier' && node.local && node.local.type === 'Identifier' && node.exported.name !== node.local.name) {
    return flatten([print(node.local), markers.noBreak, markers.space, 'as', markers.noBreak, markers.space, print(node.exported)]);
  } else {
    return flatten(print(node.local));
  }
}

module.exports = printExportSpecifier;