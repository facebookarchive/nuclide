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
import type {SwitchStatement} from 'ast-types-flow';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printSwitchStatement(print: Print, node: SwitchStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);
  return wrap([
    markers.hardBreak,
    'switch (',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    print(node.discriminant),
    markers.scopeBreak,
    markers.scopeDedent,
    markers.closeScope,
    ') {',
    markers.hardBreak,
    markers.indent,
    node.cases.map(caseNode => print(caseNode)),
    markers.noBreak, // Squash the last breaks.
    '',
    markers.dedent,
    markers.hardBreak,
    '}',
  ]);
}

module.exports = printSwitchStatement;
