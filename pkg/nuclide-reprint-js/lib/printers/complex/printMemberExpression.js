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
import type {MemberExpression} from 'ast-types-flow';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printMemberExpression(
  print: Print,
  node: MemberExpression,
  context: Context,
): Lines {
  const wrap = x => wrapExpression(print, node, x);

  if (node.computed) {
    return wrap([
      print(node.object),
      '[',
      markers.openScope,
      markers.scopeIndent,
      markers.scopeBreak,
      print(node.property),
      markers.scopeBreak,
      markers.scopeDedent,
      markers.closeScope,
      ']',
    ]);
  } else {
    return wrap([
      print(node.object),
      '.',
      print(node.property),
    ]);
  }
}

module.exports = printMemberExpression;
