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
import type {ObjectPattern} from 'ast-types-flow';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printObjectPattern(print: Print, node: ObjectPattern): Lines {
  return flatten([
    '{',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    node.properties.map((propNode, i, arr) => [
      print(propNode),
      i === arr.length - 1 ? markers.scopeComma : ',',
      i === arr.length - 1 ? markers.scopeBreak : markers.scopeSpaceBreak,
    ]),
    markers.scopeDedent,
    markers.closeScope,
    '}',
  ]);
}

module.exports = printObjectPattern;
