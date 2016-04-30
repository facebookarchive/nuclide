'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {IfStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printIfStatement(print: Print, node: IfStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);

  let parts = [
    markers.hardBreak,
    'if (',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    print(node.test),
    markers.scopeBreak,
    markers.scopeDedent,
    markers.closeScope,
    ') ',
    print(node.consequent),
  ];

  if (node.alternate) {

    parts = parts.concat([
      markers.noBreak,
      ' else ',
      markers.noBreak,
      print(node.alternate),
    ]);
  }

  return wrap(parts);
}

module.exports = printIfStatement;
