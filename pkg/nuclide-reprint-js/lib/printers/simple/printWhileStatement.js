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
import type {WhileStatement} from 'ast-types-flow';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printWhileStatement(print: Print, node: WhileStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([
    markers.hardBreak,
    'while (',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    print(node.test),
    markers.scopeBreak,
    markers.scopeDedent,
    markers.closeScope,
    ')',
    markers.space,
    print(node.body),
  ]);
}

module.exports = printWhileStatement;
