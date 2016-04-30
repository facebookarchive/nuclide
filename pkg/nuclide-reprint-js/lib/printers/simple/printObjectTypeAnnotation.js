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
import type {ObjectTypeAnnotation} from 'ast-types-flow';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printObjectTypeAnnotation(
  print: Print,
  node: ObjectTypeAnnotation,
): Lines {
  return flatten([
    '{',
    markers.openScope,
    markers.scopeIndent,
    markers.scopeBreak,
    node.properties.map((p, i, arr) => [
      print(p),
      i === arr.length - 1 ? markers.scopeComma : ',',
      i === arr.length - 1 ? markers.scopeBreak : markers.scopeSpaceBreak,
    ]),
    markers.scopeDedent,
    markers.closeScope,
    '}',
  ]);
}

module.exports = printObjectTypeAnnotation;
