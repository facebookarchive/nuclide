'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DoWhileStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printDoWhileStatement(print: Print, node: DoWhileStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([
    markers.hardBreak,
    'do',
    markers.noBreak,
    markers.space,
    print(node.body),
    markers.noBreak,
    markers.space,
    'while (',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    print(node.test),
    markers.scopeBreak,
    markers.scopeDedent,
    markers.closeScope,
    ');',
  ]);
}

module.exports = printDoWhileStatement;
