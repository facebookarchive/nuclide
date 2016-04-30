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
import type {UpdateExpression} from 'ast-types-flow';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printUpdateExpression(print: Print, node: UpdateExpression): Lines {
  const wrap = x => wrapExpression(print, node, x);
  if (node.prefix) {
    return wrap([
      node.operator,
      markers.noBreak,
      print(node.argument),
    ]);
  } else {
    return wrap([
      print(node.argument),
      markers.noBreak,
      node.operator,
    ]);
  }
}

module.exports = printUpdateExpression;
