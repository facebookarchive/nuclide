'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Node} from '../types/ast';

const hasOneDeclaration = require('./hasOneDeclaration');
const isRequireExpression = require('./isRequireExpression');

function hasOneRequireDeclaration(node: Node): boolean {
  if (!hasOneDeclaration(node)) {
    return false;
  }
  const declaration = node.declarations[0];
  return isRequireExpression(declaration.init);
}

module.exports = hasOneRequireDeclaration;
