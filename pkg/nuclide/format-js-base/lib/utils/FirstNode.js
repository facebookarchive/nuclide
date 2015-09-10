'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Collection, NodePath} from '../types/ast';

var getRootIdentifierInExpression = require('./getRootIdentifierInExpression');
var isGlobal = require('./isGlobal');
var jscs = require('jscodeshift');

var {match} = jscs;

var FirstNode = {
  /**
   * Gets the first node that it's safe to insert before on.
   *
   * Note: We never need to add a first node. If a first node doesn't exist
   * then there isn't ever code that would result in a require being changed.
   */
  get(root: Collection): ?NodePath {
    var first;
    root
      .find(jscs.Node)
      .filter(path => isGlobal(path))
      .forEach(path => {
        if (!first && FirstNode.isValidFirstNode(path)) {
          first = path;
        }
      });
    return first;
  },

  /**
   * Filter to see if a node is a valid first node.
   */
  isValidFirstNode(path: NodePath): boolean {
    if (match(path, {expression: {type: 'Literal'}})) {
      return false;
    }
    var firstObject = getRootIdentifierInExpression(path.node);
    if (firstObject && match(firstObject, {name: 'jest'})) {
      return false;
    }
    return true;
  },
};

module.exports = FirstNode;
