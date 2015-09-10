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

var getRootIdentifierInExpression = require('./getRootIdentifierInExpression');

function isRequireExpression(node: Node): boolean {
  var root = getRootIdentifierInExpression(node);
  return !!(root && root.name === 'require');
}

module.exports = isRequireExpression;
