'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BlockStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import printArrayOfStatements from '../common/printArrayOfStatements';
import printComments from '../common/printComments';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printBlockStatement(print: Print, node: BlockStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([
    '{',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    printComments(node.innerComments),
    printArrayOfStatements(print, node.body),
    markers.scopeBreak,
    markers.scopeDedent,
    markers.closeScope,
    '}',
  ]);
}

module.exports = printBlockStatement;
