'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AwaitExpression} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printAwaitExpression(print: Print, node: AwaitExpression): Lines {
  const wrap = x => wrapExpression(print, node, x);
  // TODO: What is node.all?
  return wrap([
    'await',
    markers.noBreak,
    markers.space,
    print(node.argument),
  ]);
}

module.exports = printAwaitExpression;
