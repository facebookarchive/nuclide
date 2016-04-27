

var hasOneDeclaration = require('./hasOneDeclaration');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var isRequireExpression = require('./isRequireExpression');

function hasOneRequireDeclaration(node) {
  if (!hasOneDeclaration(node)) {
    return false;
  }
  var declaration = node.declarations[0];
  return isRequireExpression(declaration.init);
}

module.exports = hasOneRequireDeclaration;