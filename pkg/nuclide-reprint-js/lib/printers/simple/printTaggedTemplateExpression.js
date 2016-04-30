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
import type {TaggedTemplateExpression} from 'ast-types-flow';

import markers from '../../constants/markers';
import wrapExpression from '../../wrappers/simple/wrapExpression';

function printTaggedTemplateExpression(
  print: Print,
  node: TaggedTemplateExpression,
): Lines {
  const wrap = x => wrapExpression(print, node, x);
  return wrap([
    print(node.tag),
    markers.noBreak,
    print(node.quasi),
  ]);
}

module.exports = printTaggedTemplateExpression;
