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
import type {ObjectExpression} from 'ast-types-flow';

var markers = require('../../constants/markers');
var wrapExpression = require('../../wrappers/simple/wrapExpression');

function printObjectExpression(print: Print, node: ObjectExpression): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    '{',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    node.properties.map((node, i, arr) => [
      print(node),
      i === arr.length - 1 ? markers.scopeComma : ',',
      i === arr.length - 1 ? markers.scopeBreak : markers.scopeSpaceBreak,
    ]),
    markers.scopeDedent,
    markers.closeScope,
    '}',
  ]);
}

module.exports = printObjectExpression;
