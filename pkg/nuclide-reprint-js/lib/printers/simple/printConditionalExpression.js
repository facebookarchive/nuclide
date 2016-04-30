'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ConditionalExpression} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printConditionalExpression(
  print: Print,
  node: ConditionalExpression,
): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    markers.openScope,
    markers.scopeIndent,
    print(node.test),
    markers.scopeSpaceBreak,
    '?',
    markers.noBreak,
    markers.space,
    print(node.consequent),
    markers.scopeSpaceBreak,
    ':',
    markers.noBreak,
    markers.space,
    print(node.alternate),
    markers.scopeDedent,
    markers.closeScope,
  ]);
}

module.exports = printConditionalExpression;
