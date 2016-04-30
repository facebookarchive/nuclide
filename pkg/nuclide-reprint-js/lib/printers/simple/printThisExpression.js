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
import type {ThisExpression} from 'ast-types-flow';

import wrapExpression from '../../wrappers/simple/wrapExpression';

function printThisExpression(print: Print, node: ThisExpression): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap(['this']);
}

module.exports = printThisExpression;
