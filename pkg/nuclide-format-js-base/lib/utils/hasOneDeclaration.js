

var jscs = require('jscodeshift');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var match = jscs.match;

function hasOneDeclaration(node) {
  if (!match(node, { type: 'VariableDeclaration' })) {
    return false;
  }
  return node.declarations.length === 1;
}

module.exports = hasOneDeclaration;