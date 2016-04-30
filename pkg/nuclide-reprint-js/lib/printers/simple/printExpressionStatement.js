'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExpressionStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printExpressionStatement(
  print: Print,
  node: ExpressionStatement,
): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([
    print(node.expression),
    markers.noBreak,
    ';',
  ]);
}

module.exports = printExpressionStatement;
