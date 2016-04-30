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

import jscs from 'jscodeshift';

const {match} = jscs;

/**
 * This traverses a node to find the first identifier in nested expressions.
 */
function getRootIdentifierInExpression(node: ?Node): ?Node {
  if (!node) {
    return null;
  }
  if (match(node, {type: 'ExpressionStatement'})) {
    return getRootIdentifierInExpression(node.expression);
  }
  if (match(node, {type: 'CallExpression'})) {
    return getRootIdentifierInExpression(node.callee);
  }
  if (match(node, {type: 'MemberExpression'})) {
    return getRootIdentifierInExpression(node.object);
  }
  if (match(node, {type: 'Identifier'})) {
    return node;
  }
  return null;
}

module.exports = getRootIdentifierInExpression;
