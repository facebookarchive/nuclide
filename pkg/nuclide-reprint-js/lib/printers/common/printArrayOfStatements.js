'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printArrayOfStatements(print: Print, nodes: Array<any>): Lines {
  return flatten(nodes.map((node, i, arr) => {
    let parts = [];
    /**
     * Basic description of algorithm:
     *
     *   - If it is the first node, no extra new line
     *   - If it has a leading comment prefix it with extra new line
     *   - If it is a for/while/if/etc prefix it with extra new line
     *   - If previous node is a for/while/if/etc prefix it with extra new line
     */
    if (i > 0) {
      if (
        hasAttachedLeadingComments(node) ||
        shouldSurroundWithBreaks(node) ||
        shouldSurroundWithBreaks(arr[i - 1])
      ) {
        parts = parts.concat([
          markers.noBreak,
          '',
          markers.multiHardBreak,
          markers.multiHardBreak,
        ]);
      }
    }

    parts = parts.concat(print(node));

    if (i < arr.length) {
      parts = parts.concat([markers.hardBreak]);
    }

    return parts;
  }));
}

function hasAttachedLeadingComments(node: any): boolean {
  if (!node.leadingComments || node.leadingComments.length === 0) {
    return false;
  }
  const last = node.leadingComments[node.leadingComments.length - 1];
  return (node.loc.start.line - last.loc.end.line) <= 1;
}

function shouldSurroundWithBreaks(node: any): boolean {
  return (
    // Literal statements like: 'use strict';
    (
      node.type === 'ExpressionStatement' &&
      node.expression &&
      node.expression.type === 'Literal'
    ) ||

    // Immediately Invoked Function Expression (IIFE).
    (
      node.type === 'ExpressionStatement' &&
      node.expression &&
      node.expression.type === 'CallExpression' &&
      node.expression.callee &&
      node.expression.callee.type === 'FunctionExpression'
    ) ||

    node.type === 'BlockStatement' ||
    node.type === 'ClassDeclaration' ||
    node.type === 'DoWhileStatement' ||
    node.type === 'ForInStatement' ||
    node.type === 'ForOfStatement' ||
    node.type === 'ForStatement' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'IfStatement' ||
    node.type === 'LabeledStatement' ||
    node.type === 'MethodDefinition' ||
    node.type === 'SwitchStatement' ||
    node.type === 'TryStatement' ||
    node.type === 'WhileStatement' ||
    node.type === 'WithStatement'
  );
}

module.exports = printArrayOfStatements;
