

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');

function printExportDefaultSpecifier(print, node) {
  return flatten(print(node.exported));
}

module.exports = printExportDefaultSpecifier;