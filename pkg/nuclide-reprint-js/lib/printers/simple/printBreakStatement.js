'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BreakStatement} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import wrapStatement from '../../wrappers/simple/wrapStatement';

function printBreakStatement(print: Print, node: BreakStatement): Lines {
  const wrap = x => wrapStatement(print, node, x);

  let parts = ['break'];
  if (node.label) {
    const label = node.label;
    parts = parts.concat([
      ':',
      markers.noBreak,
      markers.space,
      print(label),
    ]);
  }
  return wrap([
    parts,
    markers.noBreak,
    ';',
  ]);
}

module.exports = printBreakStatement;
