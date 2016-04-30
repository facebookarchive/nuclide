'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BinaryExpression} from 'ast-types-flow';
import type {Context, Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printBinaryExpression(
  print: Print,
  node: BinaryExpression,
  context: Context,
): Lines {
  const path = context.path;
  let needsScope = true;
  for (let i = path.size - 1; i >= 0; i--) {
    const curr = path.get(i);
    /**
     * Traverse the path until we see the first logical expression. If it has
     * the same kind of operator we do not need to open a new scope. If it has
     * a different kind of operator we force it into a new scope.
     */
    if (curr.type === 'BinaryExpression') {
      needsScope = curr.operator !== node.operator;
      break;
    }
  }

  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    needsScope
      ? [markers.openScope, markers.scopeIndent, markers.scopeBreak]
      : markers.empty,
    print(node.left),
    markers.noBreak,
    markers.space,
    node.operator,
    markers.scopeSpaceBreak,
    print(node.right),
    needsScope
      ? [markers.scopeBreak, markers.scopeDedent, markers.closeScope]
      : markers.empty,
  ]);
}

module.exports = printBinaryExpression;
