'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AssignmentExpression} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printAssignmentExpression(
  print: Print,
  node: AssignmentExpression,
): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    print(node.left),
    markers.noBreak,
    markers.space,
    node.operator,
    markers.noBreak,
    markers.space,
    print(node.right),
  ]);
}

module.exports = printAssignmentExpression;
