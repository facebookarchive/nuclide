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
import type {YieldExpression} from 'ast-types-flow';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printYieldExpression(print: Print, node: YieldExpression): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    'yield',
    node.delegate ? '*' : markers.empty,
    markers.noBreak,
    markers.space,
    print(node.argument),
  ]);
}

module.exports = printYieldExpression;
