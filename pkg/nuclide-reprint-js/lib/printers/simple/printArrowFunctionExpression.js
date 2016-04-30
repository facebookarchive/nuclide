'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ArrowFunctionExpression} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import printCommaSeparatedNodes from '../common/printCommaSeparatedNodes';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printArrowFunctionExpression(
  print: Print,
  node: ArrowFunctionExpression,
): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    '(',
    printCommaSeparatedNodes(print, node.params),
    ') =>',
    markers.noBreak,
    markers.space,
    print(node.body),
    markers.noBreak,
  ]);
}

module.exports = printArrowFunctionExpression;
