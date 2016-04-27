

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printImportSpecifier(print, node) {
  // I'm pretty sure it's safe to assume they are both Identifiers, but let's
  // be safe just in case.
  if (node.imported && node.imported.type === 'Identifier' && node.local && node.local.type === 'Identifier' && node.imported.name !== node.local.name) {
    return flatten([print(node.imported), markers.noBreak, markers.space, 'as', markers.noBreak, markers.space, print(node.local)]);
  } else {
    return flatten(print(node.local));
  }
}

module.exports = printImportSpecifier;