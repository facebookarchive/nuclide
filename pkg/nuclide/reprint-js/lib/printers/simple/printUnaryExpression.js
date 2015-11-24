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
import type {UnaryExpression} from 'ast-types-flow';

const markers = require('../../constants/markers');
const wrapExpression = require('../../wrappers/simple/wrapExpression');

function printUnaryExpression(print: Print, node: UnaryExpression): Lines {
  const wrap = x => wrapExpression(print, node, x);

  const hasSpace = (
    node.operator === 'typeof' ||
    node.operator === 'void' ||
    node.operator === 'delete'
  );

  const parts = [node.operator];
  if (hasSpace) {
    parts.push(markers.noBreak);
    parts.push(markers.space);
  }

  return wrap([
    parts,
    print(node.argument),
  ]);
}

module.exports = printUnaryExpression;
