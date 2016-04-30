'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CallExpression} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import printCommaSeparatedNodes from '../common/printCommaSeparatedNodes';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printCallExpression(print: Print, node: CallExpression): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    print(node.callee),
    markers.noBreak,
    '(',
    printCommaSeparatedNodes(print, node.arguments),
    ')',
  ]);
}

module.exports = printCallExpression;
