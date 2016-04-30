'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Context, Lines, Print} from '../../types/common';
import type {FunctionExpression} from 'ast-types-flow';

import markers from '../../constants/markers';
import printCommaSeparatedNodes from '../common/printCommaSeparatedNodes';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printFunctionExpression(
  print: Print,
  node: FunctionExpression,
  context: Context,
): Lines {
  const wrap = x => wrapExpression(print, node, x);
  const last = context.path.last();

  let parts = [];
  if (last && last.type === 'MethodDefinition') {
    // Method definitions don't have the function keyword.
  } else if (last && last.type === 'Property' && last.method) {
    // Properties that are methods don't use the function keyword.
  } else {
    parts = parts.concat([
      node.async ? ['async', markers.space, markers.noBreak] : markers.empty,
      'function',
      node.generator ? '*' : markers.empty,
      markers.noBreak,
    ]);
  }

  if (node.id) {
    const id = node.id;
    parts = parts.concat([
      markers.space,
      print(id),
    ]);
  }

  parts = parts.concat([
    node.typeParameters
      ? [markers.noBreak, print(node.typeParameters)]
      : markers.empty,
    markers.noBreak,
    '(',
    printCommaSeparatedNodes(print, node.params),
    ')',
    node.returnType ? print(node.returnType) : markers.empty,
    markers.space,
    print(node.body),
    // This is to squash any breaks from the body.
    markers.noBreak,
    '',
  ]);

  return wrap(parts);
}

module.exports = printFunctionExpression;
