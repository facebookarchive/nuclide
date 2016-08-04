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

import getRootIdentifierInExpression from './getRootIdentifierInExpression';

function isRequireExpression(node: Node): boolean {
  const root = getRootIdentifierInExpression(node);
  return Boolean(root && root.name === 'require');
}

module.exports = isRequireExpression;
